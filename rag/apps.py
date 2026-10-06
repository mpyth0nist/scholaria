import logging
import os
import sys

from django.apps import AppConfig
from django.conf import settings

logger = logging.getLogger(__name__)


def should_warmup() -> bool:
    if not getattr(settings, "RAG_WARMUP", True):
        return False
    if os.getenv("RAG_WARMUP", "1").lower() in ("0", "false", "no"):
        return False

    if "pytest" in sys.modules or getattr(settings, "TESTING", False):
        return False

    # Check if executed via manage.py
    is_manage = any("manage.py" in arg for arg in sys.argv[:2])
    if is_manage:
        # Only run for runserver (and runserver variants like runserver_plus)
        is_runserver = any("runserver" in arg for arg in sys.argv)
        if not is_runserver:
            return False
        # In runserver auto-reload, parent process monitors while child process serves requests (RUN_MAIN='true')
        noreload = "--noreload" in sys.argv
        if not noreload and os.environ.get("RUN_MAIN") != "true":
            return False
        return True

    # Skip standalone python scripts and one-liners
    script_name = os.path.basename(sys.argv[0]) if sys.argv else ""
    if (script_name.endswith(".py") and script_name not in ("wsgi.py", "asgi.py")) or script_name == "-c":
        return False

    return True


class RagConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "rag"

    def ready(self):
        if not should_warmup():
            return

        try:
            logger.info("Warming up RAG pipeline (embeddings & tokenizer)...")
            from rag.rag import get_encoder
            from utils.embeddings import get_embedder

            get_embedder()
            get_encoder()
            logger.info("RAG pipeline warm-up complete.")
        except Exception as exc:
            logger.warning("RAG pipeline warm-up failed, falling back to lazy load: %s", exc)

