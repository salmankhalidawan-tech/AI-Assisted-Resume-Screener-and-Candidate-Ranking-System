# app/api/jobs.py
# FastAPI router for all job-related endpoints.

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.job import JobCreate, JobResponse
from app.services.job_service import create_job, get_all_jobs

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post(
    "/",
    response_model=JobResponse,
    summary="Create a new job posting",
    status_code=201,
)
def post_job(
    job_data: JobCreate,
    db      : Session = Depends(get_db),
):
    """
    Create a new job posting.

    **Request body example:**
    ```json
    {
      "title": "Senior Python Developer",
      "description": "We need an experienced Python developer proficient in FastAPI and PostgreSQL.",
      "required_skills": "Python, FastAPI, PostgreSQL, Docker"
    }
    ```
    """
    return create_job(db, job_data)


@router.get(
    "/",
    response_model=List[JobResponse],
    summary="List all job postings",
)
def list_jobs(
    skip : int     = Query(0,   ge=0,  description="Number of records to skip"),
    limit: int     = Query(100, ge=1, le=500, description="Max records to return"),
    db   : Session = Depends(get_db),
):
    """
    Retrieve a paginated list of all job postings.
    """
    return get_all_jobs(db, skip=skip, limit=limit)
