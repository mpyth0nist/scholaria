from django.shortcuts import render
from rest_framework import generics
from rest_framework.response import Response
from .serializers import UserSerializer
from .models import CustomUser

from rest_framework.permissions import IsAuthenticated, AllowAny


class CreateUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class LoggedUserView(generics.APIView):
    permission_classes = [isAuthenticated]

    def get(self, request):

        serializer = UserSerializer(request.user)

        return Response(serializer.data)

