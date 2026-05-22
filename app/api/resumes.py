# app/api/resumes.py
# FastAPI router for all resume-related endpoints.
#
# FIX APPLIED:
#   - GET /resumes/  → list_resumes()  registered FIRST (always matched before path param)
#   - GET /resumes/{resume_id} → get_resume()  registered SECOND
#   - No id=0 filtering anywhere
#   - No query-param id tricks
#   - list route uses get_all_resumes(db) → db.query(Resume).all()

from fastapi import APIRouter, Depends, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.resume import ResumeResponse
from app.services.resume_service import (
    create_resume,
    get_resume_by_id,
    get_all_resumes,
)

router = APIRouter(prefix="/resumes", tags=["Resumes"])


# ── POST /resumes/upload ───────────────────────────────────────────────────────
@router.post(
    "/upload",
    response_model=ResumeResponse,
    summary="Upload a resume PDF",
    status_code=201,
)
def upload_resume(
    file: UploadFile = File(..., description="PDF resume file to upload"),
    db: Session = Depends(get_db),
):
    """Upload a PDF resume, extract text, parse fields, and store in the database."""
    return create_resume(db, file)


# ── GET /resumes/ ─────────────────────────────────────────────────────────────
# MUST be registered BEFORE /{resume_id} to avoid FastAPI routing it to path param.
@router.get(
    "/",
    response_model=List[ResumeResponse],
    summary="List all resumes",
)
def list_resumes(
    skip: int = Query(0, ge=0, description="Records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Max records to return"),
    db: Session = Depends(get_db),
):
    """
    Returns ALL resumes in the database.
    Uses db.query(Resume).offset(skip).limit(limit).all() — no id filtering.
    """
    return get_all_resumes(db, skip=skip, limit=limit)


# ── GET /resumes/{resume_id} ───────────────────────────────────────────────────
# PostgreSQL auto-increment starts at 1, so resume_id=0 will always 404.
@router.get(
    "/{resume_id}",
    response_model=ResumeResponse,
    summary="Get a single resume by ID",
)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
):
    """
    Fetch a single resume by its database ID (integer ≥ 1).
    Returns 404 if the ID does not exist.
    """
    return get_resume_by_id(db, resume_id)
