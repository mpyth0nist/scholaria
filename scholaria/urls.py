"""
URL configuration for scholaria project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from users.views import CreateUserView
from courses.views import CourseView, CourseDelete, CourseUpdate
from django.conf.urls.static import static

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('scholaria/register/', CreateUserView.as_view(), name="create_user" ),
    path('scholaria/token/', TokenObtainPairView.as_view(), name="get_token"),
    path('scholaria/refresh/', TokenRefreshView.as_view(), name="refresh"),
    path('scholaria/courses/', CourseView.as_view(), name="courses" ),
    path('scholaria/courses/delete/<int:id>', CourseDelete.as_view(), name="course_delete"),
    path('scholaria/courses/update/<int:id>', CourseUpdate.as_view(), name="course_update")
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

