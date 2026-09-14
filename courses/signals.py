from django.db.models.signals import post_save
from django.dispatch import receiver

from courses.models import Lesson
from rag.tasks import ingest_searchable_object_task


@receiver(post_save, sender=Lesson)
def on_lesson_saved(sender, instance, **kwargs):
    ingest_searchable_object_task.delay(app_label='courses', model_name='Lesson', object_id=instance.id)
