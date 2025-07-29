from django.db import models
from users.models import CustomUser
# Create your models here.
class Announcement(models.Model):
    announcement_subject = models.CharField(max_length=255)
    announcement_text = models.TextField()
    author = models.ForeignKey(CustomUser, related_name="announcements", on_delete=models.CASCADE)