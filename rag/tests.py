"""
Tests for the RAG ingestion lifecycle: the Celery task and the signals that
keep DocumentChunk in sync with searchable models.

These run the real task (CELERY_TASK_ALWAYS_EAGER in tests); only the
embedding model is stubbed, by the autouse fixture in the root conftest.
"""
import datetime
import io
import logging
from unittest.mock import patch

import pytest
from django.contrib.contenttypes.models import ContentType
from django.core.management import call_command

from courses.models import Course, Lesson, Module
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


@pytest.mark.django_db(transaction=True)
class TestDraftsStayOutOfIndex:

    def test_unpublished_lesson_is_not_indexed(self, module):
        lesson = Lesson.objects.create(title='Draft', content='Secret draft', module=module)
        assert not _chunks_for(lesson).exists()

    def test_publish_then_unpublish(self, module):
        lesson = Lesson.objects.create(title='L1', content='Loops', module=module, is_published=True)
        assert _chunks_for(lesson).exists()

        lesson.is_published = False
        lesson.save()
        assert not _chunks_for(lesson).exists()

    def test_queued_task_does_not_index_a_lesson_unpublished_since(self, module):
        lesson = Lesson.objects.create(title='L1', content='Loops', module=module, is_published=True)
        # Unpublish without signals, as if it happened while the task sat in the queue
        Lesson.objects.filter(id=lesson.id).update(is_published=False)

        ingest_searchable_object_task.delay(app_label='courses', model_name='Lesson', object_id=lesson.id)
        assert not _chunks_for(lesson).exists()

    def test_bulk_ingest_skips_drafts(self, module):
        published = Lesson.objects.create(title='Live', content='Loops', module=module, is_published=True)
        draft = Lesson.objects.create(title='Draft', content='Secret draft', module=module)
        DocumentChunk.objects.all().delete()

        call_command('ingest_all_data', stdout=io.StringIO())

        assert _chunks_for(published).exists()
        assert not _chunks_for(draft).exists()


@pytest.mark.django_db(transaction=True)
class TestDeletedItemsLeaveIndex:

    def test_deleting_quiz_removes_quiz_and_question_chunks(self, quiz):
        question = Question.objects.create(question_text='What is a variable?', quiz=quiz)
        assert _chunks_for(quiz).exists() and _chunks_for(question).exists()

        quiz.delete()
        assert not DocumentChunk.objects.filter(object_id__in=[quiz.id, question.id]).exists()

    def test_deleting_question_removes_its_chunks(self, quiz):
        question = Question.objects.create(question_text='What is a variable?', quiz=quiz)
        question_id = question.id
        question.delete()
        ct = ContentType.objects.get_for_model(Question)
        assert not DocumentChunk.objects.filter(content_type=ct, object_id=question_id).exists()
        assert _chunks_for(quiz).exists()

    def test_deleting_assignment_removes_its_chunks(self, teacher, course):
        assignment = Assignment.objects.create(
            name='Homework 1', teacher=teacher, course=course,
            due_date=datetime.date(2030, 1, 1), document='assignment_docs/hw1.pdf',
        )
        assignment_id = assignment.id
        assignment.delete()
        ct = ContentType.objects.get_for_model(Assignment)
        assert not DocumentChunk.objects.filter(content_type=ct, object_id=assignment_id).exists()


class TestUtilityModelCalls:

    @patch('rag.rag.client')
    def test_classifier_and_rewriter_use_configured_model(self, mock_client, settings):
        from rag.rag import is_on_topic, rewrite_query

        settings.RAG_UTILITY_MODEL = 'some-utility-model'
        mock_client.chat.completions.create.return_value.choices[0].message.content = 'YES'

        is_on_topic('What is a variable?', course_names=['Intro to Python'])
        rewrite_query('and lists?', [{'role': 'user', 'content': 'What is a variable?'}])

        models = [c.kwargs['model'] for c in mock_client.chat.completions.create.call_args_list]
        assert models == ['some-utility-model', 'some-utility-model']

    @patch('rag.rag.client')
    def test_failures_are_logged_not_silent(self, mock_client, caplog):
        from rag.rag import is_on_topic, rewrite_query

        mock_client.chat.completions.create.side_effect = RuntimeError('model_decommissioned')

        with caplog.at_level(logging.WARNING, logger='rag.rag'):
            assert is_on_topic('What is a variable?') is True
            assert rewrite_query('What is a variable?', []) == 'What is a variable?'

        messages = [r.getMessage() for r in caplog.records]
        assert any('Topic classifier failed' in m for m in messages)
        assert any('Query rewriter failed' in m for m in messages)
