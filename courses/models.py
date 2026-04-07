from django.db import models
from users.models import CustomUser
from django.core.validators import MinLengthValidator

# Create your models here.

class Course(models.Model):
    course_name = models.CharField(max_length=90, blank=False, null=False, validators=[MinLengthValidator(3)])
    subject = models.CharField(max_length=25, blank=False, null=False, validators=[MinLengthValidator(2)])
    description = models.CharField(max_length=255)
    thumbnail = models.ImageField(upload_to='course_thumbnails/', null=True, blank=True)
    published = models.BooleanField(default=True)
    teacher = models.ForeignKey(CustomUser, related_name="courses_taught", on_delete=models.CASCADE)
    student = models.ManyToManyField(CustomUser, related_name="student_courses")
    done = models.BooleanField(default=False)

    def __str__(self):
        return self.course_name


class Module(models.Model):
    title = models.CharField(max_length=255)
    course = models.ForeignKey(Course, related_name="module_course", on_delete=models.CASCADE)
    order = models.IntegerField(default=0)
    done = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.course.course_name} - {self.title}"


class Lesson(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    attachments = models.FileField(upload_to = 'lesson_docs/', null=True, blank=True)
    video = models.FileField(upload_to= 'lesson_vids/', blank=True, null=True)
    module = models.ForeignKey(Module, related_name="lesson_module", on_delete=models.CASCADE)
    done = models.BooleanField(default=False)

    def __str__(self):
        return self.title