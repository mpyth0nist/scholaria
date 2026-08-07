"""
LLM-friendly serializers for the quizzes app.

Design principles:
  - Questions include their choices WITH is_correct flags — the LLM needs
    this to reason about correctness (e.g. for hint generation or analysis).
  - Score is rounded and labelled (not a raw Decimal).
  - Assignment file paths are replaced with a boolean has_document flag.
  - No bare integer FK IDs; course and teacher are resolved to names.
  - Submissions expose student_name, not student ID.
"""

from rest_framework import serializers
from .models import Quiz, Question, Choice, UserAttempt, Assignment, Submission


# ── Quiz serializers ──────────────────────────────────────────────────────────

class LLMChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        # Include is_correct so the LLM can reason about answer correctness
        fields = ['id', 'choice', 'is_correct']


class LLMQuestionSerializer(serializers.ModelSerializer):
    choices = LLMChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'question_text', 'choices']


class LLMQuizSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.course_name', read_only=True)
    teacher_name = serializers.SerializerMethodField()
    question_count = serializers.IntegerField(source='questions.count', read_only=True)
    questions = LLMQuestionSerializer(many=True, read_only=True)

    def get_teacher_name(self, obj):
        t = obj.teacher
        return f"{t.first_name} {t.last_name}".strip() or t.username

    class Meta:
        model = Quiz
        fields = [
            'id', 'name', 'description',
            'course_name', 'teacher_name',
            'due_date', 'question_count', 'questions',
        ]


class LLMQuizSummarySerializer(serializers.ModelSerializer):
    """
    Lightweight quiz representation — no nested questions.
    Useful for listing many quizzes without expanding context window.
    """
    course_name = serializers.CharField(source='course.course_name', read_only=True)
    teacher_name = serializers.SerializerMethodField()
    question_count = serializers.IntegerField(source='questions.count', read_only=True)

    def get_teacher_name(self, obj):
        t = obj.teacher
        return f"{t.first_name} {t.last_name}".strip() or t.username

    class Meta:
        model = Quiz
        fields = [
            'id', 'name', 'description',
            'course_name', 'teacher_name',
            'due_date', 'question_count',
        ]


# ── Attempt / score serializers ───────────────────────────────────────────────

class LLMAttemptSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    quiz_name = serializers.CharField(source='quiz.name', read_only=True)
    course_name = serializers.CharField(source='quiz.course.course_name', read_only=True)
    score_label = serializers.SerializerMethodField()

    def get_student_name(self, obj):
        s = obj.student
        return f"{s.first_name} {s.last_name}".strip() or s.username

    def get_score_label(self, obj):
        if obj.score is None:
            return "Not yet graded"
        return f"{round(float(obj.score), 1)}%"

    class Meta:
        model = UserAttempt
        fields = [
            'id', 'quiz_name', 'course_name', 'student_name',
            'score_label', 'submitted_at',
        ]


# ── Assignment serializers ────────────────────────────────────────────────────

class LLMSubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    score_label = serializers.SerializerMethodField()
    has_file = serializers.SerializerMethodField()

    def get_student_name(self, obj):
        s = obj.student
        return f"{s.first_name} {s.last_name}".strip() or s.username

    def get_score_label(self, obj):
        if obj.score is None:
            return "Not yet graded"
        return f"{round(float(obj.score), 1)}/100"

    def get_has_file(self, obj):
        return bool(obj.file)

    class Meta:
        model = Submission
        fields = [
            'id', 'student_name', 'has_file',
            'submitted_at', 'score_label', 'feedback',
        ]


class LLMAssignmentSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.course_name', read_only=True)
    teacher_name = serializers.SerializerMethodField()
    has_document = serializers.SerializerMethodField()
    submission_count = serializers.SerializerMethodField()
    submissions = LLMSubmissionSerializer(many=True, read_only=True)

    def get_teacher_name(self, obj):
        t = obj.teacher
        return f"{t.first_name} {t.last_name}".strip() or t.username

    def get_has_document(self, obj):
        return bool(obj.document)

    def get_submission_count(self, obj):
        return obj.submissions.count()

    class Meta:
        model = Assignment
        fields = [
            'id', 'name', 'description',
            'course_name', 'teacher_name',
            'due_date', 'has_document',
            'submission_count', 'submissions',
        ]


class LLMAssignmentSummarySerializer(serializers.ModelSerializer):
    """
    Lightweight assignment representation — no nested submissions.
    """
    course_name = serializers.CharField(source='course.course_name', read_only=True)
    teacher_name = serializers.SerializerMethodField()
    has_document = serializers.SerializerMethodField()
    submission_count = serializers.SerializerMethodField()

    def get_teacher_name(self, obj):
        t = obj.teacher
        return f"{t.first_name} {t.last_name}".strip() or t.username

    def get_has_document(self, obj):
        return bool(obj.document)

    def get_submission_count(self, obj):
        return obj.submissions.count()

    class Meta:
        model = Assignment
        fields = [
            'id', 'name', 'description',
            'course_name', 'teacher_name',
            'due_date', 'has_document', 'submission_count',
        ]
