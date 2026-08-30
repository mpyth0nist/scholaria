"""
Comprehensive tests for the Scholaria RAG pipeline.

Tests cover:
  - Utility layer:  clean_text, chunk_text
  - Service layer:  build_context, rag_search, llm (with mocks)
  - Ingestion:      ingest_searchable_object
  - API layer:      RAGAnswerView (auth, role scoping, error paths)
"""
import pytest
from unittest.mock import patch, MagicMock
from django.test import override_settings
from rest_framework.test import APIClient
from django.urls import reverse

from users.models import CustomUser
from courses.models import Course, Module, Lesson, StudentClass
from rag.models import DocumentChunk
from django.contrib.contenttypes.models import ContentType


# ══════════════════════════════════════════════════════════════════════════════
# Fixtures
# ══════════════════════════════════════════════════════════════════════════════

@pytest.fixture
def teacher(db):
    return CustomUser.objects.create_user(
        username='teacher1', password='pass1234',
        email='teacher@test.com', role='Teacher',
        birth_date='1990-01-01',
    )


@pytest.fixture
def student(db):
    return CustomUser.objects.create_user(
        username='student1', password='pass1234',
        email='student@test.com', role='Student',
        birth_date='2000-01-01',
    )


@pytest.fixture
def student2(db):
    """A second student NOT enrolled in any course."""
    return CustomUser.objects.create_user(
        username='student2', password='pass1234',
        email='student2@test.com', role='Student',
        birth_date='2000-06-15',
    )


@pytest.fixture
def admin_user(db):
    return CustomUser.objects.create_user(
        username='admin1', password='pass1234',
        email='admin@test.com', role='ADMIN',
        birth_date='1985-01-01',
    )


@pytest.fixture
def course(teacher, student):
    c = Course.objects.create(
        course_name='Intro to Python',
        subject='CS',
        description='A beginner course',
        teacher=teacher,
    )
    c.student.add(student)
    return c


@pytest.fixture
def course2(teacher):
    """A separate course the student is NOT enrolled in."""
    return Course.objects.create(
        course_name='Advanced ML',
        subject='CS',
        description='An advanced course',
        teacher=teacher,
    )


@pytest.fixture
def module(course):
    return Module.objects.create(title='Module 1', course=course, order=1)


@pytest.fixture
def lesson(module):
    return Lesson.objects.create(
        title='Variables and Types',
        content='<p>Variables store data values. Python has no command for declaring a variable.</p>',
        module=module,
    )


@pytest.fixture
def chunk(course, lesson):
    """A pre-created DocumentChunk for retrieval tests."""
    ct = ContentType.objects.get_for_model(Lesson)
    return DocumentChunk.objects.create(
        content='Variables store data values. Python has no command for declaring a variable.',
        embedding=[0.1] * 384,
        course_id=course.id,
        content_type=ct,
        content_type_name='lesson',
        object_id=lesson.id,
    )


@pytest.fixture
def chunk_other_course(course2):
    """Chunk belonging to a course the student is NOT enrolled in."""
    ct = ContentType.objects.get_for_model(Lesson)
    return DocumentChunk.objects.create(
        content='Neural networks are a subset of machine learning.',
        embedding=[0.2] * 384,
        course_id=course2.id,
        content_type=ct,
        content_type_name='lesson',
        object_id=9999,
    )


def _auth_client(user):
    """Return an APIClient with JWT auth for the given user."""
    client = APIClient()
    res = client.post(
        reverse('get_token'),
        data={'username': user.username, 'password': 'pass1234'},
        format='json',
    )
    assert res.status_code == 200, f"Token failed: {res.data}"
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['access']}")
    return client


# ══════════════════════════════════════════════════════════════════════════════
# 1. Utility Tests  (clean_text, chunk_text)
# ══════════════════════════════════════════════════════════════════════════════

