import pytest
from rest_framework.test import APIClient
from django.urls import reverse


# ── Base unauthenticated client ───────────────────────────────────────────────
@pytest.fixture
def client():
    return APIClient()


# ── Helpers ───────────────────────────────────────────────────────────────────
def _make_authenticated_client(role, username, password, email, birth_date):
    """
    Creates a CustomUser directly in the DB (bypassing the API so we don't
    depend on the registration endpoint being correct), obtains a JWT, and
    returns an APIClient with the Authorization header pre-set.
    """
    from users.models import CustomUser

    user = CustomUser.objects.create_user(   # create_user hashes the password
        username=username,
        password=password,
        email=email,
        first_name="Testing",
        last_name=role,
        role=role,
        birth_date=birth_date,
    )

    # Obtain JWT pair
    api = APIClient()
    res = api.post(
        reverse('get_token'),   # url name: api/users/token/
        data={"username": username, "password": password},  # data=, not kwargs=
        format='json',
    )

    assert res.status_code == 200, (
        f"Token request failed for {role}: {res.status_code} {res.data}"
    )

    token = res.data['access']
    api.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')  # pre-auth the client
    api.user = user   # attach the user object for convenience in tests
    return api


# ── Role fixtures ─────────────────────────────────────────────────────────────
@pytest.fixture
def student_client(db):   # 'db' fixture grants database access to the fixture
    return _make_authenticated_client(
        role='Student',
        username='testing_student',
        password='student123',
        email='student_test@scholaria.net',
        birth_date='2001-10-10',
    )


@pytest.fixture
def teacher_client(db):
    return _make_authenticated_client(
        role='Teacher',
        username='testing_teacher',
        password='teacher123',
        email='teacher_test@scholaria.net',
        birth_date='1999-10-10',
    )


# ── Pre-filled data fixture (course + quiz already created) ───────────────────
@pytest.fixture
def client_filled_data(teacher_client, db):
    """
    Returns the teacher_client after creating a course and a quiz via the API.
    Attaches `.course` and `.quiz` to the client object for use in tests.
    """
    from users.models import CustomUser
    from quizzes.models import Quiz, Choice

    student = CustomUser.objects.create_user(   # create_user hashes the password
        username="student",
        password="student123",
        email="student@scholaria.net",
        first_name="Testing",
        last_name="student",
        role="Student",
        birth_date="2001-10-10",
    )
    course_res = teacher_client.post(
        reverse('create_course'),   # api/courses/create-course/
        data={
            "course_name": "Testing course",
            "description": "testing course's description",
            "subject": "testing_course subject",
            "student" : [student.id]
        },
        format='json',
    )
    assert course_res.status_code == 201, f"Course creation failed: {course_res.data}"

    questions = [
        {
            'question_text': "Question #1",
            'choices': [
                {"choice": "choice #1", "is_correct": True},
                {"choice": "choice #2", "is_correct": False},
            ]
        },
        {
            'question_text': "Question #2",
            'choices': [
                {"choice": "choice #1", "is_correct": True},
                {"choice": "choice #2", "is_correct": False},
            ]
        },
        {
            'question_text': "Question #3",
            'choices': [
                {"choice": "choice #1", "is_correct": True},
                {"choice": "choice #2", "is_correct": False},
            ]
        },
    ]
    quiz_res = teacher_client.post(
        reverse('create-quiz'),     # api/quizzes/create_quiz/
        data={
            "name": "Testing quiz",
            "description": "testing quiz's description",
            "course": course_res.data['id'],   # Response object → .data['id'], not .id
            "due_date": "2030-12-31",
            "questions": questions,
        },
        format='json',
    )
    assert quiz_res.status_code == 201, f"Quiz creation failed: {quiz_res.data}"

    teacher_client.course = course_res.data
    teacher_client.quiz = Quiz.objects.get(id=quiz_res.data['id'])
    teacher_client.choices = Choice.objects.filter(question__quiz=teacher_client.quiz)
    teacher_client.student = student
    return teacher_client
