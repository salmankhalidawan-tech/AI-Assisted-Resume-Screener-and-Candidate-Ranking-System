# app/models/match.py
# SQLAlchemy ORM model for the "matches" table.

from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.base import Base


class Match(Base):
    """
    Stores the ML-computed similarity score between a resume and a job.

    Columns:
        id         – Auto-incremented primary key
        resume_id  – Foreign key referencing resumes.id
        job_id     – Foreign key referencing jobs.id
        score      – Cosine similarity score scaled to 0–100
        created_at – Timestamp of when the match was computed
    """
    __tablename__ = "matches"

    id         = Column(Integer, primary_key=True, index=True)
    resume_id  = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    job_id     = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    score      = Column(Float, nullable=False)          # 0.0 – 100.0
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship back-references so we can navigate from a match to its resume/job
    resume = relationship("Resume", back_populates="matches")
    job    = relationship("Job", back_populates="matches")
