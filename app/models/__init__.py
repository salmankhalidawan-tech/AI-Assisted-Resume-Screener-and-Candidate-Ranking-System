# app/models/__init__.py
# Import all models here so that SQLAlchemy's Base.metadata knows about every table.
# This is required for create_all() to work correctly.

from app.models.resume import Resume   # noqa: F401
from app.models.job    import Job      # noqa: F401
from app.models.match  import Match    # noqa: F401
