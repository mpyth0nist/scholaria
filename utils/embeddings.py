from langchain_openai import OpenAIEmbeddings

embeddings_func = OpenAIEmbeddings()

def embed_data(document):
    embeddings = embeddings_func.embed_documents(document)

    return embeddings





