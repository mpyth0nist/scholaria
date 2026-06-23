from django.urls import path

from .views import (
    QuizList, QuizCreate, QuizUpdate, QuizDelete, QuizDetailedView,
    UserAttemptCreate, UserAttemptDelete, SubmitQuiz,
    AnswerCreate, AnswerUpdate,
    # Assignment views
    AssignmentList, AssignmentCreate, AssignmentDetail,
    AssignmentUpdate, AssignmentDelete,
    SubmissionCreateUpdate, GradeSubmission,
)

urlpatterns = [
    # ── Existing MCQ Quiz URLs (unchanged) ────────────────────────────────────
    path('list/', QuizList.as_view(), name="show-quizzes"),
    path('create_quiz/', QuizCreate.as_view(), name="create-quiz"),
    path('update_quiz/<int:id>/', QuizUpdate.as_view(), name="update-quiz"),
    path('delete_quiz/<int:id>/', QuizDelete.as_view(), name="delete-quiz"),
    path('<int:quiz_id>/', QuizDetailedView.as_view(), name="view-quiz"),

    # Attempt lifecycle
    path('<int:quiz_id>/start/', UserAttemptCreate.as_view(), name="start-attempt"),
    path('attempts/<int:id>/cancel/', UserAttemptDelete.as_view(), name="cancel-attempt"),
    path('attempts/<int:id>/submit/', SubmitQuiz.as_view(), name="submit-quiz"),

    # Answers
    path('attempts/<int:attempt_id>/questions/<int:question_id>/answer/', AnswerCreate.as_view(), name="submit-answer"),
    path('answers/<int:id>/update/', AnswerUpdate.as_view(), name="update-answer"),

    # ── Document Assignment URLs ───────────────────────────────────────────────
    path('assignments/', AssignmentList.as_view(), name="assignment-list"),
    path('assignments/create/', AssignmentCreate.as_view(), name="assignment-create"),
    path('assignments/<int:id>/', AssignmentDetail.as_view(), name="assignment-detail"),
    path('assignments/<int:id>/update/', AssignmentUpdate.as_view(), name="assignment-update"),
    path('assignments/<int:id>/delete/', AssignmentDelete.as_view(), name="assignment-delete"),
    path('assignments/<int:assignment_id>/submit/', SubmissionCreateUpdate.as_view(), name="assignment-submit"),
    path('submissions/<int:id>/grade/', GradeSubmission.as_view(), name="submission-grade"),
]