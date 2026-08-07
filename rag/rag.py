# pyrefly: ignore [missing-import]
import os
import sys
import django
from pgvector.django import CosineDistance


project_root = os.path.abspath("../..") 
if project_root not in sys.path:
    sys.path.append(project_root)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "scholaria.settings")  # Adjust 'scholaria' to your project settings folder name
os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"

django.setup()

from openai import OpenAI
from dotenv import load_dotenv
import os
from langchain_huggingface import HuggingFaceEmbeddings
from courses.models import Lesson


load_dotenv()
client = OpenAI(
    api_key=os.environ.get('GROQ_API_KEY'),
    base_url='https://api.groq.com/openai/v1'
)

embeddings = HuggingFaceEmbeddings(model_name='all-MiniLM-L6-v2')

print('starting')

lessons_list = Lesson.objects.all()
print(lessons_list)
lessons_content = [f"\nTitle:{lesson.title} \nContent: {lesson.content}" for lesson in lessons_list]
evolution_lesson = Lesson.objects.get(title="The evolution of mathematics")
print(evolution_lesson.content)

print('embedding lessons data...')
vectors = embeddings.embed_documents(lessons_content)

for lesson, vector in zip(lessons_list, vectors):
    print(f"Lesson: {lesson.title} Vector: \n {vector}")
    lesson.embedding = vector

print('saving changes to database...')
Lesson.objects.bulk_update(
    lessons_list,
    fields=['embedding'],
    batch_size=100
)

print('Done!')


def embed_input(query : str):
    vectorized_input = embeddings.embed_query(query)

    return vectorized_input

def search(query: str):
    results = CosineDistance()



