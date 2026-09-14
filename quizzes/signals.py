from django.db.models.signals import post_save
from django.dispatch import receiver

from rag.tasks import ingest_searchable_object_task
from .models import Quiz, Question, Assignment


@receiver(post_save, sender=Quiz)
def on_quiz_saved(sender, instance, **kwargs):
    ingest_searchable_object_task.delay(app_label='quizzes', model_name='Quiz', object_id=instance.id)


@receiver(post_save, sender=Question)
def on_question_saved(sender, instance, **kwargs):
    ingest_searchable_object_task.delay(app_label='quizzes', model_name='Question', object_id=instance.id)


@receiver(post_save, sender=Assignment)
def on_assignment_saved(sender, instance, **kwargs):
    ingest_searchable_object_task.delay(app_label='quizzes', model_name='Assignment', object_id=instance.id)
