# Dockerfile
# Multi-stage aware single-stage Dockerfile for the FastAPI application.
# Uses Python 3.11 slim for a small image footprint.

# ── Base image ────────────────────────────────────────────────────────────────
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# ── System dependencies ───────────────────────────────────────────────────────
# libpq-dev  : needed to compile psycopg2 (skipped here because we use binary)
# gcc        : needed for some packages on slim images
RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# ── Set working directory ─────────────────────────────────────────────────────
WORKDIR /app

# ── Install Python dependencies ───────────────────────────────────────────────
# Copy requirements first (Docker layer caching — only re-install when changed)
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# ── Copy application source code ──────────────────────────────────────────────
COPY . .

# ── Create upload directory ───────────────────────────────────────────────────
RUN mkdir -p /app/uploads

# ── Expose the application port ───────────────────────────────────────────────
EXPOSE 8000

# ── Start the application ─────────────────────────────────────────────────────
# --host 0.0.0.0  : listen on all interfaces inside the container
# --reload        : remove this flag in production
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
