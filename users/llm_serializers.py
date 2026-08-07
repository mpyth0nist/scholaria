"""
LLM-friendly serializer for the users app.

Design principles:
  - No password field (write-only already, but explicit here).
  - No birth_date — PII that an LLM doesn't need and shouldn't be sent
    to external LLM APIs.
  - Courses are summarised with names only, not full nested objects,
    to avoid deep nesting and token waste.
  - Role is preserved — the LLM needs to know whether it's talking
    about a teacher or a student.
"""

from rest_framework import serializers
from .models import CustomUser


class LLMUserSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    courses_taught_names = serializers.SerializerMethodField()
    enrolled_course_names = serializers.SerializerMethodField()
    course_count = serializers.SerializerMethodField()

    def get_display_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

    def get_courses_taught_names(self, obj):
        if obj.role != 'Teacher':
            return None
        return list(obj.courses_taught.values_list('course_name', flat=True))

    def get_enrolled_course_names(self, obj):
        if obj.role != 'Student':
            return None
        return list(obj.student_courses.values_list('course_name', flat=True))

    def get_course_count(self, obj):
        if obj.role == 'Teacher':
            return obj.courses_taught.count()
        if obj.role == 'Student':
            return obj.student_courses.count()
        return None

    class Meta:
        model = CustomUser
        # Deliberately excludes: password, birth_date (PII), email (PII unless needed)
        fields = [
            'id', 'username', 'display_name', 'role',
            'course_count', 'courses_taught_names', 'enrolled_course_names',
        ]
