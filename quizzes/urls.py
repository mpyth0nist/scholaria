from .views import *
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('list/', QuizList.as_view(), name="show-quizzes" ),
    path('quizzes/create_quiz/', QuizCreate.as_view(), name="create-quiz"),
    path('quizzes/update_quiz/', QuizUpdate.as_view(), name="update-quiz"),
    path('quizzes/delete_quiz/', QuizDelete.as_view(), name="delete-quiz")
]