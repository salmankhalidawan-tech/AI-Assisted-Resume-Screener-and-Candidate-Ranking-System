# app/models/job.py
# SQLAlchemy ORM model for the "jobs" table.

from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.base import Base


class Job(Base):
    """
    Represents a job description posted in the system.

    Columns:
        id              – Auto-incremented primary key
        title           – Job title (e.g. "Senior Python Developer")
        description     – Full job description text
        required_skills – Comma-separated list of required skills
        created_at      – Timestamp of when the record was created
    """
    __tablename__ = "jobs"

    id              = Column(Integer, primary_key=True, index=True)
    title           = Column(String(255), nullable=False)
    description     = Column(Text, nullable=False)
    required_skills = Column(Text, nullable=True)      # Stored as comma-separated string
    created_at      = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # One job can have many match results
    matches = relationship("Match", back_populates="job", cascade="all, delete-orphan")
