from logging import getLogger

from django.db.models import Q
from django.http import StreamingHttpResponse
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.models import Course
from rag.rag import ServiceUnavailable, llm
from scholaria.throttles import LLMRateThrottle
from django.conf import settings

logger = getLogger(__name__)

class RAGAnswerView(APIView):

    permission_classes = [IsAuthenticated]
    throttle_classes = [LLMRateThrottle]

    def post(self, request):
        query = request.data.get('query')
        conversation_id = request.data.get('conversation_id')
        lesson_id = request.data.get('lesson_id')

        if not query:
            return Response({'error': 'query is required'}, status=400)

        user = self.request.user
        if user.role.lower() == 'student':
            courses_ids = list(Course.objects.filter(
                Q(student=user) | Q(student_classes__students=user)
            ).distinct().values_list('id', flat=True))
        elif user.role.lower() == 'teacher':
            courses_ids = list(Course.objects.filter(teacher=user).distinct().values_list('id', flat=True))
        else:
            raise PermissionDenied('You are neither a teacher nor a student')

        try:
            stream_gen, conv_id = llm(query, courses_ids, settings.DEFAULT_LLM_MODEL, user=user, conversation_id=conversation_id, lesson_id=lesson_id)
        except ValueError as e:
            logger.warning('No relevant context found for query')
            return Response({'answer': e.args[0]}, status=404)
        except ServiceUnavailable:
            logger.exception('Groq API unavailable')
            return Response({'error': 'AI service is temporarily unavailable'}, status=503)

        response = StreamingHttpResponse(stream_gen, content_type='text/plain')
        response['X-Conversation-Id'] = str(conv_id)
        response['Access-Control-Expose-Headers'] = 'X-Conversation-Id'
        return response

