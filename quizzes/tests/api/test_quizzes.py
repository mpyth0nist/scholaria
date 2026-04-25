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
        "due_date": "2030-12-31",
        "questions": questions,
        # ❌ 'teacher' — not in QuizSerializer fields, omitted
        # ❌ 'done'    — not in QuizSerializer fields, omitted
    }

    res = client_filled_data.post(reverse('create-quiz'), data=payload, format='json')

    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.data}"
    assert len(res.data["questions"]) == 3   


@pytest.mark.django_db
def test_quiz_submit(client_filled_data):

    from quizzes.models import UserAnswer, UserAttempt

    # Login as Student
    res = client_filled_data.post(
        reverse('get_token'),
        data={"username": client_filled_data.student.username, "password": "student123"},
        format='json',
    )
    assert res.status_code == 200, f"Student login failed: {res.data}"
    client_filled_data.credentials(HTTP_AUTHORIZATION=f'Bearer {res.data["access"]}')

    quiz = client_filled_data.quiz
    questions = list(quiz.questions.all())

    # Start an attempt via the API (idempotent endpoint)
    attempt_res = client_filled_data.post(reverse('start-attempt', args=[quiz.id]), format='json')
    assert attempt_res.status_code in (200, 201), f"Start attempt failed: {attempt_res.data}"
    attempt_id = attempt_res.data['id']

    # Submit the correct choice for each question
    for question in questions:
        correct_choice = question.choices.filter(is_correct=True).first()
        assert correct_choice is not None, f"Question {question.id} has no correct choice"

        answer_res = client_filled_data.post(
            reverse('submit-answer', args=[attempt_id, question.id]),
            data={"chosen_choices": [correct_choice.id]},
            format='json',
        )
        assert answer_res.status_code == 201, (
            f"Answer submission failed for question {question.id}: {answer_res.data}"
        )

    # Submit the quiz for grading
    submit_res = client_filled_data.patch(reverse('submit-quiz', args=[attempt_id]), format='json')

    assert submit_res.status_code == 200, f"Quiz submission failed: {submit_res.data}"
    assert float(submit_res.data['score']) == 100.0, f"Expected 100, got {submit_res.data['score']}"
