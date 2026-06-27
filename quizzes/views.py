import logging

from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from courses.views import isTeacher, isStudent
from .models import Quiz, Question, Choice, UserAttempt, UserAnswer
from .serializers import (
    QuizSerializer, UserQuizSerializer,
    UserAttemptSerializer, UserAnswerSerializer,
)

logger = logging.getLogger(__name__)


class QuizList(generics.ListAPIView):
    """
    Lists quizzes scoped to the requesting user:
    → Teachers see only their own quizzes.
    → Students see quizzes for courses they are enrolled in.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = QuizSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Teacher':
            return Quiz.objects.filter(teacher=user)
        # Students: quizzes belonging to enrolled courses
        return Quiz.objects.filter(
            Q(course__student=user) | Q(course__student_classes__students=user)
        ).distinct()


class QuizDetailedView(generics.RetrieveAPIView):
    '''Returns a single quiz object (not a list).'''
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'quiz_id'
    queryset = Quiz.objects.all()

    def get_serializer_class(self):
        user = self.request.user
        if user.role == 'Teacher':
            return QuizSerializer
        return UserQuizSerializer


class QuizCreate(generics.CreateAPIView):
    permission_classes = [IsAuthenticated, isTeacher]
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)


class QuizUpdate(generics.UpdateAPIView):
    """Only the quiz's owner (teacher) may update it."""
    permission_classes = [IsAuthenticated, isTeacher]
    serializer_class = QuizSerializer
    lookup_field = 'id'

    def get_queryset(self):
        return Quiz.objects.filter(teacher=self.request.user)


class QuizDelete(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated, isTeacher]
    lookup_field = 'id'

    def get_queryset(self):
        return Quiz.objects.filter(id=self.kwargs['id'])

    def perform_destroy(self, instance):
        with transaction.atomic():
            # UserAnswer.question is PROTECT — delete answers before attempts
            for attempt in instance.attempts.all():
                attempt.attempt_answers.all().delete()
            # UserAttempt.quiz is PROTECT — delete attempts before the quiz
            instance.attempts.all().delete()
            # Questions / Choices cascade automatically (on_delete=CASCADE)
            instance.delete()


class UserAttemptCreate(generics.CreateAPIView):
    """Student starts a quiz attempt.

    Idempotent: if an un-graded attempt already exists for this student+quiz,
    it is returned (HTTP 200) instead of creating a duplicate.
    """
    permission_classes = [IsAuthenticated, isStudent]
    queryset = UserAttempt.objects.all()
    serializer_class = UserAttemptSerializer

    def create(self, request, *args, **kwargs):
        quiz = get_object_or_404(Quiz, id=self.kwargs['quiz_id'])

        # Enforce due date
        if quiz.due_date < timezone.localdate():
            raise PermissionDenied("This quiz is past its due date.")

        # Idempotent: return existing active attempt
        existing = UserAttempt.objects.filter(
            student=request.user, quiz=quiz, score__isnull=True
        ).first()
        if existing:
            serializer = self.get_serializer(existing)
            return Response(serializer.data, status=200)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # score=None so ungraded attempts are distinguishable from a real 0
        serializer.save(score=None, student=request.user, quiz=quiz)
        return Response(serializer.data, status=201)


class UserAttemptDelete(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated, isStudent]
    lookup_field = 'id'

    def get_queryset(self):
        return UserAttempt.objects.filter(student=self.request.user)

    def perform_destroy(self, instance):
        with transaction.atomic():
            instance.attempt_answers.all().delete()
            instance.delete()


class AnswerCreate(generics.CreateAPIView):
    """Student submits an answer for one question inside an attempt."""
    permission_classes = [IsAuthenticated, isStudent]
    queryset = UserAnswer.objects.all()
    serializer_class = UserAnswerSerializer

    def perform_create(self, serializer):
        attempt = get_object_or_404(UserAttempt, id=self.kwargs['attempt_id'], student=self.request.user)

        # Block answers on already-graded attempts
        if attempt.score is not None:
            raise PermissionDenied("This attempt has already been submitted.")

        # Validate question belongs to this quiz
        question = get_object_or_404(Question, id=self.kwargs['question_id'], quiz=attempt.quiz)

        # Validate chosen choices belong to this question
        chosen = serializer.validated_data.get('chosen_choices', [])
        valid_ids = set(question.choices.values_list('id', flat=True))
        bad = [c.id for c in chosen if c.id not in valid_ids]
        if bad:
            raise ValidationError({"chosen_choices": f"Choice IDs {bad} do not belong to this question."})

        serializer.save(attempt=attempt, question=question)


class AnswerUpdate(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated, isStudent]
    serializer_class = UserAnswerSerializer
    lookup_field = 'id'

    def get_queryset(self):
        return UserAnswer.objects.filter(attempt__student=self.request.user)


