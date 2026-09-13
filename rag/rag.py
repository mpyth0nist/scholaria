
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

        1. Prioritize answering using the context provided below.
        2. If the answer is found in the context, mention which type of material it came from (e.g. "According to your lesson on X..." or "Based on a quiz in this course...").
        3. If the provided context does not contain enough information to fully answer the question, you may use your general base knowledge to provide a helpful response.
        4. When relying on general knowledge, you MUST explicitly state that this information is not from the course materials (e.g., "I couldn't find this exact topic in your course materials, but generally speaking...").
        5. Never fabricate facts, definitions, or explanations.
        6. Keep answers clear, concise, and educational in tone.
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




def rewrite_query(raw_query, history_msgs):
    prompt = """Given the conversation history, rewrite the user's latest query to be a standalone, highly descriptive search query that contains all necessary context. 
If the query is already standalone, just return the query as is. 
HOWEVER, if the query is explicitly casual or completely unrelated to education, academics, or course materials (e.g., movies, sports), return EXACTLY the string 'OFF_TOPIC'.
Do not include any explanations, prefixes, or conversational text. Return ONLY the rewritten query or 'OFF_TOPIC'."""

    messages = [{"role": "system", "content": prompt}]
    if history_msgs:
        messages.extend(history_msgs)
    messages.append({"role": "user", "content": raw_query})

    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=messages,
            temperature=0.0,
            max_tokens=50
        )
        return response.choices[0].message.content.strip().strip('"').strip("'")
    except Exception:
        return raw_query

def llm(query, courses_ids, model_name, user, conversation_id=None):
    from llm.models import Conversation, ChatMessage, SemanticCache
    from pgvector.django import CosineDistance

    # 1. Get or create conversation
    if conversation_id:
        conversation = Conversation.objects.filter(id=conversation_id, user=user).first()
        if not conversation:
            conversation = Conversation.objects.create(user=user, title=query[:50])
    else:
        conversation = Conversation.objects.create(user=user, title=query[:50])

    # 2. Fetch history (before saving current message, so it only contains past context)
    history_msgs = []
    for msg in conversation.messages.order_by('-created_at')[:5]:
        history_msgs.insert(0, {"role": msg.role, "content": msg.content})

    # 3. Save current user message
    ChatMessage.objects.create(conversation=conversation, role='user', content=query)

    # 4. Rewrite query with context
    search_query = rewrite_query(query, history_msgs)
    
    if search_query == 'OFF_TOPIC':
        response_text = "I'm your learning assistant. I can only help you with educational or course-related topics."
        ChatMessage.objects.create(conversation=conversation, role='assistant', content=response_text)
        def off_topic_stream():
            yield response_text
        return off_topic_stream(), conversation.id

    query_embedding = embed_input(search_query)

    # 5. Semantic Cache check (using standalone search_query)
    cached = SemanticCache.objects.annotate(
        distance=CosineDistance('query_embedding', query_embedding)
    ).filter(distance__lt=0.05).order_by("distance").first()

    if cached:
        # Cache hit: save the assistant response to history and return
        ChatMessage.objects.create(conversation=conversation, role='assistant', content=cached.response)
        def cache_stream():
            yield cached.response
        return cache_stream(), conversation.id

    # 6. Build context and invoke LLM
    context = build_context(search_query, courses_ids)

    messages = [{"role": "system", "content": f'{SYSTEM_PROMPT}\n\nContext:\n{context}'}]
    messages.extend(history_msgs)
    messages.append({"role": "user", "content": query})

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
        SemanticCache.objects.create(query_text=search_query, query_embedding=query_embedding, response=final_text)

    return generate(), conversation.id



    






    





