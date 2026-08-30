from django.db import models
from django.db.models import ForeignKey
from users.models import CustomUser
from django.core.validators import MinLengthValidator, MinValueValidator
from pgvector.django import HnswIndex, VectorField
from core.mixins import RAGSearchableMixin
from utils.data_prepping import clean_text

# Create your models here.




class StudentClass(models.Model):
    name = models.CharField(max_length=100)
    students = models.ManyToManyField(CustomUser, limit_choices_to={'role': 'Student'}, related_name="classes")

    def __str__(self):
        return self.name

class Course(models.Model):
    course_name = models.CharField(max_length=90, blank=False, null=False, validators=[MinLengthValidator(3)])
    subject = models.CharField(max_length=25, blank=False, null=False, validators=[MinLengthValidator(2)])
    description = models.CharField(max_length=255, blank=True, default='')
    thumbnail = models.ImageField(upload_to='course_thumbnails/', null=True, blank=True)
    published = models.BooleanField(default=True)
    teacher = models.ForeignKey(CustomUser, related_name="courses_taught", on_delete=models.CASCADE)
    student = models.ManyToManyField(CustomUser, related_name="student_courses", blank=True)
    student_classes = models.ManyToManyField(StudentClass, related_name="courses", blank=True)
    done = models.BooleanField(default=False)

    def __str__(self):
        return self.course_name


class Module(models.Model):
    title = models.CharField(max_length=255)
    course = models.ForeignKey(Course, related_name="module_course", on_delete=models.CASCADE)
    order = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    done = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.course.course_name} - {self.title}"


class Lesson(RAGSearchableMixin):
    title = models.CharField(max_length=255)
    content = models.TextField()
    attachments = models.FileField(upload_to = 'lesson_docs/', null=True, blank=True)
    video = models.FileField(upload_to= 'lesson_vids/', blank=True, null=True)
    module = models.ForeignKey(Module, related_name="lesson_module", on_delete=models.CASCADE)
    done = models.BooleanField(default=False)
    embedding = VectorField(dimensions=384, null=True, blank=True)
    is_chunkable = True

    class Meta:
        indexes = [
            HnswIndex(
                name='lesson_index',
                fields=['embedding'],
                m=16,
                ef_construction=64,
                opclasses=["vector_cosine_ops"]
            )
        ]

    def to_rag_document(self) -> dict:
        stripped_content = clean_text(self.content) if self.content else ""
        return {
            "content": f"title : {self.title}\n\n{stripped_content}".strip(),
            "metadata": {
                "course_id": self.module.course_id if self.module_id else None,
                "module_id": self.module_id,
                "lesson_id": self.id,
                "title": self.title,
                "type": "lesson",
            }
        }

    def __str__(self):
        return self.title


class UserLessonProgress(models.Model):
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='user_progress')
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'lesson')

    def __str__(self):
        return f"{self.student.username} completed {self.lesson.title}"