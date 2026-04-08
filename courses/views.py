from django.shortcuts import render
from .models import *
from rest_framework import generics
from .serializers import *
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission, SAFE_METHODS
from rest_framework.exceptions import NotFound
from users.models import CustomUser
from django.db.models import Q
# Create your views here.

LOOKUP_FIELD = 'id'


# Helper Functions


def get_nested_attrs(obj, attrs):

    '''

    Returns the value of a nested attribute of an object.

    Args : 
        obj : the object to retrieve the attributes from.

        attrs : the list of attributes names (e.g Foreign Keys) 

    Returns : 

        The value of the last element of the attributes list (attrs), or None if it doesn't exist.


    '''

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


class isTeacher(BasePermission):
    
    def has_permission(self, request, view):
        user = request.user
        return user.role == 'Teacher'


class isStudent(BasePermission):

    def has_permission(self, request, view):

        user = request.user

        return user.role == 'Student'

class isCourseStudent(BasePermission):
    lookup_field = ['student']

    def has_object_permission(self, request, view, obj):
        course_students = get_nested_attrs(obj, self.lookup_field)

        return request.user in course_students



class CourseView(generics.ListAPIView):
    '''
    Lists courses for the authenticated user (teacher sees their courses, student sees enrolled courses).
    '''
    permission_classes = [IsAuthenticated]
    serializer_class = CourseSerializer
    def get_queryset(self):
        return Course.objects.filter(
            Q(teacher=self.request.user) | Q(student=self.request.user)
            ).distinct()

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
    permission_classes = [IsAuthenticated, isTeacher]    
    serializer_class = CourseSerializer

    def perform_create(self, serializer):

        if serializer.is_valid():
            serializer.save(teacher=self.request.user)
        else:
            print("failed")
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
    permission_classes = [isCourseTeacher]

    def perform_create(self, serializer):
        
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)


class ModuleUpdate(generics.UpdateAPIView):
    queryset = Module.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = ModuleSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'module_id'

class ModuleDelete(generics.DestroyAPIView):
    lookup_field = 'id'
    lookup_url_kwarg = 'module_id'
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Module.objects.all()

class LessonList(generics.ListAPIView):
    serializer_class = LessonSerializer
    def get_queryset(self):
        linked_module = Module.objects.get(id=self.kwargs['module_id'])

        lessons = Lesson.objects.filter(module=linked_module)
        return lessons



class LessonDetailView(generics.ListAPIView):

    serializer_class = LessonSerializer

    def get_queryset(self):

        return Lesson.objects.filter(id=self.kwargs['lesson_id'])
    





class LessonCreate(generics.CreateAPIView):

    permission_classes = [isTeacher]

    serializer_class = LessonSerializer


    def get_queryset(self):
        linked_module = Module.objects.get(id=self.kwargs['module_id'])

        return Lesson.objects.filter(module = linked_module)
    
    def perform_create(self, serializer):

        try:
            linked_module = Module.objects.get(id=self.kwargs['module_id'])

            serializer.save(module=linked_module)

        except Module.DoesNotExist:

            raise NotFound(f"Module with id {self.kwargs['module_id']} does not exist")

        except Exception as e:

            print(e)

            raise






class LessonUpdate(generics.UpdateAPIView):
    queryset = Lesson.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = LessonSerializer
    lookup_url_kwarg = 'lesson_id'
    lookup_field = LOOKUP_FIELD

    def perform_update(self, serializer):
        lesson = serializer.save()

        # Cascade: if lesson marked done, check whether the whole module is complete
        if lesson.done:
            module = lesson.module
            if not module.lesson_module.filter(done=False).exists():
                module.done = True
                module.save(update_fields=['done'])

                # Cascade further: check whether all modules in the course are complete
                course = module.course
                if not course.module_course.filter(done=False).exists():
                    course.done = True
                    course.save(update_fields=['done'])
class LessonDelete(generics.DestroyAPIView):

    queryset = Lesson.objects.all()
    permission_classes = [isCourseTeacher]
    lookup_field = LOOKUP_FIELD
    lookup_url_kwarg = 'lesson_id'
