from .models import *

from rest_framework import serializers


class QuizSerializer(serializers.ModelSerializer):

    class Meta:
        model = Quiz
        fields = ['id', 'name', 'description']


class QuestionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Question
        fields = ['id','question_text', 'question_type']


class ChoiceSerializer(serializers.ModelSerializer):

    class Meta:

        model = Choice
        fields = ['id','choice', 'is_correct']


class UserAttemptSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserAttempt

        fields = ['id','passed_quiz', 'student', 'score', 'submitted_at']