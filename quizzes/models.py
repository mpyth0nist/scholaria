from django.db import models
from users.models import CustomUser
from courses.models import Course
from django.core.validators import MinLengthValidator
from core.mixins import RAGSearchableMixin


# Create your models here.

class Quiz(RAGSearchableMixin):

    name = models.CharField(max_length=200, validators=[MinLengthValidator(5)])
    description = models.CharField(max_length=255, null=True, blank=True)
    teacher = models.ForeignKey(CustomUser, related_name="teacher_quizzes", on_delete=models.CASCADE)
    course = models.ForeignKey(Course, related_name="course_quiz", on_delete=models.CASCADE)
    done = models.BooleanField(default=False)
    due_date = models.DateField()

    def to_rag_document(self) -> dict:
        return {
            "content": f"Quiz: {self.name}\n{self.description or ''}".strip(),
            "metadata": {
                "course_id": self.course_id,
                "quiz_id": self.id,
                "title": self.name,
                "type": "quiz",
            }
        }

    def __str__(self):
        return self.name


class Question(RAGSearchableMixin):
    question_text = models.TextField(max_length=500)
    quiz = models.ForeignKey(Quiz, related_name="questions", on_delete=models.CASCADE)

    def to_rag_document(self) -> dict:
        choices_text = "\n".join(
            f"- {c.choice}"
            for c in self.choices.all()
        )
        return {
            "content": f"Question: {self.question_text}\n\nChoices:\n{choices_text}".strip(),
            "metadata": {
                "course_id": self.quiz.course_id,
                "quiz_id": self.quiz_id,
                "question_id": self.id,
                "type": "question",
            }
        }

    def __str__(self):
        return self.question_text[:50]

class Choice(models.Model):
    choice = models.CharField(max_length=255)
    question = models.ForeignKey(Question, related_name='choices', on_delete=models.CASCADE)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.choice


class UserAttempt(models.Model):
    quiz = models.ForeignKey(Quiz, related_name="attempts", on_delete=models.PROTECT)
    student = models.ForeignKey(CustomUser, related_name="quiz_attempts", on_delete=models.CASCADE)
    # null=True means "not yet graded"; 0 is a valid (zero) score after submission
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    # Set at submission time — used for accurate dashboard ordering
    submitted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.student} - {self.quiz}"


class UserAnswer(models.Model):
    chosen_choices = models.ManyToManyField(Choice)
    # CASCADE: answers are meaningless without their parent attempt
    attempt = models.ForeignKey(UserAttempt, related_name="attempt_answers", on_delete=models.CASCADE)
    question = models.ForeignKey(Question, related_name="question_user_answer", on_delete=models.PROTECT)
    question_snapshot = models.JSONField(blank=True)

    class Meta:
        # One answer per question per attempt
        constraints = [
            models.UniqueConstraint(fields=['attempt', 'question'], name='unique_answer_per_question')
        ]

    def save(self, *args, **kwargs):
        if not self.pk:
            if hasattr(self, "question_id") and self.question_id:
                self.question_snapshot = self._generate_snapshot()

        super().save(*args, **kwargs)

    def _generate_snapshot(self):
        choices_data = []
        for choice in self.question.choices.all():
            choices_data.append({
                "id" : choice.id,
                "choice" : choice.choice,
                "is_correct" : choice.is_correct
            })

        return {
            "question_text" : self.question.question_text,
            "choices" : choices_data
        }

    def __str__(self):
        return f"Answer for '{self.question.question_text[:20]}'"


# ── Document Assignments ──────────────────────────────────────────────────────

class Assignment(RAGSearchableMixin):
    """A teacher-uploaded PDF assignment sheet for a course."""
    name        = models.CharField(max_length=200)
    description = models.CharField(max_length=255, null=True, blank=True)
    teacher     = models.ForeignKey(CustomUser, related_name='assignments', on_delete=models.CASCADE)
    course      = models.ForeignKey(Course, related_name='assignments', on_delete=models.CASCADE)
    due_date    = models.DateField()
    document    = models.FileField(upload_to='assignment_docs/')

    def to_rag_document(self) -> dict:
        return {
            "content": f"Assignment: {self.name}\n{self.description or ''}".strip(),
            "metadata": {
                "course_id": self.course_id,
                "assignment_id": self.id,
                "title": self.name,
                "type": "assignment",
            }
        }

    def __str__(self):
        return self.name



class Submission(models.Model):
    """A student's uploaded answer to an Assignment."""
    assignment   = models.ForeignKey(Assignment, related_name='submissions', on_delete=models.CASCADE)
    student      = models.ForeignKey(CustomUser, related_name='submissions', on_delete=models.CASCADE)
    file         = models.FileField(upload_to='submission_docs/')
    submitted_at = models.DateTimeField(auto_now_add=True)
    # null = not yet graded
    score        = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback     = models.TextField(blank=True, default='')

    class Meta:
        unique_together = ('assignment', 'student')

    def __str__(self):
        return f"{self.student} — {self.assignment}"
