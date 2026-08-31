from rest_framework import serializers
from .models import Course, Module, Lesson, StudentClass, UserLessonProgress

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

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'attachments', 'video', 'is_published', 'done', 'module_title']


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
        fields = ['id', 'title', 'course', 'order', 'is_published', 'done']


class CourseSerializer(serializers.ModelSerializer):
    done = serializers.SerializerMethodField()
    thumbnail = serializers.ImageField(required=False, allow_null=True)

    def get_done(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated or request.user.role != 'Student':
            return False

        # Fast path using prefetched nested relations
        if hasattr(obj, '_prefetched_modules'):
            total_lessons = 0
            completed_lessons = 0
            for module in obj._prefetched_modules:
                lessons = list(module.lesson_module.all())
                total_lessons += len(lessons)
                for lesson in lessons:
                    if hasattr(lesson, '_student_progress') and len(lesson._student_progress) > 0:
                        completed_lessons += 1
            if total_lessons == 0:
                return False
            return completed_lessons == total_lessons

        # Fallback
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
            'thumbnail', 'published', 'is_published', 'teacher', 'student', 'student_classes', 'done',
        ]
        read_only_fields = ['teacher']
