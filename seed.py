import os
import django
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scholaria.settings')
django.setup()

from users.models import CustomUser
from courses.models import StudentClass

def seed():
    class_names = ["Math 101 Cohort", "Physics 201 Cohort", "Literature 301 Cohort"]
    classes = [StudentClass.objects.get_or_create(name=n)[0] for n in class_names]
    birth_date = datetime.date(2005, 1, 1)

    for i, c in enumerate(classes):
        for j in range(4):
            num = (i * 4) + j + 1
            user, created = CustomUser.objects.get_or_create(
                username=f"mockstud{num}",
                defaults={
                    "email": f"student{num}@example.com",
                    "first_name": "Mock",
                    "last_name": f"Student{num}",
                    "role": "Student",
                    "birth_date": birth_date
                }
            )
            if created:
                user.set_password("password123")
                user.save()
            c.students.add(user)
        print(f"Assigned 4 students to {c.name}")

if __name__ == '__main__':
    seed()
