from django.shortcuts import render
from .serializers import *
from .models import *
from rest_framework import generics
from courses.views import isTeacher, isStudent, isCourseTeacher

from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission

class QuizList(generics.ListAPIView):

    queryset = Quiz.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = QuizSerializer

class QuizDetailedView(generics.ListAPIView):

    permission_classes = [AllowAny]
    serializer_class = QuizSerializer

    def get_queryset(self):

        quiz_id = self.kwargs['quiz_id']
        
        return Quiz.objects.filter(id=quiz_id).distinct()
    
class QuizCreate(generics.CreateAPIView):
    queryset = Quiz.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = QuizSerializer

    def perform_create(self, serializer):

        print('perform create quiz called')


        serializer.save(teacher=self.request.user)


class QuizUpdate(generics.UpdateAPIView):
    queryset = Quiz.objects.all()
    permission_classes = [AllowAny]
    serializer_class = QuizSerializer
    lookup_field = 'id'

class QuizDelete(generics.DestroyAPIView):
    lookup_field = 'id'
    permission_classes = [AllowAny]
    def get_queryset(self):
    
        quiz = Quiz.objects.filter(id=self.kwargs['id'])

        return quiz


