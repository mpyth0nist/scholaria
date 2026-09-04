from django.db import models
from django.conf import settings
from pgvector.django import VectorField

class Conversation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=255, blank=True)

class ChatMessage(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=50) # 'user' or 'assistant'
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

class SemanticCache(models.Model):
    query_text = models.TextField()
    query_embedding = VectorField(dimensions=384)
    response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
