from langchain_huggingface import HuggingFaceEmbeddings


embedder = None

def embed_data(chunks):
    global embedder
    if embedder is None:
        print("Loading HuggingFace embeddings model (this takes a few seconds)...")
        embedder = HuggingFaceEmbeddings(model_name='all-MiniLM-L6-v2')
    return embedder.embed_documents(chunks)



