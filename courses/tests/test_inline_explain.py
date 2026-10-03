"""Tests for inline explain views (courses/annotation_views.py)."""
from unittest.mock import MagicMock, patch

import pytest
from django.core.cache import cache
from django.urls import reverse
from rest_framework.test import APIClient

from courses.models import LessonAnnotation

# ── Fixtures ──────────────────────────────────────────────────────────────────

def _make_user(role, username, email):
    from users.models import CustomUser
    return CustomUser.objects.create_user(
        username=username, password='pass123', email=email,
        first_name='Test', last_name=role, role=role, birth_date='2000-01-01',
    )


@pytest.fixture
def teacher(db):
    return _make_user('Teacher', 'teacher_inline', 'teacher_inline@test.net')


@pytest.fixture
def student(db):
    return _make_user('Student', 'student_inline', 'student_inline@test.net')


@pytest.fixture
def course(db, teacher):
    from courses.models import Course
    return Course.objects.create(
        course_name='Test Course', description='desc',
        subject='subject', teacher=teacher,
    )


@pytest.fixture
def lesson(db, course):
    from courses.models import Lesson, Module
    module = Module.objects.create(title='Mod', course=course)
    return Lesson.objects.create(title='Lesson 1', content='Some content.', module=module, is_published=True)


@pytest.fixture
def enrolled_student(db, student, course):
    course.student.add(student)
    return student


@pytest.fixture
def student_client(db, enrolled_student):
    api = APIClient()
    api.force_authenticate(user=enrolled_student)
    api.user = enrolled_student
    return api


@pytest.fixture
def unenrolled_client(db, student):
    api = APIClient()
    api.force_authenticate(user=student)
    return api


def _fake_groq_stream(text='Explained text.'):
    """Yield a minimal Groq-style streaming response."""
    chunk = MagicMock()
    chunk.choices[0].delta.content = text
    yield chunk
    end = MagicMock()
    end.choices[0].delta.content = None
    yield end


EXPLAIN_URL = 'lesson-explain'
ANNOTATIONS_URL = 'lesson-annotations'
PIN_URL = 'annotation-pin'
DELETE_URL = 'annotation-delete'


# ── Tests ─────────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_invalid_action_returns_400(student_client, lesson):
    url = reverse(EXPLAIN_URL, kwargs={'lesson_id': lesson.id})
    res = student_client.post(url, data={
        'selected_text': 'hello', 'action': 'invalid_action',
    }, format='json')
    assert res.status_code == 400


@pytest.mark.django_db
def test_not_enrolled_returns_403(unenrolled_client, lesson):
    url = reverse(EXPLAIN_URL, kwargs={'lesson_id': lesson.id})
    res = unenrolled_client.post(url, data={
        'selected_text': 'hello', 'action': 'explain',
    }, format='json')
    assert res.status_code == 403


@pytest.mark.django_db
@patch('courses.annotation_views.explain_selection')
def test_annotation_saved_after_stream(mock_explain, student_client, lesson):
    mock_explain.return_value = _fake_groq_stream('The explanation.')
    url = reverse(EXPLAIN_URL, kwargs={'lesson_id': lesson.id})
    res = student_client.post(url, data={
        'selected_text': 'Some content.', 'action': 'explain',
    }, format='json')
    assert res.status_code == 200
    # Force the generator to exhaust (streaming response)
    content = b''.join(res.streaming_content).decode()
    assert 'The explanation.' in content
    assert LessonAnnotation.objects.filter(
        user=student_client.user, lesson=lesson, action='explain',
    ).exists()


@pytest.mark.django_db
@patch('courses.annotation_views.explain_selection')
def test_cache_hit_skips_llm(mock_explain, student_client, lesson):
    from courses.annotation_views import _annotation_cache_key
    cache_key = _annotation_cache_key(lesson.id, 'Some content.', 'explain', 'en')
    cache.set(cache_key, 'Cached answer.', timeout=3600)

    url = reverse(EXPLAIN_URL, kwargs={'lesson_id': lesson.id})
    res = student_client.post(url, data={
        'selected_text': 'Some content.', 'action': 'explain',
    }, format='json')
    assert res.status_code == 200
    content = b''.join(res.streaming_content).decode()
    assert 'Cached answer.' in content
    mock_explain.assert_not_called()  # LLM was bypassed
    cache.delete(cache_key)
