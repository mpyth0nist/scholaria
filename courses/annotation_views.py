import hashlib
import logging

from django.conf import settings
from django.core.cache import cache
from django.db.models import Q
from django.http import StreamingHttpResponse
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.models import Course, Lesson, LessonAnnotation
from rag.rag import INLINE_ACTIONS, ServiceUnavailable, explain_selection
from scholaria.throttles import LLMRateThrottle

logger = logging.getLogger(__name__)

ANNOTATION_CACHE_TIMEOUT = 60 * 60 * 24 * 7  # 7 days


def _annotation_cache_key(lesson_id, selected_text, action, language):
    raw = f"{lesson_id}:{selected_text}:{action}:{language}"
    return "annotation:" + hashlib.sha256(raw.encode()).hexdigest()


def _get_user_courses_ids(user):
    """Mirror the enrollment logic from RAGAnswerView."""
    if user.role.lower() == 'student':
        return list(
            Course.objects.filter(
                Q(student=user) | Q(student_classes__students=user)
            ).distinct().values_list('id', flat=True)
        )
    elif user.role.lower() == 'teacher':
        return list(
            Course.objects.filter(teacher=user).distinct().values_list('id', flat=True)
        )
    raise PermissionDenied('You are neither a teacher nor a student.')


def _check_lesson_enrollment(user, lesson):
    """Return courses_ids if user can access this lesson, else raise 403."""
    courses_ids = _get_user_courses_ids(user)
    if lesson.module.course_id not in courses_ids:
        raise PermissionDenied('You are not enrolled in this course.')
    return courses_ids


class InlineExplainView(APIView):
    """POST /courses/lessons/<lesson_id>/explain/ — stream an LLM answer for a text selection."""

    permission_classes = [IsAuthenticated]
    throttle_classes = [LLMRateThrottle]

    def post(self, request, lesson_id):
        selected_text = request.data.get('selected_text', '').strip()
        surrounding_text = request.data.get('surrounding_text', '').strip()
        action = request.data.get('action', '').strip()
        language = request.data.get('language', 'en').strip()
        extra_question = request.data.get('extra_question', None)

        # Validate required fields
        if not selected_text:
            raise ValidationError({'selected_text': 'This field is required.'})
        if action not in INLINE_ACTIONS:
            raise ValidationError({'action': f"Must be one of {list(INLINE_ACTIONS)}."})

        lesson = Lesson.objects.select_related('module').filter(pk=lesson_id).first()
        if not lesson:
            return Response({'error': 'Lesson not found.'}, status=404)

        courses_ids = _check_lesson_enrollment(request.user, lesson)

        # Exact-match cache lookup
        cache_key = _annotation_cache_key(lesson_id, selected_text, action, language)
        cached_text = cache.get(cache_key)
        if cached_text:
            logger.debug('Annotation cache hit for key %s', cache_key)
            annotation_id = _get_cached_annotation_id(request.user, lesson, selected_text, action, language, cached_text)

            def cached_stream():
                yield cached_text

            response = StreamingHttpResponse(cached_stream(), content_type='text/plain')
            response['X-Annotation-Id'] = str(annotation_id)
            response['Access-Control-Expose-Headers'] = 'X-Annotation-Id'
            return response

        # Call LLM
        try:
            groq_stream = explain_selection(
                selected_text=selected_text,
                surrounding_text=surrounding_text,
                action=action,
                courses_ids=courses_ids,
                model_name=settings.DEFAULT_LLM_MODEL,
                lesson_id=lesson_id,
                extra_question=extra_question,
            )
        except ValueError as exc:
            raise ValidationError({'action': str(exc)})
        except ServiceUnavailable:
            logger.exception('Groq unavailable (inline explain)')
            return Response({'error': 'AI service is temporarily unavailable.'}, status=503)

        user = request.user

        def stream_and_save():
            parts = []
            for chunk in groq_stream:
                content = chunk.choices[0].delta.content
                if content:
                    parts.append(content)
                    yield content

            full_text = "".join(parts)
            # Save annotation
            annotation = LessonAnnotation.objects.create(
                user=user,
                lesson=lesson,
                selected_text=selected_text,
                action=action,
                language=language,
                response=full_text,
            )
            # Populate cache
            cache.set(cache_key, full_text, timeout=ANNOTATION_CACHE_TIMEOUT)
            # Emit annotation id as a trailing sentinel line so the client can capture it
            yield f"\n\nX-Annotation-Id:{annotation.id}"

        response = StreamingHttpResponse(stream_and_save(), content_type='text/plain')
        response['Access-Control-Expose-Headers'] = 'X-Annotation-Id'
        return response


def _get_cached_annotation_id(user, lesson, selected_text, action, language, response_text):
    """Return an existing annotation id (or create one) for a cache-hit scenario."""
    annotation, _ = LessonAnnotation.objects.get_or_create(
        user=user,
        lesson=lesson,
        selected_text=selected_text,
        action=action,
        language=language,
        defaults={'response': response_text},
    )
    return annotation.id


class LessonAnnotationListView(APIView):
    """GET /courses/lessons/<lesson_id>/annotations/ — list user's annotations for a lesson."""

    permission_classes = [IsAuthenticated]

    def get(self, request, lesson_id):
        lesson = Lesson.objects.select_related('module').filter(pk=lesson_id).first()
        if not lesson:
            return Response({'error': 'Lesson not found.'}, status=404)
        _check_lesson_enrollment(request.user, lesson)

        annotations = LessonAnnotation.objects.filter(
            user=request.user, lesson=lesson
        ).values('id', 'selected_text', 'action', 'language', 'response', 'pinned', 'created_at')
        return Response(list(annotations))


class AnnotationPinView(APIView):
    """PATCH /courses/annotations/<pk>/pin/ — toggle pinned status (owner only)."""

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        annotation = LessonAnnotation.objects.filter(pk=pk, user=request.user).first()
        if not annotation:
            return Response({'error': 'Not found.'}, status=404)
        annotation.pinned = not annotation.pinned
        annotation.save(update_fields=['pinned'])
        return Response({'id': annotation.id, 'pinned': annotation.pinned})


class AnnotationDeleteView(APIView):
    """DELETE /courses/annotations/<pk>/ — delete annotation (owner only)."""

    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        annotation = LessonAnnotation.objects.filter(pk=pk, user=request.user).first()
        if not annotation:
            return Response({'error': 'Not found.'}, status=404)
        annotation.delete()
        return Response(status=204)
