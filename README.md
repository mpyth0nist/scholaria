# Scholaria 🎓

![Python](https://img.shields.io/badge/Python-3.12-blue?style=flat-square&logo=python)
![Django](https://img.shields.io/badge/Django-REST_Framework-092E20?style=flat-square&logo=django)
![React](https://img.shields.io/badge/React-Redux-61DAFB?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-336791?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)

Scholaria is a modern, full-stack Learning Management System (LMS) built with a Robust and multi-tenant **Retrieval-Augmented Generation (RAG)** pipeline. It features an AI learning companion, **Edah**, that delivers context-aware, course-scoped tutoring based on the materials students are actively enrolled in.

---

## Architecture Overview

```mermaid
flowchart TD
    User([Student / Teacher]) -->|HTTP / SSE| UI[React + Redux Frontend]
    UI -->|API Request| Backend[Django REST Framework]

    subgraph Guardrails & Routing
        Backend --> L1{Layer 1: Deterministic Filter}
        L1 -->|Off-topic / Jailbreak| Reject1[Instant Refusal]
        L1 -->|Clean Query| L2{Layer 2: Topic Classifier}
        L2 -->|Out of Scope| Reject2[Course Refusal]
        L2 -->|On Topic| Rewrite[Query Rewriter]
    end

    subgraph Caching & Retrieval
        Rewrite --> Cache{Semantic Cache?}
        Cache -->|Hit: dist < 0.05| StreamCache[Stream Cached Answer]
        Cache -->|Miss| Search[pgvector HNSW Search]
        Search --> Scope[(Postgres + pgvector\nCourse-Scoped Filter)]
    end

    subgraph Generation
        Scope --> Context[Build Course Context]
        Context --> LLM[Groq LLaMA-3 Engine]
        LLM -->|Token Stream| UI
    end
```

---

## Core Features

### Role-Based Access Control (RBAC)
- **Teachers**: Manage courses, modules, lessons, quizzes, and assignments. AI interactions are restricted to their taught curriculum.
- **Students**: Enroll in courses, complete lessons, submit assignments, and take quizzes. AI tutoring is scoped strictly to their enrolled courses.
- **Admins**: Platform oversight and system administration.

### AI Learning Companion (RAG Pipeline)
- **Two-Tier Ingestion Architecture**:
  - *Cold-Start / Bulk Ingestion*: The `python manage.py ingest_all_data` command iterates over all `RAGSearchableMixin` models (`Lesson`, `Quiz`, `Question`, `Assignment`) to chunk and embed existing content into `DocumentChunk` table.
  - *Real-Time Incremental Sync*: Django `post_save` signals automatically dispatch background Celery tasks (`ingest_searchable_object_task`) to re-chunk and embed content whenever lessons, quizzes, or assignments are created or updated.
- **PostgreSQL Vector Retrieval**: Uses PostgreSQL with `pgvector` and HNSW indexing for scalable, low-latency cosine distance vector similarity search.
- **Database-Level Multi-Tenancy**: Vector retrieval strictly filters candidate chunks by the student's enrolled `course_id`s at the database level, preventing cross-course data leakage.
- **Dual-Mode Response Generation**:
  - *Grounded Mode*: Prioritizes retrieved course materials and cites specific lessons.
  - *Controlled Fallback*: When course materials do not fully cover a concept, explicitly disclaims that the topic is outside the syllabus and supplements with general academic knowledge within the enrolled course scope.
- **Multi-Layer Guardrails & Performance**:
  - *Layer 1 (Regex)*: Sub-millisecond deterministic keyword pre-filter to reject off-topic queries and prompt injections instantly without API costs.
  - *Layer 2 (LLM Classifier)*: Course-scoped binary classification that fails open during transient API degradations to maintain platform availability.
  - *Semantic Caching*: Caches query embeddings in `pgvector` (cosine distance threshold < 0.05) to eliminate LLM latency and token costs on repeated questions.

---

## Tech Stack

* **Backend**: Django 4.2, Django REST Framework, Gunicorn, Celery, Redis
* **Vector Database**: PostgreSQL 16 + `pgvector` (HNSW indexing)
* **Embedding Model**: `sentence-transformers` (`all-MiniLM-L6-v2`, 384 dimensions)
* **LLM Engine**: Groq API (LLaMA 3) with Server-Sent Events (SSE) streaming
* **Frontend**: React 18, Vite, Redux Toolkit, React Router v6
* **Package Management & Tooling**: `uv`, Docker, Docker Compose

---

## Local Setup & Installation

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- A [Groq API Key](https://console.groq.com/) for AI inference

### 1. Clone the repository
```bash
git clone https://github.com/mpyth0nist/scholaria.git
cd scholaria
```

### 2. Configure Environment Variables
Copy the example environment file and add your Groq API key:
```bash
cp .env.example .env
```
*(The default database credentials in `.env.example` work out of the box with Docker Compose. Add your `GROQ_API_KEY` in `.env`).*

### 3. Start Services with Docker Compose
Start all containers in detached mode:
```bash
docker compose up -d --build
```
*(To follow logs at any time, run: `docker compose logs -f`)*

### 4. Database Setup & Seeding (Initial Run)
Apply database migrations, seed the demo, and optionally create an administrator account:
```bash
# 1. Apply database migrations
docker compose exec backend uv run manage.py migrate

# 2. Seed the demo: teacher, 3 courses with 25 lessons and 4 quizzes, 21 students,
#    quiz attempts, lesson progress, and the RAG index for the AI tutor
docker compose exec backend uv run manage.py seed_demo

# 3. (Optional) Create an administrator account
docker compose exec backend uv run manage.py createsuperuser
```

`seed_demo` is safe to rerun: content is synced by name and the demo students' activity is regenerated from a fixed random seed, so the dashboard numbers stay the same. Useful options:
- `--reset` removes the demo students and demo courses first (including those created by older versions of the seeder)
- `--seed N` changes the generated scores and progress; `--anchor-date YYYY-MM-DD` pins timestamps to a date
- `--skip-index` skips building the RAG index (run `ingest_all_data` later)

It only runs when `DEBUG=True` unless you pass `--force`.

#### Demo Credentials (Created by `seed_demo`):
| Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Teacher** | `youssef_kaddioui` | `ScholariaDemo2026!` | Owns the 3 demo courses; the dashboard shows real engagement and recent submissions |
| **Student** | `demo_student` | `ScholariaDemo2026!` | Enrolled in all 3 courses with no activity yet, ready for taking quizzes and chatting with Edah |

Set `DEMO_PASSWORD` before seeding to use a different password. Passwords are only set on accounts the seeder creates, so an existing `youssef_kaddioui` account keeps its own password. The 20 roster students (e.g. `youssef.elamrani`) use the same password.


### 5. RAG Vector Ingestion (Cold Start vs. Runtime)

The RAG pipeline operates in two modes:

#### A. Initial Batch Ingestion (Cold Start)
If you have existing database records (from custom seeds, migrations, or data dumps) that have not yet been indexed into `pgvector`, run:
```bash
docker compose exec backend uv run manage.py ingest_all_data
```
> **When is `ingest_all_data` required?**
> - **Initial Setup**: Signals only react to *future* saves. Records that existed before (data dumps, or `seed_demo --skip-index`) must be indexed once via this batch command. `seed_demo` indexes its own content.
> - **Switching Embedding Models**: If you change `RAG_EMBEDDING_MODEL` in settings (e.g., changing from `all-MiniLM-L6-v2` to another model), old vectors are incompatible and the index must be rebuilt.
> - **Chunking Strategy Changes**: If you update `CHUNK_THRESHOLD`, `chunk_size`, or `overlap` in `utils/chunking.py`.
> - **Reconciliation**: If the Celery worker or Redis broker was temporarily down and some real-time updates were missed.

#### B. Real-Time Incremental Sync (Runtime)
In day-to-day use, you **do not** need to run `ingest_all_data`. Whenever a teacher creates or updates a lesson, quiz, or assignment via the platform, Django `post_save` signals automatically dispatch a background Celery task (`ingest_searchable_object_task`) to re-chunk and embed the content dynamically.

These tasks are processed by the `worker` service, which `docker compose up` starts alongside the backend and restarts automatically. To check that new content is being indexed:
```bash
docker compose logs -f worker   # each save logs a "Task rag.tasks.ingest_searchable_object_task ... succeeded" line
```
When running the backend locally (`manage.py runserver`) with `DEBUG=True`, these tasks run inline during the save, so new content is indexed without Redis or a worker. To use a worker locally instead, set `CELERY_TASK_ALWAYS_EAGER=False`, run Redis, and start `uv run celery -A scholaria worker -l info` in a separate terminal (see `.env.example`).

---

### 6. Access the Platform
* **Frontend**: [http://localhost](http://localhost)
* **Backend API**: [http://localhost:8000/api/](http://localhost:8000/api/)
* **Django Admin**: [http://localhost:8000/admin/](http://localhost:8000/admin/)
* **Silk Performance Profiler**: [http://localhost:8000/silk/](http://localhost:8000/silk/)

---

## 🧪 Testing

The test suite covers the RAG utility layer, document ingestion idempotency, LLM mocking, and role-based API scoping.

### Run tests inside the backend container:
```bash
docker compose exec backend uv run --dev pytest   # the image leaves out dev tools; --dev installs them on demand
```

### Or run tests natively on your host:
```bash
# Ensure PostgreSQL & Redis containers are running
docker compose up -d postgres redis

# Run test suite using uv
uv run pytest
```
