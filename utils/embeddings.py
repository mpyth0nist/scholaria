from langchain_huggingface import HuggingFaceEmbeddings
from django.conf import settings


embedder = None

def get_embedder():
    global embedder
    if embedder is None:
        print("Loading HuggingFace embeddings model (this takes a few seconds)...")
        model_name = getattr(settings, 'RAG_EMBEDDING_MODEL', 'all-MiniLM-L6-v2')
        embedder = HuggingFaceEmbeddings(model_name=model_name)
    return embedder

def embed_data(chunks):
    return get_embedder().embed_documents(chunks)



