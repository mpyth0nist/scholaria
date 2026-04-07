from rest_framework import status
from django.shortcuts import render
from rest_framework import generics
from rest_framework.response import Response
from .serializers import UserSerializer
from .models import CustomUser
from courses.models import Course
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.pagination import PageNumberPagination
from rest_framework import filters

from courses.views import isTeacher
from quizzes.models import Quiz, UserAttempt


class CreateUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class LoggedUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'size'
    max_page_size = 50

class ListStudentsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, isTeacher]
    serializer_class = UserSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'first_name', 'last_name', 'email']
    ordering_fields = ['first_name', 'username', 'email', 'birth_date']
    ordering = ['id'] # Default ordering

    def get_queryset(self):
        return CustomUser.objects.filter(role='Student')



class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            
        except Exception as e:
            print(e)
            
        return Response(status=status.HTTP_205_RESET_CONTENT)
    
    
class UpdateUserView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    queryset = CustomUser.objects.all()
    lookup_field = 'id'
    lookup_url_kwarg = 'user_id'

    def perform_update(self, serializer):
        if serializer.is_valid():
            serializer.save()
        else:
            print(serializer.errors)
            raise ValidationError(serializer.errors)


class TeacherDashboardView(APIView):
    permission_classes = [IsAuthenticated, isTeacher]

    def get(self, request):
        user = request.user
        
        total_courses = Course.objects.filter(teacher=user).count()
        
        # Unique students in the teacher's courses
        total_students = CustomUser.objects.filter(student_courses__teacher=user).distinct().count()
        
        # Engagement calculation via Quizzes
        teacher_quizzes = Quiz.objects.filter(teacher=user)
        total_expected_attempts = sum(quiz.course.student.count() for quiz in teacher_quizzes)
        actual_attempts = UserAttempt.objects.filter(quiz__in=teacher_quizzes).count()
        
        engagement = 0
        if total_expected_attempts > 0:
            engagement = int((actual_attempts / total_expected_attempts) * 100)
            
        recent_attempts = UserAttempt.objects.filter(quiz__teacher=user).order_by('-id')[:5]
        recent_submissions = []
        for attempt in recent_attempts:
            recent_submissions.append({
                'id': attempt.id,
                'student_name': f"{attempt.student.first_name} {attempt.student.last_name}",
                'quiz_title': attempt.quiz.name,
                'score': float(attempt.score) if attempt.score is not None else "Pending",
            })
            
        return Response({
            'total_courses': total_courses,
            'total_students': total_students,
            'engagement': engagement,
            'recent_submissions': recent_submissions
        })


