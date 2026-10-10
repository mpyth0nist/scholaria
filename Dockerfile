FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    postgresql-client \
    jpegoptim \
    optipng && \
    rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Create non-root user and initialize app directory
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app && \
    chown -R appuser:appuser /app

WORKDIR /app

# Copy project dependencies with correct ownership
COPY --chown=appuser:appuser pyproject.toml uv.lock /app/

# Switch to non-root user
USER appuser

# Install dependencies into .venv as appuser
RUN uv sync --frozen --no-dev

# Copy the rest of the project with correct ownership
COPY --chown=appuser:appuser . /app/

# Collect static files
RUN uv run manage.py collectstatic --noinput

EXPOSE 8000

CMD ["uv", "run", "gunicorn", "scholaria.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120"]