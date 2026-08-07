"""
LLM-friendly serializers for the courses app.

Design principles:
  - No bare integer foreign-key IDs; expand them to human-readable names.
  - No binary/file URLs; replace with boolean has_* flags so the LLM knows
    the resource exists without receiving a meaningless path string.
  - No internal state fields (done, published) that are irrelevant to reasoning.
  - No PII beyond display names.
"""

from rest_framework import serializers
from .models import Course, Module, Lesson


class LLMLessonSerializer(serializers.ModelSerializer):
    has_attachment = serializers.SerializerMethodField()
    has_video = serializers.SerializerMethodField()

    def get_has_attachment(self, obj):
        return bool(obj.attachments)

    def get_has_video(self, obj):
        return bool(obj.video)

    class Meta:
        model = Lesson
        # 'content' is included — full text is the most valuable thing for an LLM
        fields = ['id', 'title', 'content', 'has_attachment', 'has_video']


class LLMModuleSerializer(serializers.ModelSerializer):
    lessons = LLMLessonSerializer(many=True, read_only=True, source='lesson_module')
    lesson_count = serializers.IntegerField(source='lesson_module.count', read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'title', 'order', 'lesson_count', 'lessons']


class LLMCourseSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    student_count = serializers.SerializerMethodField()
    modules = LLMModuleSerializer(many=True, read_only=True, source='module_course')

    def get_teacher_name(self, obj):
        t = obj.teacher
        return f"{t.first_name} {t.last_name}".strip() or t.username

    def get_student_count(self, obj):
        return obj.student.count()

    class Meta:
        model = Course
        fields = [
            'id', 'course_name', 'subject', 'description',
            'teacher_name', 'student_count', 'modules',
        ]


class LLMCourseSummarySerializer(serializers.ModelSerializer):
    """
    Lightweight course representation — no nested modules/lessons.
    Useful when listing many courses without blowing up the context window.
    """
    teacher_name = serializers.SerializerMethodField()
    student_count = serializers.SerializerMethodField()
    module_count = serializers.IntegerField(source='module_course.count', read_only=True)

    def get_teacher_name(self, obj):
        t = obj.teacher
        return f"{t.first_name} {t.last_name}".strip() or t.username

    def get_student_count(self, obj):
        return obj.student.count()

    class Meta:
        model = Course
        fields = [
            'id', 'course_name', 'subject', 'description',
            'teacher_name', 'student_count', 'module_count',
        ]
