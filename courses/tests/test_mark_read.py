import pytest
from unittest.mock import MagicMock, patch
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework.exceptions import PermissionDenied
from courses.views import LessonMarkRead

def test_lesson_mark_read_toggle_to_read():
    factory = APIRequestFactory()
    view = LessonMarkRead.as_view()

    mock_user = MagicMock()
    mock_user.pk = 42
    mock_user.role = 'Student'
    mock_user.is_authenticated = True

    mock_course = MagicMock()
    mock_course.student.filter.return_value.exists.return_value = True

    mock_lesson = MagicMock()
    mock_lesson.module.course = mock_course

    with patch('courses.views.get_object_or_404', return_value=mock_lesson), \
         patch('courses.views.UserLessonProgress') as mock_progress_cls:

        mock_qs = MagicMock()
        mock_qs.exists.return_value = False
        mock_progress_cls.objects.filter.return_value = mock_qs

        request = factory.post('/api/courses/lessons/1/mark-read/', {}, format='json')
        force_authenticate(request, user=mock_user)

        response = view(request, lesson_id=1)

        assert response.status_code == 200
        assert response.data == {"status": "marked as read", "done": True}
        mock_progress_cls.objects.create.assert_called_once_with(student=mock_user, lesson=mock_lesson)


def test_lesson_mark_read_toggle_to_unread():
    factory = APIRequestFactory()
    view = LessonMarkRead.as_view()

    mock_user = MagicMock()
    mock_user.pk = 42
    mock_user.role = 'Student'
    mock_user.is_authenticated = True

    mock_course = MagicMock()
    mock_course.student.filter.return_value.exists.return_value = True

    mock_lesson = MagicMock()
    mock_lesson.module.course = mock_course

    with patch('courses.views.get_object_or_404', return_value=mock_lesson), \
         patch('courses.views.UserLessonProgress') as mock_progress_cls:

        mock_qs = MagicMock()
        mock_qs.exists.return_value = True
        mock_progress_cls.objects.filter.return_value = mock_qs

        request = factory.post('/api/courses/lessons/1/mark-read/', {}, format='json')
        force_authenticate(request, user=mock_user)

        response = view(request, lesson_id=1)

        assert response.status_code == 200
        assert response.data == {"status": "marked as read", "done": False} or response.data == {"status": "marked as unread", "done": False}
        assert response.data['done'] is False
        mock_qs.delete.assert_called_once()


def test_lesson_mark_read_explicit_unread():
    factory = APIRequestFactory()
    view = LessonMarkRead.as_view()

    mock_user = MagicMock()
    mock_user.pk = 42
    mock_user.role = 'Student'
    mock_user.is_authenticated = True

    mock_course = MagicMock()
    mock_course.student.filter.return_value.exists.return_value = True

    mock_lesson = MagicMock()
    mock_lesson.module.course = mock_course

    with patch('courses.views.get_object_or_404', return_value=mock_lesson), \
         patch('courses.views.UserLessonProgress') as mock_progress_cls:

        mock_qs = MagicMock()
        mock_progress_cls.objects.filter.return_value = mock_qs

        request = factory.post('/api/courses/lessons/1/mark-read/', {'action': 'unread'}, format='json')
        force_authenticate(request, user=mock_user)

        response = view(request, lesson_id=1)

        assert response.status_code == 200
        assert response.data == {"status": "marked as unread", "done": False}
        mock_qs.delete.assert_called_once()


def test_lesson_mark_read_delete_method():
    factory = APIRequestFactory()
    view = LessonMarkRead.as_view()

    mock_user = MagicMock()
    mock_user.pk = 42
    mock_user.role = 'Student'
    mock_user.is_authenticated = True

    mock_course = MagicMock()
    mock_course.student.filter.return_value.exists.return_value = True

    mock_lesson = MagicMock()
    mock_lesson.module.course = mock_course

    with patch('courses.views.get_object_or_404', return_value=mock_lesson), \
         patch('courses.views.UserLessonProgress') as mock_progress_cls:

        mock_qs = MagicMock()
        mock_progress_cls.objects.filter.return_value = mock_qs

        request = factory.delete('/api/courses/lessons/1/mark-read/')
        force_authenticate(request, user=mock_user)

        response = view(request, lesson_id=1)

        assert response.status_code == 200
        assert response.data == {"status": "marked as unread", "done": False}
        mock_qs.delete.assert_called_once()


def test_lesson_mark_read_not_enrolled():
    factory = APIRequestFactory()
    view = LessonMarkRead.as_view()

    mock_user = MagicMock()
    mock_user.pk = 42
    mock_user.role = 'Student'
    mock_user.is_authenticated = True

    mock_course = MagicMock()
    mock_course.student.filter.return_value.exists.return_value = False

    mock_lesson = MagicMock()
    mock_lesson.module.course = mock_course

    with patch('courses.views.get_object_or_404', return_value=mock_lesson):
        request = factory.post('/api/courses/lessons/1/mark-read/', {}, format='json')
        force_authenticate(request, user=mock_user)

        response = view(request, lesson_id=1)
        assert response.status_code == 403


