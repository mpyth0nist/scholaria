from .models import Course, Module, Lesson
from rest_framework import serializers

class CourseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Course
        fields = ['id','course_name', 'subject', 'description', 'thumbnail', 'published','teacher','student']


class ModuleSerializer(serializers.ModelSerializer):

    class Meta:

        model = Module
        fields = ['id','title','course', 'order']


class LessonSerializer(serializers.ModelSerializer):

    class Meta:

        model = Lesson
        fields = ['id','title', 'content', 'attachments', 'video']