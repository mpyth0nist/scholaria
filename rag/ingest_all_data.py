from django.core.management.base import BaseCommand
from django.apps import apps
from core.mixins import RAGSearchableMixin
from rag.ingest import ingest_searchable_object

class IngestAllData(BaseCommand):

    help = 'Ingest all RAG-enabled models'

    def handle(self, *args, **options):
        rag_models = [
            model for model in apps.get_models() if issubclass(model, RAGSearchableMixin)
        ]

        for model in rag_models:
            self.stdout.write(f'Start Ingesting... Current Model :{model.__name__}')

            for instance in model.objects.all():
                ingest_searchable_object(instance)

        self.stdout.write(
            self.style.SUCCESS('RAG Ingestion completed.')
        )




