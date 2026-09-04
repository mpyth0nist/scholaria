
from openai import APITimeoutError
from openai import OpenAI
from pgvector.django import CosineDistance
from rag.models import DocumentChunk
from utils.data_prepping import clean_text
from utils.embeddings import embed_data, get_embedder
from logging import getLogger
import os
import tiktoken
from openai import APIConnectionError, RateLimitError, APITimeoutError, APIStatusError

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
    vectorized_input = get_embedder().embed_query(query)

    return vectorized_input

def rag_search(query: str, courses_ids : list, top_k=5):

    query_embedding = embed_input(query)

    raw_data = DocumentChunk.objects.filter(course_id__in=courses_ids).annotate(
            distance=CosineDistance(
                'embedding',
                query_embedding
            )
        ).order_by("distance")[:top_k]

    chunks = [
        {
            "content" : c.content,
            "course_id" : c.course_id,
            "source_type" : c.content_type_name,
            "object_id" : c.object_id,
            "distance" : round(c.distance, 4)
        } for c in raw_data ]
    
    return chunks

def build_context(query, courses_ids, max_tokens=3000):

    results = rag_search(query, courses_ids)
    if not results:
        return ""

    encoder = tiktoken.get_encoding("cl100k_base")
    valid_chunks = []
    current_tokens = 0
    for r in results:
        chunk_text = clean_text(r["content"])
        tokens = len(encoder.encode(chunk_text))
        if current_tokens + tokens > max_tokens:
            break
        valid_chunks.append(chunk_text)
        current_tokens += tokens

    context = "\n\n---\n\n".join(valid_chunks)

    return context




def llm(query, courses_ids, model_name, user, conversation_id=None):
    from llm.models import Conversation, ChatMessage, SemanticCache
    from pgvector.django import CosineDistance

    # Semantic Cache check
    query_embedding = embed_input(query)
    cached = SemanticCache.objects.annotate(
        distance=CosineDistance('query_embedding', query_embedding)
    ).filter(distance__lt=0.05).order_by("distance").first()

    if cached:
        def cache_stream():
            yield cached.response
        return cache_stream(), conversation.id

    # Get or create conversation
    if conversation_id:
        conversation = Conversation.objects.filter(id=conversation_id, user=user).first()
        if not conversation:
            conversation = Conversation.objects.create(user=user, title=query[:50])
    else:
        conversation = Conversation.objects.create(user=user, title=query[:50])

    # Save user message
    ChatMessage.objects.create(conversation=conversation, role='user', content=query)

    # Fetch history
    history_msgs = []
    for msg in conversation.messages.order_by('-created_at')[:5]:
        history_msgs.insert(0, {"role": msg.role, "content": msg.content})

    context = build_context(query, courses_ids)

    messages = [{"role": "system", "content": f'{SYSTEM_PROMPT}\n\nContext:\n{context}'}]
    messages.extend(history_msgs)

    try:
        response_stream = client.chat.completions.create(
            model=model_name,
            messages=messages,
            stream=True
        )
    except (APITimeoutError, RateLimitError, APIConnectionError, APIStatusError) as error:
        logger.exception('GROQ API Error')
        raise ServiceUnavailable('LLM provider is down') from error

    def generate():
        full_response = []
        for chunk in response_stream:
            content = chunk.choices[0].delta.content
            if content:
                full_response.append(content)
                yield content
        
        final_text = "".join(full_response)
        ChatMessage.objects.create(conversation=conversation, role='assistant', content=final_text)
        SemanticCache.objects.create(query_text=query, query_embedding=query_embedding, response=final_text)

    return generate(), conversation.id



    






    





