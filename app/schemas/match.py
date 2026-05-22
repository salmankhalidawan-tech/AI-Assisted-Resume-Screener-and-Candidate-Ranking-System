# app/schemas/match.py
# Pydantic schemas for Match — request body and response shape.

from pydantic import BaseModel
from datetime import datetime


class MatchRequest(BaseModel):
    """
    Request body for POST /match/
    The caller sends a resume_id and a job_id;
    the system computes and returns the similarity score.
    """
    resume_id: int
    job_id   : int


class MatchResponse(BaseModel):
    """Response returned after computing or retrieving a match."""
    id        : int
    resume_id : int
    job_id    : int
    score     : float          # 0.0 – 100.0 cosine-similarity score
    created_at: datetime

    class Config:
        from_attributes = True  # Enables ORM mode
