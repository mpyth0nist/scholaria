from services.chunking import chunk_text
from services.embeddings import embed_data
from courses.models import Lesson

def store_lesson(lesson: Lesson):

    embeddings = embed_data(lesson.content)

    lesson.embedding = embeddings

    lesson.save()


lessons = Lesson.objects.all()

for lesson in lessons:

    store_lesson(lesson)

    