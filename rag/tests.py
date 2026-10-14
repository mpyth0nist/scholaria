"""
Tests for the RAG ingestion lifecycle: the Celery task and the signals that
keep DocumentChunk in sync with searchable models.

These run the real task (CELERY_TASK_ALWAYS_EAGER in tests); only the
embedding model is stubbed, by the autouse fixture in the root conftest.
"""
import datetime

import pytest
from django.contrib.contenttypes.models import ContentType

from courses.models import Course, Module
from quizzes.models import Assignment, Question, Quiz
from rag.models import DocumentChunk
from rag.tasks import ingest_searchable_object_task
from users.models import CustomUser


@pytest.fixture
def teacher(db):
    return CustomUser.objects.create_user(
        username='rag_teacher', password='pass1234',
        email='rag_teacher@test.com', role='Teacher',
        birth_date='1990-01-01',
    )


@pytest.fixture
def course(teacher):
    return Course.objects.create(course_name='Intro to Python', subject='CS', teacher=teacher)


@pytest.fixture
def module(course):
    return Module.objects.create(title='Module 1', course=course, order=1)


@pytest.fixture
def quiz(teacher, course):
    return Quiz.objects.create(
        name='Python basics quiz', teacher=teacher, course=course,
        due_date=datetime.date(2030, 1, 1),
    )


def _chunks_for(obj):
    ct = ContentType.objects.get_for_model(obj)
    return DocumentChunk.objects.filter(content_type=ct, object_id=obj.id)


@pytest.mark.django_db(transaction=True)
class TestIngestTask:

    def test_task_ingests_object(self, quiz):
        DocumentChunk.objects.all().delete()
        ingest_searchable_object_task.delay(app_label='quizzes', model_name='Quiz', object_id=quiz.id)
        assert _chunks_for(quiz).exists()

    def test_task_ignores_missing_object(self, db):
        ingest_searchable_object_task.delay(app_label='quizzes', model_name='Quiz', object_id=999999)
        assert not DocumentChunk.objects.exists()

    def test_saving_quiz_indexes_it(self, quiz):
        assert _chunks_for(quiz).count() == 1

    def test_saving_question_indexes_it(self, quiz):
        question = Question.objects.create(question_text='What is a variable?', quiz=quiz)
        assert _chunks_for(question).exists()

    def test_saving_assignment_indexes_it(self, teacher, course):
        assignment = Assignment.objects.create(
            name='Homework 1', teacher=teacher, course=course,
            due_date=datetime.date(2030, 1, 1), document='assignment_docs/hw1.pdf',
        )
        assert _chunks_for(assignment).exists()
