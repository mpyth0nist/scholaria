import logging
import threading

from django.conf import settings
from langchain_huggingface import HuggingFaceEmbeddings

logger = logging.getLogger(__name__)

embedder = None
_embedder_lock = threading.Lock()


def get_embedder():
    global embedder
    if embedder is None:
        with _embedder_lock:
            if embedder is None:
                model_name = getattr(settings, 'RAG_EMBEDDING_MODEL', 'all-MiniLM-L6-v2')
                logger.info("Loading HuggingFace embeddings model: %s", model_name)
                try:
                    embedder = HuggingFaceEmbeddings(
                        model_name=model_name,
                        model_kwargs={'local_files_only': True},
                    )
                except Exception as exc:
                    logger.warning(
                        "Failed to load embeddings model (%s) locally (%s); retrying online.",
                        model_name,
                        exc,
                    )
                    embedder = HuggingFaceEmbeddings(model_name=model_name)
    return embedder


def embed_data(chunks):
    return get_embedder().embed_documents(chunks)



