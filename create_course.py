import os

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scholaria.settings')
django.setup()

from courses.models import Course, Lesson, Module
from users.models import CustomUser


def run():
    username = 'youssef_kaddioui'
    password = 'yousef1234'
    
    teacher, created = CustomUser.objects.get_or_create(username=username)
    if created:
        teacher.set_password(password)
        teacher.role = 'Teacher'
        teacher.email = 'youssef_kaddioui@example.com'
        teacher.save()
        print(f"Created teacher {username}")
    else:
        print(f"Teacher {username} already exists")
    
    # Create a course
    course, c_created = Course.objects.get_or_create(
        course_name='Data Structures and Algorithms',
        subject='Computer Science',
        teacher=teacher,
        defaults={
            'description': 'An in-depth guide to DSA.',
            'published': True,
            'is_published': True
        }
    )
    if c_created:
        print(f"Created course {course.course_name}")
    else:
        print(f"Course {course.course_name} already exists")

    # Create a module
    module, m_created = Module.objects.get_or_create(
        title='Trees and Graphs',
        course=course,
        defaults={
            'order': 1,
            'is_published': True
        }
    )
    if m_created:
        print(f"Created module {module.title}")
    else:
        print(f"Module {module.title} already exists")

    # Create a lesson
    lesson, l_created = Lesson.objects.get_or_create(
        title='Introduction to Binary Trees',
        module=module,
        defaults={
            'content': 'A binary tree is a tree data structure in which each node has at most two children, which are referred to as the left child and the right child.',
            'is_published': True
        }
    )
    if l_created:
        print(f"Created lesson {lesson.title}")
    else:
        print(f"Lesson {lesson.title} already exists")

if __name__ == '__main__':
    run()
