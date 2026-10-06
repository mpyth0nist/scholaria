from django.urls import path

from .views import ConversationMessagesView, RAGAnswerView

urlpatterns = [
    path('answer/', RAGAnswerView.as_view(), name='rag_answer'),
    path('conversations/<int:pk>/messages/', ConversationMessagesView.as_view(), name='conversation_messages'),
]