class SubmitQuiz(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated, isStudent]
    serializer_class = UserAttemptSerializer
    lookup_field = 'id'

    def get_queryset(self):
        return UserAttempt.objects.filter(student=self.request.user)

    def perform_update(self, serializer):
        attempt = serializer.instance

        # Block re-submission of already-graded attempts
        if attempt.score is not None:
            raise PermissionDenied("This attempt has already been submitted.")

        total_questions = attempt.quiz.questions.count()
        answered_count = attempt.attempt_answers.count()

        # Require all questions to be answered before grading
        if answered_count < total_questions:
            raise ValidationError(
                {"detail": f"You have answered {answered_count}/{total_questions} questions. "
                           "Please answer all questions before submitting."}
            )

        correct_answers = 0
        for user_answer in attempt.attempt_answers.all():
            question = user_answer.question
            correct_choice_ids = set(question.choices.filter(is_correct=True).values_list('id', flat=True))
            user_selected_ids = set(user_answer.chosen_choices.values_list('id', flat=True))
            if correct_choice_ids == user_selected_ids and correct_choice_ids:
                correct_answers += 1

        score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
        serializer.save(score=score, submitted_at=timezone.now())


# ── Document Assignment Views ─────────────────────────────────────────────────

from .models import Assignment, Submission
from .serializers import (
    AssignmentSerializer, StudentAssignmentSerializer,
    SubmissionSerializer, GradeSubmissionSerializer,
)


class AssignmentList(generics.ListAPIView):
    """Lists assignments relevant to the authenticated user."""
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.user.role == 'Teacher':
            return AssignmentSerializer
        return StudentAssignmentSerializer

    def get_queryset(self):
        from django.db.models import Q
        user = self.request.user
        if user.role == 'Teacher':
            return Assignment.objects.filter(teacher=user).prefetch_related('submissions')
        # Students see assignments for courses they are enrolled in
        return Assignment.objects.filter(
            Q(course__student=user) | Q(course__student_classes__students=user)
        ).distinct().prefetch_related('submissions')


class AssignmentCreate(generics.CreateAPIView):
    """Teacher uploads a new assignment (PDF + metadata)."""
    permission_classes = [IsAuthenticated, isTeacher]
    serializer_class = AssignmentSerializer

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)


class AssignmentDetail(generics.RetrieveAPIView):
    """Returns a single assignment."""
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_serializer_class(self):
        if self.request.user.role == 'Teacher':
            return AssignmentSerializer
        return StudentAssignmentSerializer

    def get_queryset(self):
        from django.db.models import Q
        user = self.request.user
        if user.role == 'Teacher':
            return Assignment.objects.filter(teacher=user).prefetch_related('submissions')
        return Assignment.objects.filter(
            Q(course__student=user) | Q(course__student_classes__students=user)
        ).distinct().prefetch_related('submissions')


class AssignmentUpdate(generics.UpdateAPIView):
    """Teacher updates assignment metadata or replaces the document PDF."""
    permission_classes = [IsAuthenticated, isTeacher]
    serializer_class = AssignmentSerializer
    lookup_field = 'id'

    def get_queryset(self):
        return Assignment.objects.filter(teacher=self.request.user)


class AssignmentDelete(generics.DestroyAPIView):
    """Teacher deletes an assignment (and all submissions cascade)."""
    permission_classes = [IsAuthenticated, isTeacher]
    lookup_field = 'id'

    def get_queryset(self):
        return Assignment.objects.filter(teacher=self.request.user)


class SubmissionCreateUpdate(generics.CreateAPIView):
    """
    Student submits (or re-submits) their answer PDF.
    - First call  → creates a Submission (HTTP 201).
    - Repeat call → updates the existing file if due date not exceeded (HTTP 200).
    - Blocked     → past due date (HTTP 403).
    """
    permission_classes = [IsAuthenticated, isStudent]
    serializer_class = SubmissionSerializer

    def create(self, request, *args, **kwargs):
        assignment = get_object_or_404(Assignment, id=self.kwargs['assignment_id'])

        if assignment.due_date < timezone.localdate():
            raise PermissionDenied("The due date for this assignment has passed.")

        existing = Submission.objects.filter(
            assignment=assignment, student=request.user
        ).first()

        if existing:
            # Re-upload: update the file field
            serializer = self.get_serializer(existing, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=200)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(assignment=assignment, student=request.user)
        return Response(serializer.data, status=201)


class GradeSubmission(generics.UpdateAPIView):
    """Teacher sets score + optional feedback on a student submission."""
    permission_classes = [IsAuthenticated, isTeacher]
    serializer_class = GradeSubmissionSerializer
    lookup_field = 'id'

    def get_queryset(self):
        # Scoped to submissions belonging to the teacher's own assignments
        return Submission.objects.filter(assignment__teacher=self.request.user)