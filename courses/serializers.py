from .models import Course, Module, Lesson, StudentClass
from rest_framework import serializers

class StudentClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentClass
        fields = ['id', 'name', 'students']



class LessonSerializer(serializers.ModelSerializer):

    module_title = serializers.SerializerMethodField()

    def get_module_title(self, obj):
        return obj.module.title if obj.module else None

    class Meta:

        model = Lesson
        fields = ['id', 'title', 'content', 'attachments', 'video', 'done', 'module_title']


 

class ModuleSerializer(serializers.ModelSerializer):
    #lesson_module = LessonSerializer(many=True)
    class Meta:

        model = Module
        fields = ['id','title','course', 'order','done']



class CourseSerializer(serializers.ModelSerializer):

    #module_course = ModuleSerializer(many=True)

    class Meta:
        model = Course
        fields = ['id','course_name', 'subject', 'description', 'thumbnail', 'published','teacher','student','student_classes','done']
        read_only_fields = ['teacher']









