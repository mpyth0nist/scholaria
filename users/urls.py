from .views import *
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('scholaria/register/', CreateUserView.as_view(), name="create_user" ),
    path('scholaria/token/', TokenObtainPairView.as_view(), name="get_token"),
    path('scholaria/refresh/', TokenRefreshView.as_view(), name="refresh"),
    path('scholaria/user/', LoggedUserView.as_view(), name="get_user_info")
]