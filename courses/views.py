from django.shortcuts import render
from .models import *
from rest_framework import generics
from .serializers import *

from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermissions
# Create your views here.

LOOKUP_FIELD = 'id'


def get_nested_attrs(obj, attrs):

    result = obj
    for attr in attrs:
        result = getattr(result, attr, None)
    
    return result


class isCourseTeacher(BasePermissions):
    
    lookup_field = 'author'

    def has_object_permissions(self, request, view, obj):

        course_teacher = get_nested_attrs(obj, lookup_field)

        if request.user in SAFE_METHODS:

            return True

        return course_teacher == self.request.user

class isModuleCourseTeacher(isCourseTeacher):

    lookup_field = 'course__author'

class isLessonModuleCourseTeacher(isCourseTeacher):

    lookup_field = 'module__course__author'


class isStudent(BasePermissions):

    def has_object_permissions(self, request, view, obj):

        user = self.request.user

        if request.user in SAFE_METHODS:

            return True

        return user.role == 'Student'

class CourseView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Course.objects.all()

    def perform_create(self, serializer):

        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)


class CourseDelete(generics.DestroyAPIView):
    queryset = Course.objects.all()
    lookup_field = LOOKUP_FIELD
    serializer_class = CourseSerializer
    permission_classes = [isCourseTeacher]


class CourseUpdate(generics.UpdateAPIView):

   queryset = Course.objects.all()
   serializer_class = CourseSerializer
   permission_classes = [isCourseTeacher]
   lookup_field = LOOKUP_FIELD


class ModuleList(generics.ListAPIView):
    module_course = Course.objects.get(id = self.kwargs['course_id'])

    queryset = Module.objects.filter(course=module_course)

class ModuleCreate(generics.CreateAPIView):
    module_course = Course.objects.get(id = self.kwargs['course_id'])
    permission_classes = [isModuleCourseTeacher]
    queryset = Module.objects.get(course = module_course)

    serializer_class = ModuleSerializer

    def perform_create(self, serializer):
        
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)


class ModuleUpdate(generics.UpdateAPIView):
    queryset = Module.objects.all()
    permission_classes = [isModuleCourseTeacher]
    serializer_class = ModuleSerializer
    lookup_field = LOOKUP_FIELD

class ModuleDelete(generics.DestroyAPIView):
    lookup_field = LOOKUP_FIELD
    permission_classes = [isModuleCourseTeacher]
    def get_queryset(self):

        return Module.objects.all()

class LessonList(generics.ListAPIView):
    linked_module = Module.objects.get(self.kwargs['module_id'])
    queryset = Lesson.objects.filter(module=linked_module)

class LessonCreate(generics.Create):
    linked_module = Module.objects.get(self.kwargs['module_id'])
    permission_classes = [isLessonModuleCourseTeacher]
    def get_queryset(self):
        
        return Lesson.objects.filter(module = linked_module)
    
    def perform_create(self, serializer):

        if serializer.is_valid():
            serializer.save()
            
        else:
            print(serializer.errors)

class LessonUpdate(generics.UpdateAPIView):

    queryset = Lesson.objects.all()
    permission_classes = [isLessonModuleCourseTeacher]
    serializer_class = LessonSerializer
    
    lookup_field = LOOKUP_FIELD


class LessonDelete(generics.DestroyAPIView):

    queryset = Lesson.objects.all()
    permission_classes = [isLessonModuleCourseTeacher]
    lookup_field = LOOKUP_FIELD

