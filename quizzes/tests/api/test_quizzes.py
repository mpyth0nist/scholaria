import pytest
from django.urls import reverse
from quizzes.models import Quiz, Question, Choice
from rest_framework.test import APIClient


@pytest.mark.django_db

def test_quiz_list(client_filled_data):
    
    res = client_filled_data.get(reverse('show-quizzes'))

    assert res.status_code == 200

@pytest.mark.django_db
def test_quiz_create(client_filled_data):
    """
    Uses client_filled_data so a real Course already exists in the test DB.
    client_filled_data.course['id'] gives the valid FK the serializer needs.
    """
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

    payload = {
        "name": "Test Quiz Name",
        "description": "Test description",
        "course": client_filled_data.course['id'],  # real FK from fixture
        "due_date": "2026-04-15",
        "questions": questions,
        # ❌ 'teacher' — not in QuizSerializer fields, omitted
        # ❌ 'done'    — not in QuizSerializer fields, omitted
    }

    res = client_filled_data.post(reverse('create-quiz'), data=payload, format='json')

    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.data}"
    assert len(res.data["questions"]) == 3   



