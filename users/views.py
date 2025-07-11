from django.shortcuts import render
from rest_framework import generics
from .serializers import UserSerializer
from .models import CustomUser

from rest_framework.permissions import IsAuthenticated, AllowAny


class CreateUserView(generics.CreateAPIView):
    query_set = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

