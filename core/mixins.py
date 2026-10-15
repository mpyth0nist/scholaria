from django.db import models


class RAGSearchableMixin(models.Model):

    is_chunkable = False

    class Meta:
        abstract = True

    def to_rag_document(self) -> dict:
        """Must return a dict containing 'content' and 'metadata' """
        raise NotImplementedError("Models must implement `to_rag_document()`")

    def is_rag_visible(self) -> bool:
        """Whether this object may appear in AI answers. Hidden objects are
        removed from the index instead of being ingested."""
        return True
