"""Tests for the seed_demo management command."""
import datetime
import io

import pytest
from django.core.management import call_command
from django.core.management.base import CommandError

from courses.models import Course, Lesson, UserLessonProgress
from quizzes.models import Question, Quiz, UserAnswer, UserAttempt
from rag.models import DocumentChunk
from users.models import CustomUser


def _seed(**options):
    call_command('seed_demo', force=True, anchor_date=datetime.date(2026, 10, 1), stdout=io.StringIO(), **options)


def _counts():
    return {
        'courses': Course.objects.count(),
        'lessons': Lesson.objects.count(),
        'quizzes': Quiz.objects.count(),
        'questions': Question.objects.count(),
        'students': CustomUser.objects.filter(role='Student').count(),
        'attempts': UserAttempt.objects.count(),
        'answers': UserAnswer.objects.count(),
        'progress': UserLessonProgress.objects.count(),
        'chunks': DocumentChunk.objects.count(),
    }


@pytest.mark.django_db
def test_seeds_a_complete_demo():
    _seed()

    counts = _counts()
    assert counts['courses'] == 3
    assert counts['lessons'] == Lesson.objects.filter(is_published=True).count() > 0
    assert counts['attempts'] > 0 and counts['progress'] > 0
    assert DocumentChunk.objects.filter(content_type_name='lesson').exists()

    teacher = CustomUser.objects.get(username='youssef_kaddioui')
    student = CustomUser.objects.get(username='demo_student')
    assert teacher.check_password('ScholariaDemo2026!')
    assert student.check_password('ScholariaDemo2026!')
    assert student.student_courses.count() == 3


@pytest.mark.django_db
def test_activity_is_consistent():
    _seed()

    for attempt in UserAttempt.objects.select_related('quiz__course'):
        # Every attempt belongs to a student enrolled in that quiz's course
        assert attempt.quiz.course.student.filter(id=attempt.student_id).exists()

        # Scores match the answers, as SubmitQuiz would grade them
        questions = attempt.quiz.questions.count()
        correct = sum(
            all(choice.is_correct for choice in answer.chosen_choices.all())
            for answer in attempt.attempt_answers.all()
        )
        assert attempt.attempt_answers.count() == questions
        assert float(attempt.score) == pytest.approx(correct * 100 / questions, abs=0.01)

    for progress in UserLessonProgress.objects.select_related('lesson__module__course'):
        assert progress.lesson.module.course.student.filter(id=progress.student_id).exists()


@pytest.mark.django_db
def test_rerun_is_idempotent():
    _seed()
    first = _counts()
    _seed()
    assert _counts() == first


@pytest.mark.django_db
def test_reset_removes_legacy_demo_courses():
    _seed()
    teacher = CustomUser.objects.get(username='youssef_kaddioui')
    legacy = Course.objects.create(course_name='Développement Web & APIs', subject='Informatique', teacher=teacher)
    quiz = Quiz.objects.create(name='Contrôle 1 : REST', teacher=teacher, course=legacy, due_date=datetime.date(2030, 1, 1))
    UserAttempt.objects.create(student=CustomUser.objects.get(username='youssef.elamrani'), quiz=quiz)

    _seed(reset=True)

    assert not Course.objects.filter(id=legacy.id).exists()
    assert Course.objects.filter(teacher=teacher).count() == 3


@pytest.mark.django_db
def test_refuses_to_take_over_a_real_account():
    CustomUser.objects.create_user(
        username='youssef.elamrani', password='x', email='real@example.com',
        role='Student', birth_date='2002-01-01',
    )
    with pytest.raises(CommandError, match='non-demo account'):
        _seed()


@pytest.mark.django_db
def test_requires_debug_or_force(settings):
    settings.DEBUG = False
    with pytest.raises(CommandError, match='Safety guard'):
        call_command('seed_demo', stdout=io.StringIO())
