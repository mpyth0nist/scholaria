from .models import Course, Module, Lesson, StudentClass, UserLessonProgress
from rest_framework import serializers

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
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if request.user.role == 'Teacher':
                # For teachers, or to not break existing flow, we could just return True or False.
                # Actually, the teacher doesn't 'complete' lessons that they create.
                # Let's just fall back to False or the original obj.done. However, obj.done is broken.
                return False
            return UserLessonProgress.objects.filter(student=request.user, lesson=obj).exists()
        return False

    class Meta:

        model = Lesson
        fields = ['id', 'title', 'content', 'attachments', 'video', 'done', 'module_title']


 

class ModuleSerializer(serializers.ModelSerializer):
    #lesson_module = LessonSerializer(many=True)
    done = serializers.SerializerMethodField()
    
    def get_done(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'Student':
            lessons = obj.lesson_module.all()
            if not lessons.exists():
                return False
            completed_lessons = UserLessonProgress.objects.filter(student=request.user, lesson__in=lessons).count()
            return completed_lessons == lessons.count()
        return False

    class Meta:

        model = Module
        fields = ['id','title','course', 'order','done']

class CourseSerializer(serializers.ModelSerializer):

    #module_course = ModuleSerializer(many=True)
    done = serializers.SerializerMethodField()

    def get_done(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'Student':
            lessons = Lesson.objects.filter(module__course=obj)
            if not lessons.exists():
                return False
            completed_lessons = UserLessonProgress.objects.filter(student=request.user, lesson__in=lessons).count()
            return completed_lessons == lessons.count()
        return False

    class Meta:
        model = Course
        fields = ['id','course_name', 'subject', 'description', 'thumbnail', 'published','teacher','student','student_classes','done']
        read_only_fields = ['teacher']









