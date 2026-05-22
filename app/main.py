# app/main.py
# Application entry point.
# Creates the FastAPI app, registers routers, and initialises the database.

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.session import engine
from app.db.base import Base

# Import all models so that Base.metadata includes every table before create_all()
import app.models  # noqa: F401

# Import API routers
from app.api.resumes import router as resumes_router
from app.api.jobs    import router as jobs_router
from app.api.match   import router as match_router

# ── Create database tables ────────────────────────────────────────────────────
# This is idempotent — it only creates tables that don't already exist.
# In production you would replace this with Alembic migrations.
Base.metadata.create_all(bind=engine)

# ── Ensure upload directory exists ────────────────────────────────────────────
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# ── Initialise FastAPI app ────────────────────────────────────────────────────
app = FastAPI(
    title       = settings.APP_NAME,
    version     = settings.APP_VERSION,
    description = (
        "A production-ready Resume Screening System powered by FastAPI, "
        "PostgreSQL, and TF-IDF based Machine Learning.\n\n"
        "**Key features:**\n"
        "- Upload PDF resumes and auto-extract name, email, and skills\n"
        "- Manage job postings with required skills\n"
        "- ML-powered resume ↔ job matching using cosine similarity (0–100 score)\n"
    ),
    docs_url    = "/docs",
    redoc_url   = "/redoc",
)

# ── CORS Middleware ───────────────────────────────────────────────────────────
# Allows any frontend (e.g. React dev server) to call this API.
# Restrict 'allow_origins' in production!
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["*"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ── Register routers ──────────────────────────────────────────────────────────
app.include_router(resumes_router)
app.include_router(jobs_router)
app.include_router(match_router)


# ── Health-check endpoint ─────────────────────────────────────────────────────
@app.get("/", tags=["Health"], summary="Health check")
def root():
    """Returns a simple status message to verify the API is running."""
    return {
        "status" : "ok",
        "app"    : settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs"   : "/docs",
    }
