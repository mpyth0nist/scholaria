from .views import *
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('register/', CreateUserView.as_view(), name="create_user" ),
    path('token/', TokenObtainPairView.as_view(), name="get_token"),
    path('refresh/', TokenRefreshView.as_view(), name="refresh"),
    path('user/', LoggedUserView.as_view(), name="get_user_info"),
    path('students/' , ListStudentsView.as_view(), name="get_students"),
    path('logout/', LogoutView.as_view(), name="logout"),
    path('user/<int:user_id>/', UpdateUserView.as_view(), name="update_user"),
    path('dashboard/', TeacherDashboardView.as_view(), name="teacher_dashboard"),
]