class TestCleanText:
    def test_strips_html(self):
        from utils.data_prepping import clean_text
        assert clean_text('<p>Hello <b>world</b></p>') == 'Hello world'

    def test_plain_text_unchanged(self):
        from utils.data_prepping import clean_text
        assert clean_text('no html here') == 'no html here'

    def test_empty_string(self):
        from utils.data_prepping import clean_text
        assert clean_text('') == ''


class TestChunkText:
    def test_short_text_returns_single_chunk(self):
        from utils.chunking import chunk_text
        result = chunk_text('Short text.', chunk_size=200, overlap=30)
        assert len(result) == 1

    def test_long_text_returns_multiple_chunks(self):
        from utils.chunking import chunk_text
        long_text = 'A' * 600
        result = chunk_text(long_text, chunk_size=200, overlap=30)
        assert len(result) > 1

    def test_empty_text_returns_empty_list(self):
        from utils.chunking import chunk_text
        assert chunk_text('') == []
        assert chunk_text('   ') == []

    def test_none_returns_empty_list(self):
        from utils.chunking import chunk_text
        assert chunk_text(None) == []


# ══════════════════════════════════════════════════════════════════════════════
# 2. Ingestion Tests
# ══════════════════════════════════════════════════════════════════════════════

@pytest.mark.django_db
class TestIngestion:

    @patch('rag.ingest.embed_data')
    def test_ingest_creates_chunks(self, mock_embed, lesson):
        """Ingesting a lesson creates DocumentChunk rows."""
        mock_embed.return_value = [[0.1] * 384]  # one chunk → one vector

        from rag.ingest import ingest_searchable_object
        ingest_searchable_object(lesson)

        chunks = DocumentChunk.objects.filter(object_id=lesson.id)
        assert chunks.exists()
        assert chunks.first().course_id == lesson.module.course_id

    @patch('rag.ingest.embed_data')
    def test_ingest_is_idempotent(self, mock_embed, lesson):
        """Running ingest twice doesn't duplicate chunks."""
        mock_embed.return_value = [[0.1] * 384]

        from rag.ingest import ingest_searchable_object
        ingest_searchable_object(lesson)
        ingest_searchable_object(lesson)

        ct = ContentType.objects.get_for_model(Lesson)
        count = DocumentChunk.objects.filter(
            content_type=ct, object_id=lesson.id
        ).count()
        # Should have exactly 1 chunk (short content, not chunkable at 200 chars)
        assert count >= 1

    def test_ingest_rejects_non_searchable(self):
        """Passing a non-RAGSearchableMixin object raises ValueError."""
        from rag.ingest import ingest_searchable_object
        with pytest.raises(ValueError, match="not searchable"):
            ingest_searchable_object("not a model instance")

    @patch('rag.ingest.embed_data')
    def test_ingest_chunkable_lesson(self, mock_embed, module):
        """A lesson with long content should produce multiple chunks."""
        long_content = 'This is a test sentence. ' * 100  # ~2500 chars
        lesson = Lesson.objects.create(
            title='Long Lesson', content=long_content, module=module,
        )
        # Return one vector per expected chunk
        num_chunks = len(long_content) // 200 + 1
        mock_embed.return_value = [[0.1] * 384] * (num_chunks + 5)  # enough vectors

        from rag.ingest import ingest_searchable_object
        ingest_searchable_object(lesson)

        ct = ContentType.objects.get_for_model(Lesson)
        count = DocumentChunk.objects.filter(
            content_type=ct, object_id=lesson.id
        ).count()
        assert count > 1, "Long chunkable lesson should create multiple chunks"


# ══════════════════════════════════════════════════════════════════════════════
# 3. Service Layer Tests  (rag_search, build_context, llm)
# ══════════════════════════════════════════════════════════════════════════════

