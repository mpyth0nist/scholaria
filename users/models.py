from django.db import models

from django.contrib.auth.models import AbstractUser

# Create your models here.


class CustomUser(AbstractUser):
    role = models.CharField(null=False, blank=False)
    birth_date = models.DateField(null=False, blank=False)
    
    REQUIRED_FIELDS = ["role", "birth_date"]  
