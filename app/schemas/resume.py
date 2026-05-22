# app/schemas/resume.py
# Pydantic schemas for Resume — used for request validation and response serialization.

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class ResumeBase(BaseModel):
    """Shared fields used in creation and response."""
    name  : Optional[str] = None
    email : Optional[str] = None
    skills: Optional[str] = None


class ResumeCreate(ResumeBase):
    """
    Schema used internally after a PDF is uploaded and parsed.
    The API consumer only uploads a file; these fields are populated by the service.
    """
    file_path  : str
    parsed_text: Optional[str] = None


class ResumeResponse(ResumeBase):
    """
    Schema returned to the API consumer.
    Includes database-generated fields like id and created_at.
    """
    id         : int
    file_path  : str
    parsed_text: Optional[str] = None
    created_at : datetime

    class Config:
        from_attributes = True   # Enables ORM mode (reads from SQLAlchemy model attributes)
