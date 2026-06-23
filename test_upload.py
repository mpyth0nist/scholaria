import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "scholaria.settings")
django.setup()

from django.core.files.uploadedfile import SimpleUploadedFile
from courses.serializers import LessonSerializer

file = SimpleUploadedFile("test.pdf", b"file_content", content_type="application/pdf")
data = {"title": "Test", "content": "Content"}
files = {"attachments": file}

serializer = LessonSerializer(data=data)
print("Without file valid:", serializer.is_valid(), serializer.errors)

# To simulate multipart data, we pass files in a dictionary or just put the file in data
data_with_file = {"title": "Test", "content": "Content", "attachments": file}
serializer = LessonSerializer(data=data_with_file)
print("With file valid:", serializer.is_valid(), serializer.errors)
