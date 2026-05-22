# app/models/resume.py
# SQLAlchemy ORM model for the "resumes" table.

from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.base import Base


class Resume(Base):
    """
    Represents an uploaded resume in the database.

    Columns:
        id           – Auto-incremented primary key
        name         – Candidate name extracted from resume (heuristic)
        email        – Candidate email extracted via regex
        file_path    – Relative path to the uploaded PDF file
        parsed_text  – Full plain-text content extracted from the PDF
        skills       – Comma-separated list of detected skills
        created_at   – Timestamp of when the record was created
    """
    __tablename__ = "resumes"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(255), nullable=True)
    email       = Column(String(255), nullable=True)
    file_path   = Column(String(512), nullable=False)
    parsed_text = Column(Text, nullable=True)
    skills      = Column(Text, nullable=True)          # Stored as comma-separated string
    created_at  = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # One resume can have many match results
    matches = relationship("Match", back_populates="resume", cascade="all, delete-orphan")
