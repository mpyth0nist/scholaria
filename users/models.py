from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.


class CustomUser(AbstractUser):

    CHOICES = (
        ('Teacher', 'Teacher'),
        ('Student', 'Student'),
        ('ADMIN', 'ADMIN')
    )
    role = models.CharField(max_length=10, choices=CHOICES)
    birth_date = models.DateField(null=False, blank=False)
    REQUIRED_FIELDS = ["role", "birth_date"]




