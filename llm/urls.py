from django.urls import path

from .views import ConversationDeleteView, ConversationListView, ConversationMessagesView, RAGAnswerView

urlpatterns = [
    path('answer/', RAGAnswerView.as_view(), name='rag_answer'),
    path('conversations/<int:pk>/messages/', ConversationMessagesView.as_view(), name='conversation_messages'),
    path('conversations/', ConversationListView.as_view(), name="conversations_list"),
    path('conversations/<int:pk>/', ConversationDeleteView.as_view(), name="conversation_delete")
]
