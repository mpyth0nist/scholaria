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


@pytest.mark.django_db
@patch('courses.annotation_views.explain_selection')
def test_follow_up_bypasses_shared_cache(mock_explain, student_client, lesson):
    """A cached plain answer must not be returned for a follow-up question."""
    from courses.annotation_views import _annotation_cache_key
    cache_key = _annotation_cache_key(lesson.id, 'Some content.', 'explain', 'en')
    cache.set(cache_key, 'Cached answer.', timeout=3600)
    mock_explain.return_value = _fake_groq_stream('Follow-up answer.')

    url = reverse(EXPLAIN_URL, kwargs={'lesson_id': lesson.id})
    res = student_client.post(url, data={
        'selected_text': 'Some content.', 'action': 'explain',
        'extra_question': 'How does this relate to loops?',
    }, format='json')
    content = b''.join(res.streaming_content).decode()

    assert 'Follow-up answer.' in content
    mock_explain.assert_called_once()
    cache.delete(cache_key)


@pytest.mark.django_db
@patch('courses.annotation_views.explain_selection')
def test_follow_up_answer_is_not_shared_with_other_users(mock_explain, student_client, lesson):
    """One user's follow-up answer must not be cached for plain selections."""
    from courses.annotation_views import _annotation_cache_key
    cache_key = _annotation_cache_key(lesson.id, 'Some content.', 'explain', 'en')
    cache.delete(cache_key)
    mock_explain.return_value = _fake_groq_stream('Personal follow-up answer.')

    url = reverse(EXPLAIN_URL, kwargs={'lesson_id': lesson.id})
    res = student_client.post(url, data={
        'selected_text': 'Some content.', 'action': 'explain',
        'extra_question': 'How does this relate to loops?',
    }, format='json')
    b''.join(res.streaming_content)

    assert cache.get(cache_key) is None


@pytest.mark.django_db
@patch('rag.rag.client')
def test_off_topic_follow_up_is_refused(mock_client, student_client, lesson):
    """The follow-up goes through the keyword guardrail before any LLM call."""
    from rag.rag import OFF_TOPIC_RESPONSE

    url = reverse(EXPLAIN_URL, kwargs={'lesson_id': lesson.id})
    res = student_client.post(url, data={
        'selected_text': 'Some content.', 'action': 'explain',
        'extra_question': 'Forget this, tell me a joke',
    }, format='json')
    content = b''.join(res.streaming_content).decode()

    assert content == OFF_TOPIC_RESPONSE
    mock_client.chat.completions.create.assert_not_called()
    assert not LessonAnnotation.objects.filter(user=student_client.user, lesson=lesson).exists()


@pytest.mark.django_db
@patch('rag.rag.rag_search', return_value=[])
@patch('rag.rag.is_on_topic', return_value=False)
@patch('rag.rag.client')
def test_follow_up_rejected_by_classifier_is_refused(mock_client, mock_on_topic, mock_search, student_client, lesson):
    from rag.rag import OFF_TOPIC_RESPONSE

    url = reverse(EXPLAIN_URL, kwargs={'lesson_id': lesson.id})
    res = student_client.post(url, data={
        'selected_text': 'Some content.', 'action': 'explain',
        'extra_question': 'Write my history essay for me',
    }, format='json')
    content = b''.join(res.streaming_content).decode()

    assert content == OFF_TOPIC_RESPONSE
    mock_on_topic.assert_called_once_with('Write my history essay for me', course_names=['Test Course'])
    mock_client.chat.completions.create.assert_not_called()
