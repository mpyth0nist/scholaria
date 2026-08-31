import logging

from rest_framework import status, generics, filters
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Count, Sum

from .models import CustomUser
from .serializers import UserSerializer, AdminUserSerializer
from courses.models import Course, UserLessonProgress
from courses.views import isTeacher
from quizzes.models import Quiz, UserAttempt

logger = logging.getLogger(__name__)


class isAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'ADMIN'
        )


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'size'
    max_page_size = 50


# ── Admin user management ─────────────────────────────────────────────────────

class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, isAdmin]
    serializer_class = AdminUserSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'first_name', 'last_name', 'email']
    ordering_fields = ['first_name', 'last_name', 'username', 'birth_date']
    ordering = ['id']

    def get_queryset(self):
        return CustomUser.objects.all().prefetch_related('courses_taught', 'student_courses')


class AdminUserCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated, isAdmin]
    serializer_class = AdminUserSerializer
    queryset = CustomUser.objects.all()


class AdminUserUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated, isAdmin]
    serializer_class = AdminUserSerializer
    queryset = CustomUser.objects.all()
    lookup_field = 'id'
    lookup_url_kwarg = 'user_id'


class AdminUserDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated, isAdmin]
    queryset = CustomUser.objects.all()
    lookup_field = 'id'
    lookup_url_kwarg = 'user_id'


# ── Public / self-service ─────────────────────────────────────────────────────

class CreateUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class LoggedUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UpdateUserView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        # Enforce that the user can only update their own profile
        return self.request.user


# ── Student / teacher lists ───────────────────────────────────────────────────

class ListStudentsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, isTeacher]
    serializer_class = UserSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'first_name', 'last_name', 'email']
    ordering_fields = ['first_name', 'username', 'email', 'birth_date']
    ordering = ['id']

    def get_queryset(self):
        return CustomUser.objects.filter(role='Student').prefetch_related('courses_taught', 'student_courses')


# ── Auth ──────────────────────────────────────────────────────────────────────

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            # Log the error but still return 205 — the client clears tokens anyway
            logger.exception("Error blacklisting refresh token during logout")

        return Response(status=status.HTTP_205_RESET_CONTENT)


# ── Teacher dashboard ─────────────────────────────────────────────────────────

class TeacherDashboardView(APIView):
    permission_classes = [IsAuthenticated, isTeacher]

    def get(self, request):
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

        quiz_engagement = None
        if teacher_quizzes.exists():
            total_expected_attempts = (
                teacher_quizzes
                .annotate(enrolled=Count('course__student', distinct=True))
                .aggregate(total=Sum('enrolled'))
            )['total'] or 0

            actual_completed_attempts = (
                UserAttempt.objects
                .filter(quiz__in=teacher_quizzes, score__isnull=False)
                .values('student', 'quiz')
                .distinct()
                .count()
            )

            if total_expected_attempts > 0:
                quiz_engagement = actual_completed_attempts / total_expected_attempts

        teacher_courses = Course.objects.filter(teacher=user)
        course_engagement = None
        if teacher_courses.exists():
            from courses.models import Lesson
            total_expected_lessons = (
                Lesson.objects.filter(module__course__in=teacher_courses)
                .annotate(enrolled=Count('module__course__student', distinct=True))
                .aggregate(total=Sum('enrolled'))
            )['total'] or 0

            actual_completed_lessons = UserLessonProgress.objects.filter(
                lesson__module__course__in=teacher_courses
            ).count()

            if total_expected_lessons > 0:
                course_engagement = actual_completed_lessons / total_expected_lessons

        # Combine both metrics into a single engagement percentage
        if quiz_engagement is not None and course_engagement is not None:
            engagement = round(((quiz_engagement + course_engagement) / 2) * 100)
        elif quiz_engagement is not None:
            engagement = round(quiz_engagement * 100)
        elif course_engagement is not None:
            engagement = round(course_engagement * 100)
        else:
            engagement = None

        # ── Recent submissions ────────────────────────────────────────────────
        # Only graded attempts (score__isnull=False) — no "Pending" clutter.
        # select_related avoids 2 extra queries per row.
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
                # score is stored as Decimal — round to 1 dp before sending
                'score': round(float(attempt.score), 1),
                'submitted_at': attempt.submitted_at.isoformat() if attempt.submitted_at else None,
            }
            for attempt in recent_attempts
        ]

        return Response({
            'total_courses': total_courses,
            'total_students': total_students,
            'engagement': engagement,
            'recent_submissions': recent_submissions,
        })
