from .models import Course, Module, Lesson
from rest_framework import serializers


class LessonSerializer(serializers.ModelSerializer):

    class Meta:

        model = Lesson
        fields = ['id','title', 'content', 'attachments', 'video']




class ModuleSerializer(serializers.ModelSerializer):
    #lesson_module = LessonSerializer(many=True)
    class Meta:

        model = Module
        fields = ['id','title','course', 'order','done']



class CourseSerializer(serializers.ModelSerializer):

    #module_course = ModuleSerializer(many=True)

    class Meta:
        model = Course
        fields = ['id','course_name', 'subject', 'description', 'thumbnail', 'published','teacher','student','done']









