from django.db.models.signals import post_save
from django.dispatch import receiver

from rag.ingest import ingest_searchable_object
from .models import Quiz, Question


@receiver(post_save, sender=Quiz)
def on_quiz_saved(sender, instance, created, **kwargs):
    if created:
        ingest_searchable_object(instance)


@receiver(post_save, sender=Question)
def on_question_saved(sender, instance, created, **kwargs):
    if created:
        ingest_searchable_object(instance)
