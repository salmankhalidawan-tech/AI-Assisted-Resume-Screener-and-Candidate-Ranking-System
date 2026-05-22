# app/schemas/job.py
# Pydantic schemas for Job — used for request validation and response serialization.

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class JobCreate(BaseModel):
    """Schema used when creating a new job posting via POST /jobs/."""
    title          : str
    description    : str
    required_skills: Optional[str] = None   # e.g. "Python, FastAPI, PostgreSQL"


class JobResponse(BaseModel):
    """Schema returned to the API consumer after creating or fetching a job."""
    id             : int
    title          : str
    description    : str
    required_skills: Optional[str] = None
    created_at     : datetime

    class Config:
        from_attributes = True   # Enables ORM mode
