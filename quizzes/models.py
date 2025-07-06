from django.db import models
from users.models import CustomUser
# Create your models here.

class Quiz(models.Model):

    name = models.CharField(max_length=200)
    description = models.CharField(null=True, blank=True)


class Question(models.Model):
    question_text = models.CharField(max_length=255)
    question_type = models.CharField(max_length=255, choices = [
        ('multiple_choices', 'Multi Choices'),
        ('text_input', 'Text Input'),
        ('true_false', 'True/False')
    ], default='multiple_choices')
    quiz = models.ForeignKey(Quiz, related_name="questions", on_delete=models.CASCADE)


class Choice(models.Model):
    choice = models.CharField(max_length=255)
    question = models.ForeignKey(Question, related_name='choices', on_delete=models.CASCADE)
    is_correct = models.BooleanField(default=False)


class UserAttempt(models.Model):
    passed_quiz = models.ForeignKey(Quiz, related_name="attempts", on_delete=models.CASCADE)
    student = models.ForeignKey(CustomUser, related_name="quiz_attempts", on_delete=models.CASCADE)
    score = models.IntegerField(null=True)


class UserAnswer(models.Model):
    chosen_choices = models.ManyToManyField(Choice)

    text_answer = models.TextField(blank=True, null=True)

    boolean_answer = models.BooleanField(blank=True, null=True)

    user_answers = models.ForeignKey(UserAttempt, related_name="answers", on_delete=models.CASCADE)
    question = models.ForeignKey(Question, related_name="question_answered", on_delete=models.CASCADE)
