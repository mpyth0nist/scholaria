from core.mixins import RAGSearchableMixin
from rag.models import DocumentChunk
from utils.chunking import chunk_text
from utils.embeddings import embed_data
from django.contrib.contenttypes.models import ContentType

CHUNK_THRESHOLD = 1000

def ingest_searchable_object(obj):

    if not isinstance(obj, RAGSearchableMixin):
        raise ValueError("Object is not searchable")

    rag_data = obj.to_rag_document()
    content = rag_data['content']
    meta_data = rag_data['metadata']

    if obj.is_chunkable and len(content) > CHUNK_THRESHOLD:
        chunks = chunk_text(content, CHUNK_THRESHOLD, 150)
    else:
        chunks = [content]

    vectors = embed_data(chunks)
    ct = ContentType.objects.get_for_model(obj)

    DocumentChunk.objects.filter(content_type =ct, object_id=obj.id).delete()

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





    


    




    

    
    