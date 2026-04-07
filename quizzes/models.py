from django.db import models
from users.models import CustomUser
from courses.models import Course
from django.core.validators import MinLengthValidator

# Create your models here.

class Quiz(models.Model):

    name = models.CharField(max_length=200, validators=[MinLengthValidator(40)])
    description = models.CharField(max_length=255, null=True, blank=True)
    teacher = models.ForeignKey(CustomUser, related_name="teacher_quizzes", on_delete=models.CASCADE)
    course = models.ForeignKey(Course, related_name="course_quiz", on_delete=models.CASCADE)
    done = models.BooleanField(default=False)
    due_date = models.DateField()

    def __str__(self):
        return self.name

class Question(models.Model):
    question_text = models.TextField(max_length=500)
    quiz = models.ForeignKey(Quiz, related_name="questions", on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        # NOTE: This will raise an error if a question is updated without choices.
        # Ensure choices are added either before updates or handled at the form level.
        if self.pk and self.choices.count() < 2:
            raise ValueError('A question must have at least 2 choices')
        
        super().save(*args, **kwargs)

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
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.student} - {self.quiz}"


class UserAnswer(models.Model):
    chosen_choices = models.ManyToManyField(Choice)
    attempt = models.ForeignKey(UserAttempt, related_name="attempt_answers", on_delete=models.PROTECT)
    question = models.ForeignKey(Question, related_name="question_user_answer", on_delete=models.PROTECT)
    question_snapshot = models.JSONField(blank=True)

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
