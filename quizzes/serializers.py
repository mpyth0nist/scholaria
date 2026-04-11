from .models import *

from rest_framework import serializers

class UserChoiceSerializer(serializers.ModelSerializer):
    class Meta:

        model = Choice
        fields = ['id','choice']

class UserQuestionSerializer(serializers.ModelSerializer):
    choices = UserChoiceSerializer(many=True)
    quiz = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'choices', 'quiz']

class UserQuizSerializer(serializers.ModelSerializer):
    questions = UserQuestionSerializer(many=True)
    class Meta:
        model = Quiz
        fields = ['id', 'name', 'description', 'course', 'questions']

class ChoiceSerializer(serializers.ModelSerializer):

    class Meta:

        model = Choice
        fields = ['id','choice', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True)
    quiz = serializers.PrimaryKeyRelatedField(read_only=True)


    class Meta:
        model = Question
        fields = ['id','question_text', 'choices', 'quiz']

    def create(self, validated_data, quiz=None):
        choices_data = validated_data.pop('choices')

        question = Question.objects.create(**validated_data)

        for choice in choices_data:
            Choice.objects.create(question=question, **choice)

        return question
        


    def update(self, instance, validated_data):

        choices_data = validated_data.pop('choices')

        instance.question_text = validated_data.get("question_text", instance.question_text)
        
        for choice in choices_data:

            Choice.objects.create(question=instance, **choice)

        instance.save()

        return instance

    

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)
    class Meta:
        model = Quiz
        fields = ['id', 'name', 'description', 'course', 'due_date', 'questions']
    

    def create(self, validated_data):
        print('create quiz called')
        questions_data = validated_data.pop('questions')
        quiz = Quiz.objects.create(**validated_data)
        
        for question_data in questions_data:
            question_serializer = QuestionSerializer(data=question_data)
            question_serializer.is_valid(raise_exception=True)
            question_serializer.save(quiz=quiz)
        
        return quiz

    def update(self, instance, validated_data):
        questions_data = validated_data.pop('questions')
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.course = validated_data.get('course', instance.course)
        instance.due_date = validated_data.get('due_date', instance.due_date)

        instance.questions.all().delete()
        for question_data in questions_data:
            question_serializer = QuestionSerializer(data=question_data)
            question_serializer.is_valid(raise_exception=True)
            question_serializer.save(quiz=instance)

        instance.save()

        return instance


class UserAnswerSerializer(serializers.ModelSerializer):
    chosen_choices = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Choice.objects.all()
    )

    class Meta:
        model = UserAnswer
        fields = ['id', 'attempt', 'question', 'chosen_choices', 'question_snapshot']
        read_only_fields = ['attempt', 'question', 'question_snapshot']


class UserAttemptSerializer(serializers.ModelSerializer):
    answers = UserAnswerSerializer(many=True, read_only=True, source='attempt_answers')

    class Meta:
        model = UserAttempt
        fields = ['id', 'quiz', 'student', 'score', 'answers']
        read_only_fields = ['student', 'score', 'quiz']