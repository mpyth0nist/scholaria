from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from courses.models import Lesson
from rag.models import DocumentChunk
from rag.tasks import ingest_searchable_object_task


@receiver(post_save, sender=Lesson)
def on_lesson_saved(sender, instance, **kwargs):
    def dispatch():
        if instance.is_published:

            ingest_searchable_object_task.delay(app_label='courses', model_name='Lesson', object_id=instance.id)


        else:
            # If unpublished, remove the existing chunk from the vector search index.

            ct = ContentType.objects.get_for_model(Lesson)
            DocumentChunk.objects.filter(content_type=ct, object_id=instance.id).delete()

    transaction.on_commit(dispatch)
        

@receiver(post_delete, sender=Lesson)
def on_lesson_deleted(sender, instance, **kwargs):
    ct = ContentType.objects.get_for_model(Lesson)

    DocumentChunk.objects.filter(content_type=ct, object_id=instance.id).delete()

