from django.shortcuts import render, get_object_or_404
from .serializers import *
from .models import *
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied, ValidationError
from courses.views import isTeacher, isStudent
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone



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
    """Student starts a quiz attempt.
    
    Idempotent: if an un-graded attempt already exists for this student+quiz,
    it is returned (HTTP 200) instead of creating a duplicate.
    """
    queryset = UserAttempt.objects.all()
    permission_classes = [IsAuthenticated, isStudent]
    serializer_class = UserAttemptSerializer

    def create(self, request, *args, **kwargs):
        quiz = get_object_or_404(Quiz, id=self.kwargs['quiz_id'])

        # ── #11 Enforce due date ──
        if quiz.due_date < timezone.localdate():
            raise PermissionDenied("This quiz is past its due date.")

        # ── #1 Idempotent: return existing active attempt ──
        existing = UserAttempt.objects.filter(
            student=request.user, quiz=quiz, score__isnull=True
        ).first()
        if existing:
            serializer = self.get_serializer(existing)
            return Response(serializer.data, status=200)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # ── #2 score=None so ungraded attempts are distinguishable from a real 0 ──
        serializer.save(score=None, student=request.user, quiz=quiz)
        return Response(serializer.data, status=201)

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

        # ── #3 Block answers on already-graded attempts ──
        if attempt.score is not None:
            raise PermissionDenied("This attempt has already been submitted.")

        # ── #5 Validate question belongs to this quiz ──
        question = get_object_or_404(Question, id=self.kwargs['question_id'], quiz=attempt.quiz)

        # ── #17 Validate chosen choices belong to this question ──
        chosen = serializer.validated_data.get('chosen_choices', [])
        valid_ids = set(question.choices.values_list('id', flat=True))
        bad = [c.id for c in chosen if c.id not in valid_ids]
        if bad:
            raise ValidationError({"chosen_choices": f"Choice IDs {bad} do not belong to this question."})

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

        # ── #3 Block re-submission of already-graded attempts ──
        if attempt.score is not None:
            raise PermissionDenied("This attempt has already been submitted.")

        total_questions = attempt.quiz.questions.count()
        answered_count  = attempt.attempt_answers.count()

        # ── #4 Require all questions to be answered before grading ──
        if answered_count < total_questions:
            raise ValidationError(
                {"detail": f"You have answered {answered_count}/{total_questions} questions. "
                           "Please answer all questions before submitting."}
            )

        correct_answers = 0

        # Loop through all answers submitted in this attempt
        for user_answer in attempt.attempt_answers.all():
            question = user_answer.question

            # IDs of choices that are actually correct for this question
            correct_choice_ids = set(question.choices.filter(is_correct=True).values_list('id', flat=True))

            # IDs of choices the student selected
            user_selected_ids = set(user_answer.chosen_choices.values_list('id', flat=True))

            # Perfect match means the question was answered correctly
            if correct_choice_ids == user_selected_ids and correct_choice_ids:
                correct_answers += 1

        # ── Score based on questions answered, not total quiz questions ──
        score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0

        serializer.save(score=score)