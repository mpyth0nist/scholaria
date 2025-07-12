from django.db import models
from users.models import CustomUser
# Create your models here.

class Course(models.Model):

    course_name = models.CharField(max_length=255, blank=False, null=False)
    subject = models.CharField(max_length=80, blank=False, null=False)
    description = models.CharField(max_length=255)
    thumbnail = models.ImageField(upload_to='course_thumbnails/', null=True, blank=True)
    published = models.BooleanField(default=True)
    teacher = models.ForeignKey(CustomUser, null=True, related_name="courses_taught", on_delete=models.CASCADE)
    student = models.ForeignKey(CustomUser, null=True,related_name="students_enrolled", on_delete=models.CASCADE)


class Module(models.Model):
    title = models.CharField(max_length=255)
    course = models.ForeignKey(Course, related_name="module_course", on_delete=models.CASCADE)
    order=models.IntegerField(default=0)


class Lesson(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    attachments = models.FileField(upload_to = 'lesson_docs/', null=True, blank=True)
    video = models.URLField(blank=True, null=True)
    module = models.ForeignKey(Module, related_name="lesson_module", on_delete=models.CASCADE)