
from openai import OpenAI, APIStatusError, APITimeoutError, RateLimitError
from pgvector.django import CosineDistance
from rag.models import DocumentChunk
from utils.data_prepping import clean_text
from utils.embeddings import embedder
from logging import getLogger
import os

logger = getLogger(__name__)
client = OpenAI(
    api_key=os.environ.get('GROQ_API_KEY'),
    base_url='https://api.groq.com/openai/v1'
)

class ServiceUnavailable(Exception):
    ''' Exception raised when an API call is timed out or rate limited'''

    pass

SYSTEM_PROMPT = '''
 You are Scholaria Assistant, an AI learning companion embedded in the Scholaria LMS platform.

        Your role is to help students understand course material and assist teachers with content-related questions.

        ## Rules

        1. Answer ONLY using the context provided below. Do not use any outside knowledge.
        2. If the answer is not found in the context, say clearly: "I couldn't find information about that in your course materials."
        3. Never fabricate facts, definitions, or explanations.
        4. Keep answers clear, concise, and educational in tone.
        5. When relevant, mention which type of material the answer came from (e.g. "According to your lesson on X..." or "Based on a quiz in this course...").
'''



def embed_input(query : str):
    vectorized_input = embedder.embed_query(query)

    return vectorized_input

def rag_search(query: str, courses_ids : list, top_k=5):

    query_embedding = embed_input(query)

    raw_data = DocumentChunk.objects.filter(course_id__in=courses_ids).annotate(
            distance=CosineDistance(
                'embedding',
                query_embedding
            )
        ).filter(distance__lt=0.4).order_by("distance")[:top_k]

    chunks = [
        {
            "content" : c.content,
            "course_id" : c.course_id,
            "source_type" : c.content_type_name,
            "object_id" : c.object_id,
            "distance" : round(c.distance, 4)
        } for c in raw_data ]
    
    return chunks

def build_context(query, courses_ids):

    results = rag_search(query, courses_ids)
    if not results:
        raise ValueError('I dont have relevant informations to answer your question')

    context = "\n\n---\n\n".join([ clean_text(r["content"]) for r in results ])

    return context




def llm(query, courses_ids, model_name):

    context = build_context(query, courses_ids)

    try:
        answer = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role" : "system", 'content': SYSTEM_PROMPT},
                {"role" : "user", "content": f' Question : {query} \n Context: {context}'}]
        )
    except (APIStatusError, APITimeoutError, RateLimitError) as error:
        logger.exception('GROQ API Error')
        raise ServiceUnavailable('The server is temporarily unavailable') from error

    return answer.choices[0].message.content



    






    





