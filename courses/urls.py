from django.urls import path, include

from django.conf import settings

from .views import *
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('list/', CourseView.as_view(), name="courses" ),
    path('courses/create-course/', CourseCreate.as_view(), name="create-course"),
    path('courses/delete/<int:id>/', CourseDelete.as_view(), name="course_delete"),
    path('courses/update/<int:id>/', CourseUpdate.as_view(), name="course_update"),
    path('modules/', ModuleList.as_view(), name="course_modules"),
    path('modules/add-module/', ModuleCreate.as_view(), name="add_module"),
    path('modules/<int:module_id>/update-module/', ModuleUpdate.as_view(), name="update_module"),
    path('modules/<int:module_id>/delete-module/', ModuleDelete.as_view(), name="delete_module"),
]
