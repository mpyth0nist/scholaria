from logging import getLogger
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from courses.models import Course
from rag.rag import llm, ServiceUnavailable
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied

logger = getLogger(__name__)

class RAGAnswerView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        query = request.data.get('query')

        if not query:
            return Response({'error': 'query is required'}, status=400)

        user = self.request.user
        if user.role.lower() == 'student':
            courses_ids = Course.objects.filter(
                Q(student=user) | Q(student_classes__students=user)
            ).distinct().values_list('id', flat=True)
        elif user.role.lower() == 'teacher':
            courses_ids = Course.objects.filter(teacher=user).distinct().values_list('id', flat=True)
        else:
            raise PermissionDenied('You are neither a teacher nor a student')

        try:
            answer = llm(query, courses_ids, 'llama-3.1-8b-instant')
        except ValueError as e:
            logger.warning('No relevant context found for query')
            return Response({'answer': e.args[0]}, status=404)
        except ServiceUnavailable:
            logger.exception('Groq API unavailable')
            return Response({'error': 'AI service is temporarily unavailable'}, status=503)

        return Response({'answer': answer})

