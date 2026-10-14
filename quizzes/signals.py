from django.db import transaction
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from rag.ingest import delete_chunks_for
from rag.tasks import ingest_searchable_object_task

from .models import Assignment, Question, Quiz


def _dispatch_ingest(model_name, object_id):
    # Wait for the commit so the worker never reads a row that isn't saved yet
    transaction.on_commit(
        lambda: ingest_searchable_object_task.delay(app_label='quizzes', model_name=model_name, object_id=object_id)
    )


@receiver(post_save, sender=Quiz)
def on_quiz_saved(sender, instance, **kwargs):
    _dispatch_ingest('Quiz', instance.id)


@receiver(post_save, sender=Question)
def on_question_saved(sender, instance, **kwargs):
    _dispatch_ingest('Question', instance.id)


@receiver(post_save, sender=Assignment)
def on_assignment_saved(sender, instance, **kwargs):
    _dispatch_ingest('Assignment', instance.id)


# Deleting a Quiz cascades to its Questions; each cascaded row sends its own
# post_delete, so their chunks are removed too.
@receiver(post_delete, sender=Quiz)
@receiver(post_delete, sender=Question)
@receiver(post_delete, sender=Assignment)
def on_searchable_deleted(sender, instance, **kwargs):
    delete_chunks_for(instance)
