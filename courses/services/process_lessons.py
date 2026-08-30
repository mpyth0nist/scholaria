from utils.chunking import chunk_text
from utils.embeddings import embed_data
from courses.models import Lesson

def store_lesson(lesson: Lesson):

    embeddings = embed_data(lesson.content)

    lesson.embedding = embeddings

    lesson.save()




    