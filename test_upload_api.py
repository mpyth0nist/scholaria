import os
import django
import sys
import json
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "scholaria.settings")
django.setup()

from users.models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile

teacher = CustomUser.objects.filter(role='Teacher').first()
if not teacher:
    print("No teacher found")
    sys.exit()

refresh = RefreshToken.for_user(teacher)
token = str(refresh.access_token)

from courses.models import Lesson
lesson = Lesson.objects.first()
if not lesson:
    print("No lesson found")
    sys.exit()

client = APIClient()
client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

file = SimpleUploadedFile("test.pdf", b"file_content", content_type="application/pdf")
response = client.patch(f"/api/courses/lessons/{lesson.id}/update-lesson/", {
    "title": "Updated from script",
    "content": "Updated content",
    "attachments": file
}, format='multipart')

print("Status:", response.status_code)
try:
    print("Body:", json.dumps(response.json(), indent=2))
except:
    print("Body:", response.content)

