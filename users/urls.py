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
    path('user/update/', UpdateUserView.as_view(), name="update_user"),
    path('dashboard/', TeacherDashboardView.as_view(), name="teacher_dashboard"),

    # Admin routes
    path('admin/list/', AdminUserListView.as_view(), name="admin_list_users"),
    path('admin/create/', AdminUserCreateView.as_view(), name="admin_create_user"),
    path('admin/update/<int:user_id>/', AdminUserUpdateView.as_view(), name="admin_update_user"),
    path('admin/delete/<int:user_id>/', AdminUserDeleteView.as_view(), name="admin_delete_user"),
]