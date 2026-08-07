from django.db import models
from pgvector.django import VectorField, HnswIndex
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class DocumentChunk(models.Model):

    content = models.TextField()
    embedding = VectorField(dimensions=384, null=True, blank=True)

    course_id = models.IntegerField()
    content_type_name = models.CharField(max_length=70)

    object_id = models.IntegerField()
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    source_object = GenericForeignKey('content_type', 'object_id')


    class Meta:

        indexes = [
            HnswIndex(
                name="unified_chunk_vector_idx",
                fields=["embedding"],
                opclasses = ["vector_cosine_ops"]
            )
        ]


