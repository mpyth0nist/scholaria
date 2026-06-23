import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "scholaria.settings")
django.setup()

from django.test import Client
from django.core.files.uploadedfile import SimpleUploadedFile
from users.models import CustomUser
from courses.models import Lesson

lesson = Lesson.objects.first()
teacher = lesson.module.course.teacher

client = Client(HTTP_HOST="localhost:8000")
client.force_login(teacher)

file = SimpleUploadedFile("test.pdf", b"file_content", content_type="application/pdf")
response = client.patch(f"/api/courses/lessons/{lesson.id}/update-lesson/", {
    "title": lesson.title,
    "content": "Updated content",
    "attachments": file
}, format="multipart")

print("Status Code:", response.status_code)
if response.status_code == 400:
    print("Response:", response.json())
else:
    print("Success!")
