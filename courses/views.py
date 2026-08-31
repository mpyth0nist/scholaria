import logging

from django.shortcuts import get_object_or_404
from django.db.models import Q, Prefetch
from rest_framework import generics, status
from rest_framework.exceptions import NotFound, PermissionDenied
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




class isTeacher(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'Teacher'


class isStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'Student'


class isAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'ADMIN'
        )


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
    """Only admins may restructure student classes (no per-teacher ownership model)."""
    permission_classes = [IsAuthenticated, isAdmin]
    queryset = StudentClass.objects.all()
    serializer_class = StudentClassSerializer
    lookup_field = 'id'


class StudentClassDelete(generics.DestroyAPIView):
    """Only admins may delete student classes."""
    permission_classes = [IsAuthenticated, isAdmin]
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
        user = self.request.user
        return Course.objects.filter(
            Q(teacher=user) | Q(student=user)
        ).distinct().prefetch_related(
            Prefetch(
                'module_course',
                queryset=Module.objects.prefetch_related(
                    Prefetch(
                        'lesson_module',
                        queryset=Lesson.objects.prefetch_related(
                            Prefetch(
                                'user_progress',
                                queryset=UserLessonProgress.objects.filter(student=user),
                                to_attr='_student_progress'
                            )
                        )
                    )
                ),
                to_attr='_prefetched_modules'
            )
        )

class CourseDetailView(generics.RetrieveAPIView):
    '''Returns a single course object (not a list).'''
    permission_classes = [IsAuthenticated]
    serializer_class = CourseSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'course_id'

    def get_queryset(self):
        user = self.request.user
        return Course.objects.filter(
            Q(teacher=user) | Q(student=user)
        ).distinct().prefetch_related(
            Prefetch(
                'module_course',
                queryset=Module.objects.prefetch_related(
                    Prefetch(
                        'lesson_module',
                        queryset=Lesson.objects.prefetch_related(
                            Prefetch(
                                'user_progress',
                                queryset=UserLessonProgress.objects.filter(student=user),
                                to_attr='_student_progress'
                            )
                        )
                    )
                ),
                to_attr='_prefetched_modules'
            )
        )


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
        course.student.clear()
        for student_class in course.student_classes.all():
            course.student.add(*student_class.students.all())


# ── Module views ──────────────────────────────────────────────────────────────

class ModuleList(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ModuleSerializer

    def get_queryset(self):
        user = self.request.user
        # Enforce enrollment: teacher must own the course OR student must be enrolled
        module_course = get_object_or_404(
            Course,
            Q(teacher=user) | Q(student=user),
            id=self.kwargs['course_id'],
        )
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
    """
    Creates a module inside a course.
    → isTeacher: only teachers may create modules.
    → Ownership is verified explicitly: the requesting teacher must own the parent course.
      (isCourseTeacher uses has_object_permission which CreateAPIView never calls,
       so we enforce ownership manually in perform_create.)
    """
    permission_classes = [IsAuthenticated, isTeacher]
    serializer_class = ModuleSerializer

    def perform_create(self, serializer):
        course_id = self.request.data.get('course')
        course = get_object_or_404(Course, id=course_id)
        if course.teacher != self.request.user:
            raise PermissionDenied("You do not own this course.")
        serializer.save()


class ModuleUpdate(generics.UpdateAPIView):
    """Only the teacher who owns the parent course may update its modules."""
    permission_classes = [IsAuthenticated, isTeacher]
    serializer_class = ModuleSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'module_id'

    def get_queryset(self):
        return Module.objects.filter(course__teacher=self.request.user)


class ModuleDelete(generics.DestroyAPIView):
    """Only the teacher who owns the parent course may delete its modules."""
    permission_classes = [IsAuthenticated, isTeacher]
    lookup_field = 'id'
    lookup_url_kwarg = 'module_id'

    def get_queryset(self):
        return Module.objects.filter(course__teacher=self.request.user)


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
    """
    Creates a lesson inside a module.
    → isTeacher: only teachers may create lessons.
    → Ownership: the requesting teacher must own the module's parent course.
    """
    permission_classes = [IsAuthenticated, isTeacher]
    serializer_class = LessonSerializer

    def perform_create(self, serializer):
        try:
            linked_module = Module.objects.select_related('course').get(id=self.kwargs['module_id'])
        except Module.DoesNotExist:
            raise NotFound(f"Module with id {self.kwargs['module_id']} does not exist")

        if linked_module.course.teacher != self.request.user:
            raise PermissionDenied("You do not own the course this module belongs to.")

        try:
            serializer.save(module=linked_module)
        except Exception:
            logger.exception("Unexpected error while creating lesson")
            raise


class LessonUpdate(generics.UpdateAPIView):
    """Only the teacher who owns the lesson's parent course may update it."""
    permission_classes = [IsAuthenticated, isTeacher]
    serializer_class = LessonSerializer
    lookup_url_kwarg = 'lesson_id'
    lookup_field = LOOKUP_FIELD

    def get_queryset(self):
        return Lesson.objects.filter(module__course__teacher=self.request.user)

    def perform_update(self, serializer):
        lesson = serializer.save()

        # Cascade: if lesson marked published, check whether the whole module is published
        if lesson.is_published:
            module = lesson.module
            if not module.lesson_module.filter(is_published=False).exists():
                module.is_published = True
                module.save(update_fields=['is_published'])

                # Cascade further: check whether all modules in the course are published
                course = module.course
                if not course.module_course.filter(is_published=False).exists():
                    course.is_published = True
                    course.save(update_fields=['is_published'])


class LessonDelete(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated, isTeacher]
    lookup_field = LOOKUP_FIELD
    lookup_url_kwarg = 'lesson_id'

    def get_queryset(self):
        return Lesson.objects.filter(module__course__teacher=self.request.user)


class LessonMarkRead(APIView):
    """
    Marks a lesson as read for the requesting student.
    → Only enrolled students may mark progress (teachers and unenrolled
      users are rejected to prevent fake progress records).
    """
    permission_classes = [IsAuthenticated, isStudent]

    def post(self, request, lesson_id):
        lesson = get_object_or_404(
            Lesson.objects.select_related('module__course'),
            id=lesson_id,
        )
        course = lesson.module.course
        # Verify the student is actually enrolled in this course
        if not course.student.filter(pk=request.user.pk).exists():
            raise PermissionDenied("You are not enrolled in this course.")
        UserLessonProgress.objects.get_or_create(student=request.user, lesson=lesson)
        return Response({"status": "marked as read"}, status=status.HTTP_200_OK)
