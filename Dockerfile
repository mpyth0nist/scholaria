FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    postgresql-client \
    jpegoptim \
    optipng

# Install uv
RUN pip install uv

# Copy project dependencies
COPY pyproject.toml uv.lock /app/

# Install dependencies
RUN uv sync --frozen --no-dev

# Copy the rest of the project
COPY . /app/

# Collect static files
RUN uv run manage.py collectstatic --noinput

# Run as non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uv", "run", "gunicorn", "scholaria.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120"]