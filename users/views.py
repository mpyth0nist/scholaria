from django.shortcuts import render
from rest_framework import generics
from rest_framework.response import Response
from .serializers import UserSerializer
from .models import CustomUser
from courses.models import Course
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny

from courses.views import isTeacher


class CreateUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class LoggedUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class ListStudentsView(APIView):
    permission_classes = [IsAuthenticated, isTeacher]

    def get(self, request):
        students = CustomUser.objects.filter(role='Student')
        serializer = UserSerializer(students, many=True)
        return Response(serializer.data)

