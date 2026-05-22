# app/services/match_service.py
# Orchestrates the ML matching pipeline and persists results to the database.

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.match import Match
from app.schemas.match import MatchRequest
from app.services.resume_service import get_resume_by_id
from app.services.job_service import get_job_by_id
from app.services.ml_engine import compute_similarity


def create_match(db: Session, match_request: MatchRequest) -> Match:
    """
    Full matching pipeline:
      1. Fetch the resume and job from the database (raises 404 if missing)
      2. Compute TF-IDF cosine similarity between their texts
      3. Persist the match score to the database

    Args:
        db            : SQLAlchemy database session.
        match_request : Pydantic model containing resume_id and job_id.

    Returns:
        The newly created Match ORM instance with the computed score.
    """
    # ── 1. Retrieve resume and job (will raise 404 if not found) ─────────────
    resume = get_resume_by_id(db, match_request.resume_id)
    job    = get_job_by_id(db, match_request.job_id)

    # ── 2. Build the text inputs for the ML engine ───────────────────────────
    # We combine the resume's parsed text with its skills for richer signal.
    resume_text = (resume.parsed_text or "") + " " + (resume.skills or "")

    # We combine the job's description with its required skills.
    job_text = (job.description or "") + " " + (job.required_skills or "")

    if not resume_text.strip() or not job_text.strip():
        raise HTTPException(
            status_code=422,
            detail="Cannot compute match: resume or job text is empty."
        )

    # ── 3. Compute similarity score (0–100) ──────────────────────────────────
    score = compute_similarity(resume_text, job_text)

    # ── 4. Persist result ────────────────────────────────────────────────────
    db_match = Match(
        resume_id = match_request.resume_id,
        job_id    = match_request.job_id,
        score     = score,
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)

    return db_match
