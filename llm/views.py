from logging import getLogger

from django.conf import settings
from django.db.models import Q
from django.http import StreamingHttpResponse
import rest_framework
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics

from courses.models import Course
from rag.rag import ServiceUnavailable, llm
from scholaria.throttles import LLMRateThrottle

logger = getLogger(__name__)

class RAGAnswerView(APIView):

    permission_classes = [IsAuthenticated]
    throttle_classes = [LLMRateThrottle]

    def post(self, request):
        query = request.data.get('query')
        conversation_id = request.data.get('conversation_id')
        lesson_id = request.data.get('lesson_id')

        if not query:
            return Response({'error': 'query is required'}, status=400)

        user = self.request.user
        if user.role.lower() == 'student':
            courses_ids = list(Course.objects.filter(
                Q(student=user) | Q(student_classes__students=user)
            ).distinct().values_list('id', flat=True))
        elif user.role.lower() == 'teacher':
            courses_ids = list(Course.objects.filter(teacher=user).distinct().values_list('id', flat=True))
        else:
            raise PermissionDenied('You are neither a teacher nor a student')

        try:
            stream_gen, conv_id = llm(query, courses_ids, settings.DEFAULT_LLM_MODEL, user=user, conversation_id=conversation_id, lesson_id=lesson_id)
        except ValueError as e:
            logger.warning('No relevant context found for query')
            return Response({'answer': e.args[0]}, status=404)
        except ServiceUnavailable:
            logger.exception('Groq API unavailable')
            return Response({'error': 'AI service is temporarily unavailable'}, status=503)

        response = StreamingHttpResponse(stream_gen, content_type='text/plain')
        response['X-Conversation-Id'] = str(conv_id)
        response['Access-Control-Expose-Headers'] = 'X-Conversation-Id'
        return response


class ConversationMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        from llm.models import Conversation

        try:
            conversation = Conversation.objects.get(pk=pk, user=request.user)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation not found'}, status=404)

        messages = conversation.messages.order_by('created_at')
        serialized = [
            {
                'id': msg.id,
                'role': 'ai' if msg.role == 'assistant' else msg.role,
                'content': msg.content,
                'created_at': msg.created_at.isoformat(),
            }
            for msg in messages
        ]

        return Response({
            'conversation_id': conversation.id,
            'title': conversation.title,
            'messages': serialized,
        })


class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from llm.models import Conversation

        student = request.user

        conversations = Conversation.objects.filter(user=student).prefetch_related('messages').order_by('-created_at')
        serialized = []
        for conversation in conversations:
            first_user_message = next((message for message in conversation.messages.all() if message.role == 'user'), None)
            title = conversation.title or (first_user_message.content[:72].strip() if first_user_message else '')
            serialized.append({
                'id': conversation.id,
                'title': title,
                'created_at': conversation.created_at.isoformat(),
            })
        return Response(serialized)


class ConversationDeleteView(generics.DestroyAPIView):

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        from llm.models import Conversation

        return Conversation.objects.filter(user=self.request.user)






        