@pytest.mark.django_db
class TestBuildContext:

    @patch('rag.rag.rag_search')
    def test_raises_on_empty_results(self, mock_search):
        """build_context raises ValueError when no chunks are found."""
        mock_search.return_value = []

        from rag.rag import build_context
        with pytest.raises(ValueError):
            build_context('test query', [1, 2, 3])

    @patch('rag.rag.rag_search')
    def test_returns_concatenated_context(self, mock_search):
        """build_context joins chunk content with separator."""
        mock_search.return_value = [
            {'content': '<p>Chunk one</p>', 'course_id': 1,
             'source_type': 'lesson', 'object_id': 1, 'distance': 0.1},
            {'content': '<p>Chunk two</p>', 'course_id': 1,
             'source_type': 'lesson', 'object_id': 2, 'distance': 0.2},
        ]

        from rag.rag import build_context
        context = build_context('test query', [1])

        assert 'Chunk one' in context
        assert 'Chunk two' in context
        assert '---' in context  # separator


@pytest.mark.django_db
class TestLLMFunction:

    @patch('rag.rag.client')
    @patch('rag.rag.build_context')
    def test_returns_llm_answer(self, mock_context, mock_client):
        """llm() returns the LLM's response string."""
        mock_context.return_value = 'Some context about variables.'

        # Mock the Groq response structure
        mock_choice = MagicMock()
        mock_choice.message.content = 'Variables store data values.'
        mock_response = MagicMock()
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response

        from rag.rag import llm
        result = llm('What are variables?', [1], 'llama-3.1-8b-instant')

        assert result == 'Variables store data values.'
        mock_client.chat.completions.create.assert_called_once()

    @patch('rag.rag.client')
    @patch('rag.rag.build_context')
    def test_raises_service_unavailable_on_api_error(self, mock_context, mock_client):
        """llm() raises ServiceUnavailable when Groq API errors."""
        from openai import APITimeoutError
        from rag.rag import llm, ServiceUnavailable

        mock_context.return_value = 'Some context.'
        mock_client.chat.completions.create.side_effect = APITimeoutError(request=MagicMock())

        with pytest.raises(ServiceUnavailable):
            llm('test query', [1], 'llama-3.1-8b-instant')

    @patch('rag.rag.build_context')
    def test_propagates_value_error_when_no_context(self, mock_context):
        """llm() propagates ValueError from build_context."""
        mock_context.side_effect = ValueError('no relevant info')

        from rag.rag import llm
        with pytest.raises(ValueError):
            llm('test query', [1], 'llama-3.1-8b-instant')


# ══════════════════════════════════════════════════════════════════════════════
# 4. API / View Tests  (RAGAnswerView)
# ══════════════════════════════════════════════════════════════════════════════

@pytest.mark.django_db
class TestRAGAnswerViewAuth:

    def test_unauthenticated_returns_401(self):
        """Unauthenticated requests are rejected."""
        client = APIClient()
        res = client.post(
            reverse('rag_answer'),
            data={'query': 'test'},
            format='json',
        )
        assert res.status_code == 401

    def test_empty_query_returns_400(self, student, course):
        """Missing query param returns 400."""
        client = _auth_client(student)
        res = client.post(reverse('rag_answer'), data={}, format='json')
        assert res.status_code == 400
        assert 'error' in res.data

    def test_admin_role_returns_403(self, admin_user):
        """ADMIN role is rejected with PermissionDenied."""
        client = _auth_client(admin_user)
        res = client.post(
            reverse('rag_answer'),
            data={'query': 'test'},
            format='json',
        )
        assert res.status_code == 403


