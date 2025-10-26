from .views import *
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('list/', QuizList.as_view(), name="show-quizzes" ),
    path('create_quiz/', QuizCreate.as_view(), name="create-quiz"),
    path('update_quiz/<int:id>/', QuizUpdate.as_view(), name="update-quiz"),
    path('delete_quiz/', QuizDelete.as_view(), name="delete-quiz"),
    path('<int:quiz_id>/', QuizDetailedView.as_view(), name="view-quiz")
]