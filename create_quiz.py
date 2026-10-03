import datetime
import os

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scholaria.settings')
django.setup()

from courses.models import Course
from quizzes.models import Choice, Question, Quiz
from users.models import CustomUser


def run():
    username = 'youssef_kaddioui'
    user = CustomUser.objects.filter(username=username).first()
    if not user:
        print(f"User {username} not found")
        return
    
    course = Course.objects.filter(teacher=user).first()
    if not course:
        course = Course.objects.create(
            course_name="Fundamentals of Programming",
            subject="Computer Science",
            description="Introduction to programming concepts.",
            teacher=user,
            published=True
        )
        print(f"Created a new course '{course.course_name}' for the user")
        
    quiz = Quiz.objects.create(
        name="Midterm Quiz",
        description="A mid-term assessment to evaluate your understanding.",
        teacher=user,
        course=course,
        due_date=datetime.date.today() + datetime.timedelta(days=7),
    )
    
    q1 = Question.objects.create(
        quiz=quiz,
        question_text="Which of the following is a dynamically typed language?"
    )
    Choice.objects.create(question=q1, choice="Python", is_correct=True)
    Choice.objects.create(question=q1, choice="Java", is_correct=False)
    Choice.objects.create(question=q1, choice="C++", is_correct=False)
    
    q2 = Question.objects.create(
        quiz=quiz,
        question_text="What does HTML stand for?"
    )
    Choice.objects.create(question=q2, choice="HyperText Markup Language", is_correct=True)
    Choice.objects.create(question=q2, choice="HyperText Machine Language", is_correct=False)

    print(f"Quiz '{quiz.name}' created successfully for {username} in course '{course.course_name}'.")

if __name__ == '__main__':
    run()
