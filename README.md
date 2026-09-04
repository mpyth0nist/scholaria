# Scholaria 🎓

![Python](https://img.shields.io/badge/Python-3.12-blue?style=flat-square&logo=python)
![Django](https://img.shields.io/badge/Django-REST_Framework-092E20?style=flat-square&logo=django)
![React](https://img.shields.io/badge/React-Redux-61DAFB?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-336791?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)

Scholaria is a modern, full-stack Learning Management System (LMS) built with a custom **Retrieval-Augmented Generation (RAG)** pipeline. It goes beyond standard course management by providing an AI learning companion that answers student questions based *strictly* on the course materials they are enrolled in.

## 🚀 Core Features

### Role-Based Access Control (RBAC)
- **Teachers**: Can create and manage courses, modules, lessons, quizzes, and assignments. They have isolated AI access scoped only to the materials they teach.
- **Students**: Can enroll in courses, track lesson progress, submit assignments, and take quizzes. Their AI assistant is context-aware and scoped strictly to their enrolled courses.
- **Admins**: Platform oversight and user management.

### AI Learning Companion (RAG Pipeline)
- **Automated Ingestion**: When teachers create content (Lessons, Quizzes, Assignments), Django signals automatically trigger text chunking and vector embedding.
- **Semantic Search**: Uses PostgreSQL with the `pgvector` extension and HNSW indexes for fast, scalable nearest-neighbor vector search.
- **Context-Aware Responses**: Connects to the Groq API (LLaMA 3) to generate answers based *only* on the retrieved semantic context, preventing hallucinations.
- **Role-Scoped Context**: The RAG search strictly filters vector results by the user's enrolled `course_id`s at the database level.

## 🏗️ Architecture & Tech Stack

**Backend (API Layer)**
- **Framework**: Django & Django REST Framework
- **Vector DB**: PostgreSQL + `pgvector`
- **Embeddings**: `sentence-transformers` (all-MiniLM-L6-v2)
- **LLM Provider**: Groq API

**Frontend (Client Layer)**
- **Framework**: React.js (Vite)
- **State Management**: Redux Toolkit
- **Routing**: React Router v6 with Role-Protected Routes

**Infrastructure**
- Fully Dockerized (Backend, Frontend, Postgres Database)

---

## 🛠️ Local Setup & Installation

### Prerequisites
- Docker and Docker Compose
- Node.js (if running frontend locally outside Docker)
- Python 3.12+ (if running backend locally outside Docker)
- A [Groq API Key](https://console.groq.com/) for the AI features.

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/scholaria.git
cd scholaria
```

### 2. Environment Variables
Create a `.env` file in the root directory based on `.env.example`:
```env
# Database Settings
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=postgres
DB_PORT=5432
DB_NAME=scholaria

# AI Settings
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Run with Docker Compose (Recommended)
This will spin up the Postgres database (with pgvector), the Django backend, and the React frontend.
```bash
docker-compose up --build
```
*(Note: Ensure your `docker-compose.yml` uses an image with pgvector, e.g., `pgvector/pgvector:pg16`)*

### 4. Run Migrations & Setup
In a new terminal, run the database migrations and create a superuser:
```bash
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

The application will be available at:
- Frontend: `http://localhost:80`
- Backend API: `http://localhost:8000/api/`

---

## 🧪 Testing

The backend includes a comprehensive pytest suite covering the RAG utility layer, ingestion idempotency, LLM mocking, and role-based API scoping.

```bash
docker-compose exec backend pytest
```
