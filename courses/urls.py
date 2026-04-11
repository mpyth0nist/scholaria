from django.urls import path, include

from django.conf import settings

from .views import *
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('list/', CourseView.as_view(), name="courses" ),
    path('<int:course_id>/', CourseDetailView.as_view(), name="course"),
    path('create-course/', CourseCreate.as_view(), name="create_course"),
    path('delete/<int:id>/', CourseDelete.as_view(), name="course_delete"),
    path('update/<int:id>/', CourseUpdate.as_view(), name="course_update"),
    path('<int:course_id>/modules/', ModuleList.as_view(), name="course_modules"),
    path('<int:course_id>/modules/add-module/', ModuleCreate.as_view(), name="add_module"),
    path('modules/<int:module_id>/update-module/', ModuleUpdate.as_view(), name="update_module"),
    path('modules/<int:module_id>/delete-module/', ModuleDelete.as_view(), name="delete_module"),
    path('<int:module_id>/add-lesson/', LessonCreate.as_view(), name="add-lesson"),

    path('<int:module_id>/lessons/', LessonList.as_view(), name='list_module_lessons'),
    path('lessons/<int:lesson_id>/', LessonDetailView.as_view(), name="show_lesson"),
    path('lessons/<int:lesson_id>/update-lesson/', LessonUpdate.as_view(), name="update-lesson"),
    path('lessons/<int:lesson_id>/delete-lesson/', LessonDelete.as_view(), name="delete-lesson"),
]
