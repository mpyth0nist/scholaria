from langchain_huggingface import HuggingFaceEmbeddings


embedder = HuggingFaceEmbeddings(model_name='all-MiniLM-L6-v2')

def embed_data(chunks):
    return embedder.embed_documents(chunks)



