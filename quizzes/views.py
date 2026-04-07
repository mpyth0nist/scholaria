from django.shortcuts import render, get_object_or_404
from .serializers import *
from .models import *
from rest_framework import generics
from courses.views import isTeacher, isStudent
from rest_framework.permissions import IsAuthenticated
from django.db import transaction


def get_correct_choices(instance):
    quiz_questions = instance.questions
    correct_choices = []

    def is_correct(choice):
        return choice.is_correct

    for question in quiz_questions:
        correct_choice = filter(is_correct, question.choices)
        correct_choices.append(correct_choice)

    return correct_choices



class QuizList(generics.ListAPIView):

    queryset = Quiz.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = QuizSerializer

class QuizDetailedView(generics.ListAPIView):

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        
        user = self.request.user

        if user.role == 'Teacher':
            return QuizSerializer
        else:
            return UserQuizSerializer

    def get_queryset(self):

        quiz_id = self.kwargs['quiz_id']
        
        return Quiz.objects.filter(id=quiz_id).distinct()
    
class QuizCreate(generics.CreateAPIView):
    queryset = Quiz.objects.all()
    permission_classes = [IsAuthenticated, isTeacher]
    serializer_class = QuizSerializer

    def perform_create(self, serializer):

        serializer.save(teacher=self.request.user)


class QuizUpdate(generics.UpdateAPIView):
    queryset = Quiz.objects.all()
    permission_classes = [IsAuthenticated, isTeacher]
    serializer_class = QuizSerializer
    lookup_field = 'id'

class QuizDelete(generics.DestroyAPIView):
    lookup_field = 'id'
    permission_classes = [IsAuthenticated, isTeacher]
    def get_queryset(self):
    
        quiz = Quiz.objects.filter(id=self.kwargs['id'])

        return quiz


class UserAttemptCreate(generics.CreateAPIView):
    """Student starts a quiz attempt."""
    queryset = UserAttempt.objects.all()
    permission_classes = [IsAuthenticated, isStudent]
    serializer_class = UserAttemptSerializer

    def perform_create(self, serializer):
        quiz = get_object_or_404(Quiz, id=self.kwargs['quiz_id'])
        serializer.save(student=self.request.user, quiz=quiz)

class UserAttemptDelete(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated, isStudent]
    lookup_field = 'id'


    def get_queryset(self):
        student = self.request.user

        return UserAttempt.objects.filter(student=student)

    def perform_destroy(self, instance):

        with transaction.atomic():
            instance.attempt_answers.all().delete()
            instance.delete()


class AnswerCreate(generics.CreateAPIView):
    """Student submits an answer for one question inside an attempt."""
    queryset = UserAnswer.objects.all()
    permission_classes = [IsAuthenticated, isStudent]
    serializer_class = UserAnswerSerializer

    def perform_create(self, serializer):
        attempt  = get_object_or_404(UserAttempt, id=self.kwargs['attempt_id'], student=self.request.user)
        question = get_object_or_404(Question, id=self.kwargs['question_id'])

        serializer.save(
            attempt=attempt,
            question=question,
        )
    

class AnswerUpdate(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated, isStudent]
    serializer_class = UserAnswerSerializer
    lookup_field = 'id'

    def get_queryset(self):
        student = self.request.user

        return UserAnswer.objects.filter(attempt__student=student)

class SubmitQuiz(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated, isStudent]
    serializer_class = UserAttemptSerializer
    lookup_field = 'id'

    def get_queryset(self):
        student = self.request.user
        return UserAttempt.objects.filter(student=student)

    def perform_update(self, serializer):
        attempt = serializer.instance
        
        # Grading Logic
        total_questions = attempt.quiz.questions.count()
        correct_answers = 0

        # Loop through all answers submitted in this attempt
        for user_answer in attempt.attempt_answers.all():
            question = user_answer.question
            
            # IDs of choices that are actually correct for this question
            correct_choice_id = set(question.choices.filter(is_correct=True).values_list('id', flat=True))
            
            # IDs of choices the student selected
            user_selected_choice_id = set(user_answer.chosen_choices.values_list('id', flat=True))

            # Perfect match means the question was answered correctly
            if correct_choice_id == user_selected_choice_id and correct_choice_id:
                correct_answers += 1

        # Calculate final score percentage
        if total_questions > 0:
            score = (correct_answers / total_questions) * 100
        else:
            score = 0

        # Save the attempt with the final score
        serializer.save(score=score)