import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scholaria.settings')
django.setup()

from users.models import CustomUser
from courses.models import Course, Module, Lesson

def seed():
    try:
        teacher = CustomUser.objects.get(username="oussama_teacher")
    except CustomUser.DoesNotExist:
        print("Teacher not found!")
        return
        
    try:
        course = Course.objects.get(course_name__iexact="Elementary Mathematics", teacher=teacher)
    except Course.DoesNotExist:
        print("Course not found for this teacher! Make sure the course 'Elementary Mathematics' exists.")
        return

    modules_data = [
        {
            "title": "Module 1: Addition & Subtraction",
            "lessons": [
                {"title": "Introduction to Addition", "content": "Let's learn how to add numbers together! Adding is like combining two groups of things into one pile."},
                {"title": "Fun with Subtraction", "content": "Taking away numbers is just as fun as adding them. Let's see how much we have left after taking some away!"},
                {"title": "Word Problems", "content": "Let's try some real-life math puzzles. If Lisa has 5 apples and eats 2, how many does she have?"}
            ]
        },
        {
            "title": "Module 2: Multiplication Basics",
            "lessons": [
                {"title": "What is Multiplication?", "content": "Multiplication is just fast addition! It is the process of adding the same number together multiple times."},
                {"title": "The Times Tables", "content": "Let's memorize our single-digit times tables to make multiplication much faster in our heads."}
            ]
        },
        {
            "title": "Module 3: Introduction to Geometry",
            "lessons": [
                {"title": "Shapes and Angles", "content": "Circles, squares, and triangles are everywhere! We'll look at the differences between standard 2D shapes."},
                {"title": "Measuring Length", "content": "How to use a ruler correctly to measure lines and objects."}
            ]
        }
    ]

    for order, m_data in enumerate(modules_data):
        module, created = Module.objects.get_or_create(
            course=course,
            title=m_data["title"],
            defaults={"order": order}
        )
        if created:
            print(f"✅ Created module: {module.title}")
            
        for l_data in m_data["lessons"]:
            lesson, l_created = Lesson.objects.get_or_create(
                module=module,
                title=l_data["title"],
                defaults={"content": l_data["content"]}
            )
            if l_created:
                print(f"    -> Created lesson: {lesson.title}")

if __name__ == '__main__':
    seed()
