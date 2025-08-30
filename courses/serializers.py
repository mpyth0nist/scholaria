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

    def create(self, validated_data):
        #lessons_data = validated_data.pop('lesson_module')

        module = Module.objects.create(**validated_data)

        #for lesson in lessons_data:
         #   Lesson.objects.create(module=module, **lesson)

        return module

    def update(self, instance, validated_data):

        lesson_module = validated_data.pop('lesson_module')

        instance.title = validated_data.get('title', instance.title)
        instance.course = validated_data.get('course', instance.course)
        instance.order = validated_data.get('order', instance.order)
        
        instance.lesson_module.all().delete()

        for lesson in lessons:
            Lesson.objects.create(module=instance, **lesson)

        instance.save()


class CourseSerializer(serializers.ModelSerializer):

    #module_course = ModuleSerializer(many=True)

    class Meta:
        model = Course
        fields = ['id','course_name', 'subject', 'description', 'thumbnail', 'published','teacher','student','done']

    def create(self, validated_data):

        #modules_data = validated_data.pop('module_course')
        students_data = validated_data.pop('student')

        course = Course.objects.create(**validated_data)

        if students_data:
            course.student.set(students_data)

        #for module in modules_data:

            #Module.objects.create(course=course, **module)

        return course

    def update(self, instance, validated_data):

        modules_data = validated_data.get('module_course')

        instance.course_name = validated_data.get('course_name', instance.course_name)
        instance.subject = validated_data.get('subject', instance.subject)
        instance.description = validated_data.get('description', instance.description)
        instance.thumbnail = validated_data.get('thumbnail', instance.thumbnail)
        instance.published = validated_data.get('published', instance.published)
        instance.done = validated_data.get('done', instance.done)

        instance.module_course.all().delete()

        for module in modules_data:

            Module.objects.create(course=instance, **module)

        instance.save()






