from django.db import transaction
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from courses.models import Lesson
from rag.ingest import delete_chunks_for
from rag.tasks import ingest_searchable_object_task


@receiver(post_save, sender=Lesson)
def on_lesson_saved(sender, instance, **kwargs):
    def dispatch():
        if instance.is_rag_visible():
            ingest_searchable_object_task.delay(app_label='courses', model_name='Lesson', object_id=instance.id)
        else:
            # Unpublished: remove it from the vector search index right away
            delete_chunks_for(instance)

    transaction.on_commit(dispatch)


@receiver(post_delete, sender=Lesson)
def on_lesson_deleted(sender, instance, **kwargs):
    delete_chunks_for(instance)
