"""
LLM-facing API views for Scholaria.

These views reuse existing models and permissions but serve data through
LLM-optimised serializers:
  - No bare integer FK IDs
  - No binary file paths (replaced with has_* booleans)
  - No PII beyond display names
  - Computed labels instead of raw numerics (scores, counts)

All endpoints are scoped to the authenticated user exactly as their
counterpart views in courses/ and quizzes/ are — no extra data is exposed.
"""

from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.models import Course, Module, Lesson
from courses.views import isTeacher, isStudent
from courses.llm_serializers import (
    LLMCourseSerializer,
    LLMCourseSummarySerializer,
    LLMModuleSerializer,
    LLMLessonSerializer,
)
from quizzes.models import Quiz, UserAttempt, Assignment
from quizzes.llm_serializers import (
    LLMQuizSerializer,
    LLMQuizSummarySerializer,
    LLMAttemptSerializer,
    LLMAssignmentSerializer,
    LLMAssignmentSummarySerializer,
)
from users.models import CustomUser
from users.llm_serializers import LLMUserSerializer


# ── Course views ──────────────────────────────────────────────────────────────

class LLMCourseListView(generics.ListAPIView):
    """
    Lists courses accessible to the authenticated user, LLM-formatted.
    Teacher → their own courses. Student → enrolled courses.
    Uses the summary serializer (no nested modules) to keep responses compact.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LLMCourseSummarySerializer

    def get_queryset(self):
        user = self.request.user
        return Course.objects.filter(
            Q(teacher=user) | Q(student=user)
        ).distinct()


class LLMCourseDetailView(generics.RetrieveAPIView):
    """
    Full course detail with nested modules and lessons, LLM-formatted.
    Scoped to courses the user is authorised to see.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LLMCourseSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'course_id'

    def get_queryset(self):
        user = self.request.user
        return Course.objects.filter(
            Q(teacher=user) | Q(student=user)
        ).distinct().prefetch_related(
            'module_course__lesson_module'
        )


# ── Module / Lesson views ─────────────────────────────────────────────────────

class LLMModuleListView(generics.ListAPIView):
    """Modules for a course, with nested lessons, LLM-formatted."""
    permission_classes = [IsAuthenticated]
    serializer_class = LLMModuleSerializer

    def get_queryset(self):
        user = self.request.user
        course = get_object_or_404(
            Course,
            Q(teacher=user) | Q(student=user),
            id=self.kwargs['course_id'],
        )
        return Module.objects.filter(course=course).prefetch_related('lesson_module')


class LLMLessonDetailView(generics.RetrieveAPIView):
    """Single lesson detail, LLM-formatted (full content included)."""
    permission_classes = [IsAuthenticated]
    serializer_class = LLMLessonSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'lesson_id'

    def get_queryset(self):
        user = self.request.user
        return Lesson.objects.filter(
            Q(module__course__teacher=user) | Q(module__course__student=user)
        ).distinct()


# ── Quiz views ────────────────────────────────────────────────────────────────

class LLMQuizListView(generics.ListAPIView):
    """
    Lists quizzes accessible to the authenticated user, LLM-formatted.
    Uses the summary serializer (no nested questions) to keep responses compact.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LLMQuizSummarySerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Teacher':
            return Quiz.objects.filter(teacher=user)
        return Quiz.objects.filter(
            Q(course__student=user) | Q(course__student_classes__students=user)
        ).distinct()


class LLMQuizDetailView(generics.RetrieveAPIView):
    """
    Full quiz detail with nested questions and choices, LLM-formatted.
    Note: choices include is_correct so the LLM can reason about correctness.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LLMQuizSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'quiz_id'

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Teacher':
            return Quiz.objects.filter(teacher=user).prefetch_related('questions__choices')
        return Quiz.objects.filter(
            Q(course__student=user) | Q(course__student_classes__students=user)
        ).distinct().prefetch_related('questions__choices')


# ── Attempt / score views ─────────────────────────────────────────────────────

class LLMAttemptListView(generics.ListAPIView):
    """
    Lists quiz attempts with human-readable score labels.
    Teacher → all graded attempts across their quizzes.
    Student → their own attempts.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LLMAttemptSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Teacher':
            return (
                UserAttempt.objects
                .filter(quiz__teacher=user, score__isnull=False)
                .select_related('student', 'quiz', 'quiz__course')
                .order_by('-submitted_at')
            )
        return (
            UserAttempt.objects
            .filter(student=user)
            .select_related('student', 'quiz', 'quiz__course')
            .order_by('-submitted_at')
        )


# ── Assignment views ──────────────────────────────────────────────────────────

class LLMAssignmentListView(generics.ListAPIView):
    """
    Lists assignments accessible to the authenticated user, LLM-formatted.
    Uses the summary serializer (no nested submissions) to keep responses compact.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LLMAssignmentSummarySerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Teacher':
            return Assignment.objects.filter(teacher=user).prefetch_related('submissions')
        return Assignment.objects.filter(
            Q(course__student=user) | Q(course__student_classes__students=user)
        ).distinct().prefetch_related('submissions')


class LLMAssignmentDetailView(generics.RetrieveAPIView):
    """
    Full assignment detail with nested submissions, LLM-formatted.
    Scoped to assignments the user is authorised to see.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LLMAssignmentSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'assignment_id'

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Teacher':
            return Assignment.objects.filter(teacher=user).prefetch_related('submissions__student')
        return Assignment.objects.filter(
            Q(course__student=user) | Q(course__student_classes__students=user)
        ).distinct().prefetch_related('submissions__student')


# ── User views ────────────────────────────────────────────────────────────────

class LLMCurrentUserView(APIView):
    """
    Returns the authenticated user's profile in LLM-safe format.
    Strips PII (birth_date) and expands courses to name lists.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = LLMUserSerializer(request.user)
        return Response(serializer.data)


class LLMStudentListView(generics.ListAPIView):
    """
    Lists all students, LLM-formatted. Teacher-only.
    Useful for LLM tasks like 'who are my students?'
    """
    permission_classes = [IsAuthenticated, isTeacher]
    serializer_class = LLMUserSerializer

    def get_queryset(self):
        return CustomUser.objects.filter(role='Student').prefetch_related(
            'student_courses', 'courses_taught'
        )
