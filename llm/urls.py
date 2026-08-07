from django.urls import path
from .views import (
    LLMCourseListView, LLMCourseDetailView,
    LLMModuleListView, LLMLessonDetailView,
    LLMQuizListView, LLMQuizDetailView,
    LLMAttemptListView,
    LLMAssignmentListView, LLMAssignmentDetailView,
    LLMCurrentUserView, LLMStudentListView,
)

urlpatterns = [
    # ── User ──────────────────────────────────────────────────────────────────
    path('me/', LLMCurrentUserView.as_view(), name='llm-me'),
    path('students/', LLMStudentListView.as_view(), name='llm-students'),

    # ── Courses ───────────────────────────────────────────────────────────────
    path('courses/', LLMCourseListView.as_view(), name='llm-courses'),
    path('courses/<int:course_id>/', LLMCourseDetailView.as_view(), name='llm-course-detail'),
    path('courses/<int:course_id>/modules/', LLMModuleListView.as_view(), name='llm-modules'),

    # ── Lessons ───────────────────────────────────────────────────────────────
    path('lessons/<int:lesson_id>/', LLMLessonDetailView.as_view(), name='llm-lesson-detail'),

    # ── Quizzes ───────────────────────────────────────────────────────────────
    path('quizzes/', LLMQuizListView.as_view(), name='llm-quizzes'),
    path('quizzes/<int:quiz_id>/', LLMQuizDetailView.as_view(), name='llm-quiz-detail'),
    path('attempts/', LLMAttemptListView.as_view(), name='llm-attempts'),

    # ── Assignments ───────────────────────────────────────────────────────────
    path('assignments/', LLMAssignmentListView.as_view(), name='llm-assignments'),
    path('assignments/<int:assignment_id>/', LLMAssignmentDetailView.as_view(), name='llm-assignment-detail'),
]
