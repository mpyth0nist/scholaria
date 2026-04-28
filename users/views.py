from rest_framework import status
from django.shortcuts import render
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
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
        from django.db.models import Count, Sum

        user = request.user

        total_courses = Course.objects.filter(teacher=user).count()

        # Unique students enrolled in any of the teacher's courses
        total_students = (
            CustomUser.objects
            .filter(student_courses__teacher=user)
            .distinct()
            .count()
        )

        # ── Engagement calculation ────────────────────────────────────────────
        teacher_quizzes = Quiz.objects.filter(teacher=user)

        if not teacher_quizzes.exists():
            # #11: No quizzes yet — return null so the frontend can show "N/A"
            engagement = None
        else:
            # #3: Single aggregate query — no Python loop (was N+1)
            total_expected = (
                teacher_quizzes
                .annotate(enrolled=Count('course__student', distinct=True))
                .aggregate(total=Sum('enrolled'))
            )['total'] or 0

            # #1/#2/#4: Count unique (student, quiz) pairs that were completed
            # (score__isnull=False). This caps the ratio at 100% and ignores
            # abandoned/cancelled attempts.
            actual_completed = (
                UserAttempt.objects
                .filter(quiz__in=teacher_quizzes, score__isnull=False)
                .values('student', 'quiz')
                .distinct()
                .count()
            )

            # #7: round() instead of int() — avoids systematic floor bias
            engagement = (
                round((actual_completed / total_expected) * 100)
                if total_expected > 0 else None
            )

        # ── Recent submissions ────────────────────────────────────────────────
        # #5: Only graded attempts (score__isnull=False) — no "Pending" clutter
        # #6: Order by submitted_at for accurate recency, not insertion id
        # #9: select_related avoids 2 extra queries per row
        recent_attempts = (
            UserAttempt.objects
            .filter(quiz__teacher=user, score__isnull=False)
            .select_related('student', 'quiz')
            .order_by('-submitted_at')[:5]
        )

        recent_submissions = [
            {
                'id': attempt.id,
                'student_name': f"{attempt.student.first_name} {attempt.student.last_name}",
                'quiz_title': attempt.quiz.name,
                # #10: score is stored as Decimal — round to 1 dp before sending
                'score': round(float(attempt.score), 1),
                'submitted_at': attempt.submitted_at.isoformat() if attempt.submitted_at else None,
            }
            for attempt in recent_attempts
        ]

        return Response({
            'total_courses': total_courses,
            'total_students': total_students,
            'engagement': engagement,           # null when no quizzes exist
            'recent_submissions': recent_submissions,
        })





