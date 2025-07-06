from django.shortcuts import render
from .serializers import *
from .models import *
from rest_framework import generics


class QuizCreate(generics.CreateAPIview):


class QuizUpdate(generics.UpdateAPIView):
    pass

class QuizDelete(generics.DestroyAPIView):
    pass
