from celery import shared_task
from django.apps import apps

@shared_task
def ingest_searchable_object_task(app_label, model_name, object_id):
    model = apps.get_model(app_label, model_name)
    try:
        obj = model.objects.get(id=object_id)
    except model.DoesNotExist:
        return
        
    from rag.ingest import ingest_searchable_object
    ingest_searchable_object(obj)
