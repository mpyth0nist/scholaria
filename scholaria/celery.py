import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scholaria.settings')

app = Celery('scholaria')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
