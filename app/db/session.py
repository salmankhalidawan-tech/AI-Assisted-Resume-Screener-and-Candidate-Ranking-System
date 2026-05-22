# app/db/session.py
# This file creates the SQLAlchemy engine and session factory.
# It also provides a dependency function for FastAPI route injection.

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create the database engine using the connection string from settings
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True  # Ensures stale connections are recycled automatically
)

# SessionLocal is a factory for creating database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """
    FastAPI dependency that yields a database session.
    Ensures the session is properly closed after each request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
