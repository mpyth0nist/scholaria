from urllib.parse import urlparse

from rest_framework import serializers
from .models import Course, Module, Lesson, StudentClass, UserLessonProgress


def relative_url(absolute_or_relative):
    """
    Strip the scheme+host from a URL so the frontend controls the base URL.
    e.g. 'http://127.0.0.1:8000/media/x.jpg' → '/media/x.jpg'
         '/media/x.jpg'                        → '/media/x.jpg'
    """
    if not absolute_or_relative:
        return None
    parsed = urlparse(absolute_or_relative)
    # If it already has no scheme it's already relative — return as-is
    if not parsed.scheme:
        return absolute_or_relative
    path = parsed.path
    if parsed.query:
        path += f"?{parsed.query}"
    return path


class StudentClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentClass
        fields = ['id', 'name', 'students']


class LessonSerializer(serializers.ModelSerializer):
    module_title = serializers.SerializerMethodField()
    done = serializers.SerializerMethodField()

    def get_module_title(self, obj):
        return obj.module.title if obj.module else None

    def get_done(self, obj):
        """
        True if the requesting student has completed this lesson.

        When the queryset is annotated with a `_student_progress` prefetch
        (see LessonList and LessonDetailView), this reads from the prefetched
        cache — zero extra DB queries. Falls back to a live query only when
        the serializer is used outside those views.
        """
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        if request.user.role == 'Teacher':
            return False

        # Fast path: prefetch_related already loaded progress into this attr
        if hasattr(obj, '_student_progress'):
            return len(obj._student_progress) > 0

        # Fallback (e.g. serializer used without prefetch)
        return UserLessonProgress.objects.filter(
            student=request.user, lesson=obj
        ).exists()

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if ret.get('attachments'):
            ret['attachments'] = relative_url(ret['attachments'])
        if ret.get('video'):
            ret['video'] = relative_url(ret['video'])
        return ret

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'attachments', 'video', 'done', 'module_title']


class ModuleSerializer(serializers.ModelSerializer):
    done = serializers.SerializerMethodField()

    def get_done(self, obj):
        """
        True if the requesting student has completed every lesson in this module.

        Reads from the `_student_progress` prefetch attr set by ModuleList —
        no extra queries. Falls back to a live query when used elsewhere.
        """
        request = self.context.get('request')
        if not request or not request.user.is_authenticated or request.user.role != 'Student':
            return False

        lessons = list(obj.lesson_module.all())
        if not lessons:
            return False

        # Fast path: progress was prefetched onto each lesson by ModuleList
        if hasattr(lessons[0], '_student_progress'):
            return all(len(lesson._student_progress) > 0 for lesson in lessons)

        # Fallback
        completed = UserLessonProgress.objects.filter(
            student=request.user, lesson__in=lessons
        ).count()
        return completed == len(lessons)

    class Meta:
        model = Module
        fields = ['id', 'title', 'course', 'order', 'done']


class CourseSerializer(serializers.ModelSerializer):
    done = serializers.SerializerMethodField()
    thumbnail = serializers.ImageField(required=False, allow_null=True)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if ret.get('thumbnail'):
            ret['thumbnail'] = relative_url(ret['thumbnail'])
        return ret

    def get_done(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated or request.user.role != 'Student':
            return False
        lessons = Lesson.objects.filter(module__course=obj)
        if not lessons.exists():
            return False
        completed = UserLessonProgress.objects.filter(
            student=request.user, lesson__in=lessons
        ).count()
        return completed == lessons.count()

    class Meta:
        model = Course
        fields = [
            'id', 'course_name', 'subject', 'description',
            'thumbnail', 'published', 'teacher', 'student', 'student_classes', 'done',
        ]
        read_only_fields = ['teacher']
