from django.contrib.contenttypes.models import ContentType
from django.db import transaction

from core.mixins import RAGSearchableMixin
from rag.models import DocumentChunk
from utils.chunking import chunk_text
from utils.embeddings import embed_data

CHUNK_THRESHOLD = 1000


def delete_chunks_for(obj):
    """Remove every indexed chunk belonging to `obj`."""
    ct = ContentType.objects.get_for_model(obj)
    DocumentChunk.objects.filter(content_type=ct, object_id=obj.id).delete()


def ingest_searchable_object(obj):

    with transaction.atomic():
        if not isinstance(obj, RAGSearchableMixin):
            raise ValueError("Object is not searchable")

        # Drafts must never reach the index, even if a task was queued while
        # the object was still published.
        if not obj.is_rag_visible():
            delete_chunks_for(obj)
            return

        rag_data = obj.to_rag_document()
        content = rag_data['content']
        meta_data = rag_data['metadata']

        if obj.is_chunkable and len(content) > CHUNK_THRESHOLD:
            chunks = chunk_text(content, CHUNK_THRESHOLD, 150)
        else:
            chunks = [content]

        vectors = embed_data(chunks)
        ct = ContentType.objects.get_for_model(obj)

        DocumentChunk.objects.filter(content_type=ct, object_id=obj.id).delete()

        chunks_to_create = [
            DocumentChunk(
                content = chunk,
                embedding = vector,
                course_id = meta_data["course_id"],
                content_type = ct,
                content_type_name = meta_data["type"],
                object_id = obj.id
            ) for chunk, vector in zip(chunks, vectors)
        ]
        DocumentChunk.objects.bulk_create(chunks_to_create)
