import logging

from django.shortcuts import get_object_or_404
from django.db.models import Q, Prefetch
from rest_framework import generics, status
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated, BasePermission, SAFE_METHODS
from rest_framework.response import Response
from rest_framework.views import APIView

from users.models import CustomUser
from .models import Course, Module, Lesson, StudentClass, UserLessonProgress
from .serializers import (
    CourseSerializer, ModuleSerializer, LessonSerializer, StudentClassSerializer
)

logger = logging.getLogger(__name__)

LOOKUP_FIELD = 'id'


# ── Helper ────────────────────────────────────────────────────────────────────

def get_nested_attrs(obj, attrs):
    '''
    Returns the value of a nested attribute of an object.

    Args:
        obj   : the object to retrieve the attributes from.
        attrs : the list of attribute names (e.g. Foreign Keys)

    Returns:
        The value of the last element of attrs, or None if it doesn't exist.
    '''
    result = obj
    for attr in attrs:
        result = getattr(result, attr, None)
    return result


# ── Permission classes ────────────────────────────────────────────────────────

class isCourseTeacher(BasePermission):

    lookup_field = ['teacher']

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        course_teacher = get_nested_attrs(obj, self.lookup_field)
        if request.method in SAFE_METHODS:
            return True
        return course_teacher == request.user


class isModuleTeacher(isCourseTeacher):
    lookup_field = ['course', 'teacher']


class isLessonTeacher(isCourseTeacher):
    lookup_field = ['module', 'course', 'teacher']


class isTeacher(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'Teacher'


class isStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'Student'


class isCourseStudent(BasePermission):
    lookup_field = ['student']

    def has_object_permission(self, request, view, obj):
        course_students = get_nested_attrs(obj, self.lookup_field)
        return request.user in course_students


# ── Student class views ───────────────────────────────────────────────────────

class StudentClassList(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = StudentClass.objects.all()
    serializer_class = StudentClassSerializer


class StudentClassCreate(generics.CreateAPIView):
    permission_classes = [IsAuthenticated, isTeacher]
    serializer_class = StudentClassSerializer


class StudentClassUpdate(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated, isTeacher]
    queryset = StudentClass.objects.all()
    serializer_class = StudentClassSerializer
    lookup_field = 'id'


class StudentClassDelete(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated, isTeacher]
    queryset = StudentClass.objects.all()
    lookup_field = 'id'


# ── Course views ──────────────────────────────────────────────────────────────

class CourseView(generics.ListAPIView):
    '''
    Lists courses for the authenticated user
    (teacher sees their courses, student sees enrolled courses).
    '''
    permission_classes = [IsAuthenticated]
    serializer_class = CourseSerializer

    def get_queryset(self):
        return Course.objects.filter(
            Q(teacher=self.request.user) | Q(student=self.request.user)
        ).distinct()


class CourseDetailView(generics.RetrieveAPIView):
    '''Returns a single course object (not a list).'''
    permission_classes = [IsAuthenticated]
    serializer_class = CourseSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'course_id'

    def get_queryset(self):
        return Course.objects.filter(
            Q(teacher=self.request.user) | Q(student=self.request.user)
        ).distinct()


class CourseCreate(generics.CreateAPIView):
    '''
    Creates a new Course.
    → IsAuthenticated: checks if the user is authenticated
    → isTeacher: checks if the authenticated user has the role 'Teacher'.
    '''
    permission_classes = [IsAuthenticated, isTeacher]
    serializer_class = CourseSerializer

    def perform_create(self, serializer):
        course = serializer.save(teacher=self.request.user)
        for student_class in course.student_classes.all():
            course.student.add(*student_class.students.all())


class CourseDelete(generics.DestroyAPIView):
    queryset = Course.objects.all()
    lookup_field = LOOKUP_FIELD
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, isTeacher, isCourseTeacher]


class CourseUpdate(generics.UpdateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, isTeacher, isCourseTeacher]
    lookup_field = LOOKUP_FIELD

    def perform_update(self, serializer):
        course = serializer.save()
        for student_class in course.student_classes.all():
            course.student.add(*student_class.students.all())


# ── Module views ──────────────────────────────────────────────────────────────

class ModuleList(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ModuleSerializer

    def get_queryset(self):
        module_course = get_object_or_404(Course, id=self.kwargs['course_id'])
        user = self.request.user
        # Prefetch lessons and their progress in a single extra query each,
        # preventing N+1 inside ModuleSerializer.get_done()
        return Module.objects.filter(course=module_course).prefetch_related(
            'lesson_module',
            Prefetch(
                'lesson_module__user_progress',
                queryset=UserLessonProgress.objects.filter(student=user),
                to_attr='_student_progress',
            ),
        )


class ModuleCreate(generics.CreateAPIView):
    permission_classes = [IsAuthenticated, isCourseTeacher]
    serializer_class = ModuleSerializer

    def perform_create(self, serializer):
        serializer.save()


class ModuleUpdate(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated, isTeacher]
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'module_id'


class ModuleDelete(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated, isTeacher]
    lookup_field = 'id'
    lookup_url_kwarg = 'module_id'

    def get_queryset(self):
        return Module.objects.all()


# ── Lesson views ──────────────────────────────────────────────────────────────

class LessonList(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LessonSerializer

    def get_queryset(self):
        linked_module = get_object_or_404(Module, id=self.kwargs['module_id'])
        user = self.request.user
        # Prefetch per-student progress to avoid an N+1 query in LessonSerializer.get_done()
        return Lesson.objects.filter(module=linked_module).prefetch_related(
            Prefetch(
                'user_progress',
                queryset=UserLessonProgress.objects.filter(student=user),
                to_attr='_student_progress',
            )
        )


class LessonDetailView(generics.RetrieveAPIView):
    '''Returns a single lesson object (not a list).'''
    permission_classes = [IsAuthenticated]
    serializer_class = LessonSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'lesson_id'

    def get_queryset(self):
        user = self.request.user
        return Lesson.objects.filter(
            Q(module__course__teacher=user) | Q(module__course__student=user)
        ).distinct().prefetch_related(
            Prefetch(
                'user_progress',
                queryset=UserLessonProgress.objects.filter(student=user),
                to_attr='_student_progress',
            )
        )


class LessonCreate(generics.CreateAPIView):
    permission_classes = [IsAuthenticated, isTeacher]
    serializer_class = LessonSerializer

    def perform_create(self, serializer):
        try:
            linked_module = Module.objects.get(id=self.kwargs['module_id'])
            serializer.save(module=linked_module)
        except Module.DoesNotExist:
            raise NotFound(f"Module with id {self.kwargs['module_id']} does not exist")
        except Exception:
            logger.exception("Unexpected error while creating lesson")
            raise


class LessonUpdate(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated, isTeacher]
    queryset = Lesson.objects.all()
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
    permission_classes = [IsAuthenticated, isLessonTeacher]
    queryset = Lesson.objects.all()
    lookup_field = LOOKUP_FIELD
    lookup_url_kwarg = 'lesson_id'


class LessonMarkRead(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)
        UserLessonProgress.objects.get_or_create(student=request.user, lesson=lesson)
        return Response({"status": "marked as read"}, status=status.HTTP_200_OK)
