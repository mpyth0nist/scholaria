from .models import *

from rest_framework import serializers

class ChoiceSerializer(serializers.ModelSerializer):

    class Meta:

        model = Choice
        fields = ['id','choice', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Question
        fields = ['id','question_text', 'question_type', 'choices']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)
    class Meta:
        model = Quiz
        fields = ['id', 'name', 'description', 'teacher', 'course', 'questions','done']
    

    def create(self, validated_data):
        questions_data = validated_data.pop('questions')
        quiz = Quiz(**validated_data)
        
        for question in questions_data:
            Question.objects.create(quiz = quiz, **question)
        
        return quiz

    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions')
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.teacher = validated_data.get('teacher', instance.teacher)
        instance.course = validated_data.get('course', instance.course)

        instance.questions.all().delete()
        for question in questions_data:
            Question.objects.create(quiz=instance, **question)

        instance.save()


class UserAttemptSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserAttempt

        fields = ['id','passed_quiz', 'student', 'score', 'submitted_at']