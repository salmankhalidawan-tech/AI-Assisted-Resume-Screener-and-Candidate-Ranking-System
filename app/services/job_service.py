# app/services/job_service.py
# Business logic layer for job posting operations.

from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.models.job import Job
from app.schemas.job import JobCreate


def create_job(db: Session, job_data: JobCreate) -> Job:
    """
    Creates a new job posting in the database.

    Args:
        db      : SQLAlchemy database session.
        job_data: Validated Pydantic schema from the API request body.

    Returns:
        The newly created Job ORM instance.
    """
    db_job = Job(
        title           = job_data.title,
        description     = job_data.description,
        required_skills = job_data.required_skills,
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job


def get_job_by_id(db: Session, job_id: int) -> Job:
    """
    Fetches a single job by its primary key.

    Raises:
        HTTPException 404 if not found.
    """
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail=f"Job with id={job_id} not found.")
    return job


def get_all_jobs(db: Session, skip: int = 0, limit: int = 100) -> List[Job]:
    """
    Returns a paginated list of all job postings.
    """
    return db.query(Job).offset(skip).limit(limit).all()
