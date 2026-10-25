FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# uv settings:
# - keep the venv outside /app, so the ./:/app bind mount in docker-compose
#   never hides it and no volume copy of it is needed
# - never install the dev dependency group, including when `uv run` re-syncs
# - don't store uv's download cache inside the image
ENV UV_PROJECT_ENVIRONMENT=/opt/venv \
    UV_NO_DEV=1 \
    UV_NO_CACHE=1

# Runtime system packages only: every Python dependency ships a prebuilt
# wheel (x86_64 and arm64), so no compiler or libpq headers are needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    jpegoptim \
    optipng && \
    rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install --no-cache-dir uv

# Create non-root user and initialize app and venv directories
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app /opt/venv && \
    chown -R appuser:appuser /app /opt/venv

WORKDIR /app

# Copy project dependencies with correct ownership
COPY --chown=appuser:appuser pyproject.toml uv.lock /app/

# Switch to non-root user
USER appuser

# Install runtime dependencies into /opt/venv
RUN uv sync --frozen --no-dev

# Copy the rest of the project with correct ownership
COPY --chown=appuser:appuser . /app/

# Collect static files
RUN uv run manage.py collectstatic --noinput

EXPOSE 8000

CMD ["uv", "run", "gunicorn", "scholaria.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120"]
