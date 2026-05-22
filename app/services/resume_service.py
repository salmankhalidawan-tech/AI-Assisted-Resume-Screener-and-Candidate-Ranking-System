# app/services/resume_service.py
# Business logic layer for resume operations.

import os
import shutil
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.models.resume import Resume
from app.services.pdf_parser import parse_resume
from app.core.config import settings


def save_upload_file(upload_file: UploadFile, destination: str) -> None:
    """Streams an uploaded file to disk."""
    with open(destination, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)


def create_resume(db: Session, upload_file: UploadFile) -> Resume:
    """
    Full resume ingestion pipeline:
      1. Validate file is a PDF
      2. Save PDF to disk under UPLOAD_DIR
      3. Parse text, name, email, skills
      4. Persist record → returns the created Resume with auto-assigned id (≥ 1)
    """
    if not upload_file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, upload_file.filename)
    save_upload_file(upload_file, file_path)

    parsed = parse_resume(file_path)

    db_resume = Resume(
        name        = parsed["name"],
        email       = parsed["email"],
        skills      = parsed["skills"],
        file_path   = file_path,
        parsed_text = parsed["parsed_text"],
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    return db_resume


def get_resume_by_id(db: Session, resume_id: int) -> Resume:
    """
    Fetch a single resume by primary key.
    PostgreSQL IDs start at 1 — passing 0 will always return 404 (correct behaviour).
    No 'if id:' guard needed; SQLAlchemy filter handles it exactly.
    """
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if resume is None:                          # Use 'is None' not truthiness check
        raise HTTPException(
            status_code=404,
            detail=f"Resume with id={resume_id} not found."
        )
    return resume


def get_all_resumes(db: Session, skip: int = 0, limit: int = 100) -> List[Resume]:
    """
    Returns ALL resumes — no id filtering whatsoever.
    Equivalent to: SELECT * FROM resumes OFFSET skip LIMIT limit;
    """
    return db.query(Resume).offset(skip).limit(limit).all()
