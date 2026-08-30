from django.db import models


class RAGSearchableMixin(models.Model):

    is_chunkable = False

    class Meta:
        abstract = True

    def to_rag_document(self) -> dict:
        """Must return a dict containing 'content' and 'metadata' """
        raise NotImplementedError("Models must implement `to_rag_document()`")