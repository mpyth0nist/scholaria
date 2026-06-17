from django.urls import path

from .views import (
    QuizList, QuizCreate, QuizUpdate, QuizDelete, QuizDetailedView,
    UserAttemptCreate, UserAttemptDelete, SubmitQuiz,
    AnswerCreate, AnswerUpdate,
)

urlpatterns = [
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
]