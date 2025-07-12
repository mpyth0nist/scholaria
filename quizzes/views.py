from django.shortcuts import render
from .serializers import *
from .models import *
from rest_framework import generics
from courses.views import isTeacher, isStudent, isCourseTeacher, isLessonModuleCourseTeacher, isModuleCourseTeacher

from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission

class QuizList(generics.ListAPIView):

    queryset = Quiz.objects.all()
    permission_classes = [AllowAny]
    serializer_class = QuizSerializer

    
class QuizCreate(generics.CreateAPIView):
    queryset = Quiz.objects.all()
    permission_classes = [AllowAny]
    serializer_class = QuizSerializer

    def perform_create(self, serializer):

        if serializer.is_valid():

            serializer.save()

        else:

            print(serializer.errors)


class QuizUpdate(generics.UpdateAPIView):
    permission_classes = [AllowAny]
    serializer_class = QuizSerializer

    def get_queryset(self):
        
        quiz = Quiz.objects.get(id=self.kwargs['quiz_id'])

        return quiz

class QuizDelete(generics.DestroyAPIView):

    permission_classes = [AllowAny]
    def get_queryset(self):
    
    quiz = Quiz.objects.get(id=self.kwargs['quiz_id'])

    return quiz
