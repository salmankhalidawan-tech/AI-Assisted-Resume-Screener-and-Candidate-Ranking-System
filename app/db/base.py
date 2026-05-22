# app/db/base.py
# This file sets up the SQLAlchemy declarative base that all ORM models will inherit from.

from sqlalchemy.orm import declarative_base

# Base class for all SQLAlchemy models
Base = declarative_base()