@pytest.mark.django_db
class TestRAGAnswerViewStudent:

    @patch('llm.views.llm')
    def test_student_gets_answer(self, mock_llm, student, course):
        """Enrolled student gets a successful answer."""
        mock_llm.return_value = 'Variables store data.'

        client = _auth_client(student)
        res = client.post(
            reverse('rag_answer'),
            data={'query': 'What are variables?'},
            format='json',
        )
        assert res.status_code == 200
        assert res.data['answer'] == 'Variables store data.'

    @patch('llm.views.llm')
    def test_student_scoping_passes_enrolled_courses(self, mock_llm, student, course, course2):
        """Student's request only passes enrolled course IDs to llm()."""
        mock_llm.return_value = 'answer'

        client = _auth_client(student)
        client.post(
            reverse('rag_answer'),
            data={'query': 'test'},
            format='json',
        )

        # Inspect what course_ids were passed
        call_args = mock_llm.call_args
        courses_ids = list(call_args[0][1])  # second positional arg
        assert course.id in courses_ids
        assert course2.id not in courses_ids

    @patch('llm.views.llm')
    def test_student_class_enrollment_scoping(self, mock_llm, student, teacher):
        """Student enrolled via StudentClass gets correct course scope."""
        # Create a course with class-based enrollment
        student_class = StudentClass.objects.create(name='Class A')
        student_class.students.add(student)

        class_course = Course.objects.create(
            course_name='Class Course',
            subject='Math',
            teacher=teacher,
        )
        class_course.student_classes.add(student_class)

        mock_llm.return_value = 'answer from class course'

        client = _auth_client(student)
        client.post(
            reverse('rag_answer'),
            data={'query': 'test'},
            format='json',
        )

        call_args = mock_llm.call_args
        courses_ids = list(call_args[0][1])
        assert class_course.id in courses_ids

    @patch('llm.views.llm')
    def test_unenrolled_student_gets_no_results(self, mock_llm, student2):
        """Student with no course enrollment triggers ValueError path."""
        mock_llm.side_effect = ValueError('no relevant info')

        client = _auth_client(student2)
        res = client.post(
            reverse('rag_answer'),
            data={'query': 'What is ML?'},
            format='json',
        )
        assert res.status_code == 404


@pytest.mark.django_db
class TestRAGAnswerViewTeacher:

    @patch('llm.views.llm')
    def test_teacher_gets_answer(self, mock_llm, teacher, course):
        """Teacher gets a successful answer for their course."""
        mock_llm.return_value = 'Teacher answer.'

        client = _auth_client(teacher)
        res = client.post(
            reverse('rag_answer'),
            data={'query': 'What are variables?'},
            format='json',
        )
        assert res.status_code == 200
        assert res.data['answer'] == 'Teacher answer.'

    @patch('llm.views.llm')
    def test_teacher_scoping_only_own_courses(self, mock_llm, teacher, course):
        """Teacher only gets courses they teach."""
        # Create a second teacher with their own course
        teacher2 = CustomUser.objects.create_user(
            username='teacher2', password='pass1234',
            email='teacher2@test.com', role='Teacher',
            birth_date='1988-01-01',
        )
        other_course = Course.objects.create(
            course_name='Other Course', subject='Art', teacher=teacher2,
        )

        mock_llm.return_value = 'answer'

        client = _auth_client(teacher)
        client.post(
            reverse('rag_answer'),
            data={'query': 'test'},
            format='json',
        )

        call_args = mock_llm.call_args
        courses_ids = list(call_args[0][1])
        assert course.id in courses_ids
        assert other_course.id not in courses_ids


@pytest.mark.django_db
class TestRAGAnswerViewErrors:

    @patch('llm.views.llm')
    def test_no_context_returns_404(self, mock_llm, student, course):
        """ValueError from service layer returns 404."""
        mock_llm.side_effect = ValueError('no relevant info')

        client = _auth_client(student)
        res = client.post(
            reverse('rag_answer'),
            data={'query': 'something irrelevant'},
            format='json',
        )
        assert res.status_code == 404
        assert 'answer' in res.data

    @patch('llm.views.llm')
    def test_service_unavailable_returns_503(self, mock_llm, student, course):
        """ServiceUnavailable from service layer returns 503."""
        from rag.rag import ServiceUnavailable
        mock_llm.side_effect = ServiceUnavailable('API down')

        client = _auth_client(student)
        res = client.post(
            reverse('rag_answer'),
            data={'query': 'test'},
            format='json',
        )
        assert res.status_code == 503
        assert 'error' in res.data
