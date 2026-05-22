# Resume Screening System

A **production-ready Resume Screening API** built with **FastAPI**, **PostgreSQL**, and a **TF-IDF Machine Learning model** for intelligent resume–job matching.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Tech Stack](#tech-stack)
3. [Setup & Run with Docker](#setup--run-with-docker)
4. [Setup without Docker (Local Dev)](#setup-without-docker-local-dev)
5. [API Endpoints](#api-endpoints)
6. [Example Requests](#example-requests)
7. [ML Logic Explained](#ml-logic-explained)
8. [Database Schema](#database-schema)

---

## Project Structure

```
Resume Screener/
│
├── app/
│   ├── __init__.py
│   ├── main.py                   # FastAPI app entry point
│   │
│   ├── api/                      # Route handlers (thin layer)
│   │   ├── __init__.py
│   │   ├── resumes.py            # POST /resumes/upload, GET /resumes/
│   │   ├── jobs.py               # POST /jobs/, GET /jobs/
│   │   └── match.py              # POST /match/
│   │
│   ├── models/                   # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── resume.py
│   │   ├── job.py
│   │   └── match.py
│   │
│   ├── schemas/                  # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── resume.py
│   │   ├── job.py
│   │   └── match.py
│   │
│   ├── services/                 # Business logic layer
│   │   ├── __init__.py
│   │   ├── pdf_parser.py         # PDF text extraction + field parsing
│   │   ├── resume_service.py     # Resume CRUD logic
│   │   ├── job_service.py        # Job CRUD logic
│   │   ├── match_service.py      # Orchestrates ML matching
│   │   └── ml_engine.py          # TF-IDF + cosine similarity core
│   │
│   ├── db/                       # Database setup
│   │   ├── __init__.py
│   │   ├── base.py               # SQLAlchemy declarative base
│   │   └── session.py            # Engine, SessionLocal, get_db()
│   │
│   └── core/                     # App configuration
│       ├── __init__.py
│       └── config.py             # Pydantic settings (reads .env)
│
├── ml/
│   ├── train.py                  # Standalone training/validation script
│   └── model.pkl                 # (Generated) TF-IDF vectorizer artifact
│
├── uploads/                      # Uploaded PDF files stored here
│
├── .env                          # Local environment variables
├── .gitignore
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

---

## Tech Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| API Framework | FastAPI 0.111                       |
| ASGI Server   | Uvicorn                             |
| Database      | PostgreSQL 15                       |
| ORM           | SQLAlchemy 2.0                      |
| Validation    | Pydantic v2                         |
| PDF Parsing   | pdfplumber                          |
| ML            | scikit-learn (TF-IDF + cosine sim.) |
| Containers    | Docker + Docker Compose             |

---

## Setup & Run with Docker

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Steps

```bash
# 1. Clone or navigate to the project directory
cd "Resume Screener"

# 2. Build and start both services (FastAPI + PostgreSQL)
docker-compose up --build

# 3. The API is now live at:
#    http://localhost:8000
#    http://localhost:8000/docs  ← Interactive Swagger UI
#    http://localhost:8000/redoc ← ReDoc documentation
```

### Stopping the services

```bash
docker-compose down          # Stop containers
docker-compose down -v       # Stop + delete database volume (fresh start)
```

---

## Setup without Docker (Local Dev)

### Prerequisites

- Python 3.10+
- PostgreSQL running locally

### Steps

```bash
# 1. Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create the database in PostgreSQL
#    Using psql or pgAdmin:
#    CREATE DATABASE resume_screener;

# 4. Update .env with your local DB credentials
#    DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/resume_screener

# 5. (Optional) Pre-train and validate the ML model
python ml/train.py

# 6. Start the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## API Endpoints

| Method | Endpoint            | Description                          |
|--------|---------------------|--------------------------------------|
| GET    | `/`                 | Health check                         |
| POST   | `/resumes/upload`   | Upload a PDF resume                  |
| GET    | `/resumes/`         | List all resumes (paginated)         |
| GET    | `/resumes/{id}`     | Get a single resume by ID            |
| POST   | `/jobs/`            | Create a new job posting             |
| GET    | `/jobs/`            | List all job postings (paginated)    |
| POST   | `/match/`           | Compute resume ↔ job similarity score |

---

## Example Requests

### Upload a Resume

```bash
curl -X POST "http://localhost:8000/resumes/upload" \
  -F "file=@/path/to/resume.pdf"
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "skills": "python, fastapi, postgresql, docker",
  "file_path": "uploads/resume.pdf",
  "parsed_text": "John Doe\njohn@example.com\n...",
  "created_at": "2025-01-15T10:30:00"
}
```

---

### Create a Job Posting

```bash
curl -X POST "http://localhost:8000/jobs/" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Python Developer",
    "description": "We need an experienced Python developer skilled in FastAPI, PostgreSQL, and Docker. Experience with REST APIs and cloud deployment is a plus.",
    "required_skills": "Python, FastAPI, PostgreSQL, Docker, REST API"
  }'
```

**Response:**
```json
{
  "id": 1,
  "title": "Senior Python Developer",
  "description": "We need an experienced Python developer...",
  "required_skills": "Python, FastAPI, PostgreSQL, Docker, REST API",
  "created_at": "2025-01-15T10:31:00"
}
```

---

### Match a Resume to a Job

```bash
curl -X POST "http://localhost:8000/match/" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_id": 1,
    "job_id": 1
  }'
```

**Response:**
```json
{
  "id": 1,
  "resume_id": 1,
  "job_id": 1,
  "score": 78.43,
  "created_at": "2025-01-15T10:32:00"
}
```

> **Score interpretation:**
> - `0–30`  → Poor match
> - `30–60` → Moderate match
> - `60–80` → Good match
> - `80–100` → Excellent match

---

### List All Resumes

```bash
curl "http://localhost:8000/resumes/?skip=0&limit=10"
```

### Get Resume by ID

```bash
curl "http://localhost:8000/resumes/1"
```

### List All Jobs

```bash
curl "http://localhost:8000/jobs/"
```

---

## ML Logic Explained

The matching system uses **TF-IDF vectorization** combined with **cosine similarity**. Here's how it works step by step:

### Step 1 — Text Preparation

When a resume is uploaded:
- The PDF is parsed using **pdfplumber**
- Full text is extracted across all pages
- Skills, name, and email are extracted using heuristics and regex
- The combined text (parsed text + skills) is stored in the database

When a job is created:
- The title, description, and required skills are stored

### Step 2 — TF-IDF Vectorization

**TF-IDF** stands for **Term Frequency–Inverse Document Frequency**:

- **TF (Term Frequency)**: How often a word appears in the document.
  - A resume mentioning "Python" 5 times gets a higher TF score for Python.
- **IDF (Inverse Document Frequency)**: How rare the word is across all documents.
  - Common words like "the", "is" get low IDF (filtered out via `stop_words="english"`).
  - Domain-specific words like "FastAPI" get high IDF — they're more meaningful.

The result is a **sparse numeric vector** representing the document's content.

### Step 3 — Cosine Similarity

Given two vectors **A** (resume) and **B** (job description):

```
cosine_similarity = (A · B) / (||A|| × ||B||)
```

- Returns a value between **0.0** (no similarity) and **1.0** (identical content).
- This is then **multiplied by 100** to produce a percentage score.

### Why Cosine Similarity?

Unlike Euclidean distance, cosine similarity is **length-invariant** — a short resume and a long one can still score highly if they share the same key terms, which is exactly the behaviour we want.

### Configuration used

```python
TfidfVectorizer(
    sublinear_tf=True,   # Dampens very frequent terms (log scaling)
    stop_words="english", # Removes filler words
    ngram_range=(1, 2),  # Captures both single words AND bi-grams like "machine learning"
)
```

---

## Database Schema

```sql
-- Uploaded resumes
CREATE TABLE resumes (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255),
    email       VARCHAR(255),
    file_path   VARCHAR(512) NOT NULL,
    parsed_text TEXT,
    skills      TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Job postings
CREATE TABLE jobs (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL,
    required_skills TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ML match results
CREATE TABLE matches (
    id         SERIAL PRIMARY KEY,
    resume_id  INTEGER REFERENCES resumes(id) ON DELETE CASCADE,
    job_id     INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    score      FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Interactive Docs

Once running, visit **http://localhost:8000/docs** for the full Swagger UI where you can test every endpoint directly in the browser — including file uploads.

---

*Built with FastAPI · PostgreSQL · scikit-learn*
