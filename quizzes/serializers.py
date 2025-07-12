from .models import *

from rest_framework import serializers

class ChoiceSerializer(serializers.ModelSerializer):

    class Meta:

        model = Choice
        fields = ['id','choice', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True)

    class Meta:
        model = Question
        fields = ['id','question_text', 'question_type', 'choices']

    def create(self, validated_data):

        choices_data = validated_data.pop('choices')

        question = Question(**validated_data)

        for choice in choices_data:
            Choice.objects.create(question=question, **choice)
        
        return question

    def update(self, instance, validated_data):

        choices_data = validated_data.pop('choices')

        instance.question_text = validated_data.get('question_text', instance.question_text)

        instance.question_type = validated_data.get('question_type', instance.question_type)

        instance.quiz = validated_data.get('quiz', instance.quiz)

        instance.choices.all().delete()

        for choice in choices_data:
            
            Choice.objects.create(question = instance, **choice)

        instance.save()


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)
    class Meta:
        model = Quiz
        fields = ['id', 'name', 'description', 'teacher', 'course', 'questions']
    

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