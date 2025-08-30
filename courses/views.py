from django.shortcuts import render
from .models import *
from rest_framework import generics
from .serializers import *
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission, SAFE_METHODS
from users.models import CustomUser
from django.db.models import Q
# Create your views here.

LOOKUP_FIELD = 'id'


# Helper Functions

def get_students(students):
    
    selected_students = []

    for student in students:

        full_name = student.split(" ")

        selected_student = CustomUser.objects.get(Q(first_name = full_name[0]) & Q(last_name = full_name[1])) 

        if selected_student != None:

            selected_students.append(selected_student)

    return selected_students

    


def get_nested_attrs(obj, attrs):

    result = obj
    for attr in attrs:
        result = getattr(result, attr, None)
    
    return result

class isCourseTeacher(BasePermission):
    
    lookup_field = ['teacher']

    def has_object_permission(self, request, view, obj):

        course_teacher = get_nested_attrs(obj, self.lookup_field)

        if request.method in SAFE_METHODS:

            return True

        return course_teacher == request.user


class isModuleCourseTeacher(isCourseTeacher):

    lookup_field = ['course', 'teacher']

class isLessonModuleCourseTeacher(isCourseTeacher):

    lookup_field = ['module', 'course', 'teacher']

class isTeacher(BasePermission):
    
    def has_permission(self, request, view):

        print('is teacher check called')
        user = request.user
        print(user.role)

        
        return user.role == 'Teacher'


class isStudent(BasePermission):

    def has_permission(self, request, view):

        user = request.user

        return user.role == 'Student'

class isCourseStudent(BasePermission):
    lookup_field = ['student']

    def has_object_permission(self, request, view, obj):
        course_students = get_nested_attrs(obj, self.lookup_field)
        print(course_students)
        print(request.user)
        return request.user in course_students



class CourseView(generics.ListAPIView):
    '''
    Shows a course content in details
    '''
    permission_classes = [IsAuthenticated, isCourseStudent]
    serializer_class = CourseSerializer
    def get_queryset(self):

        return Course.objects.filter(
            Q(teacher=self.request.user) | Q(student=self.request.user)
            )

class CourseDetailView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CourseSerializer

    def get_queryset(self):
        return Course.objects.filter(id= self.kwargs['course_id'])


class CourseCreate(generics.CreateAPIView):
    '''
    A view for creating a new Course:
    
    -> IsAuthenticated : checks if the user is authenticated

    -> isTeacher : checks if the authenticated user has the role 'Teacher'.

    '''
    permission_classes = [AllowAny]    
    serializer_class = CourseSerializer

    def perform_create(self, serializer):

        if serializer.is_valid():
            serializer.save(teacher=self.request.user)
        else:
            print(serializer.errors)


class CourseDelete(generics.DestroyAPIView):
    
    queryset = Course.objects.all()
    lookup_field = LOOKUP_FIELD
    serializer_class = CourseSerializer
    permission_classes = [isTeacher, isCourseTeacher]

class CourseUpdate(generics.UpdateAPIView):

   queryset = Course.objects.all()
   serializer_class = CourseSerializer
   permission_classes = [IsAuthenticated, isTeacher, isCourseTeacher]
   lookup_field = LOOKUP_FIELD

class ModuleList(generics.ListAPIView):
    serializer_class = ModuleSerializer
    def get_queryset(self):

        module_course = Course.objects.get(id = self.kwargs['course_id'])

        return Module.objects.filter(course=module_course)

class ModuleCreate(generics.CreateAPIView):
    serializer_class = ModuleSerializer
    permission_classes = [isModuleCourseTeacher]

    def perform_create(self, serializer):
        
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)


class ModuleUpdate(generics.UpdateAPIView):
    queryset = Module.objects.all()
    permission_classes = [isModuleCourseTeacher]
    serializer_class = ModuleSerializer
    lookup_field = 'module_id'

class ModuleDelete(generics.DestroyAPIView):
    lookup_field = 'id'
    lookup_url_kwarg = 'module_id'
    permission_classes = [isModuleCourseTeacher]
    
    def get_queryset(self):
        return Module.objects.all()

class LessonList(generics.ListAPIView):
    serializer_class = LessonSerializer
    def get_queryset(self):
        linked_module = Module.objects.get(id=self.kwargs['module_id'])

        lessons = Lesson.objects.filter(module=linked_module)

        print(lessons)
        return lessons



class LessonCreate(generics.CreateAPIView):

    permission_classes = [isTeacher]

    serializer_class = LessonSerializer


    def get_queryset(self):
        linked_module = Module.objects.get(id=self.kwargs['module_id'])

        return Lesson.objects.filter(module = linked_module)
    
    def perform_create(self, serializer):
        linked_module = Module.objects.get(id=self.kwargs['module_id'])


        print('passed as valid')
        serializer.save(module=linked_module)


class LessonUpdate(generics.UpdateAPIView):

    queryset = Lesson.objects.all()
    permission_classes = [isLessonModuleCourseTeacher]
    serializer_class = LessonSerializer
    lookup_url_kwarg = 'lesson_id'
    lookup_field = LOOKUP_FIELD


class LessonDelete(generics.DestroyAPIView):

    queryset = Lesson.objects.all()
    permission_classes = [isLessonModuleCourseTeacher]
    lookup_field = LOOKUP_FIELD
    lookup_url_kwarg = 'lesson_id'

