# app/core/config.py
# Central configuration file using Pydantic's BaseSettings.
# Values are loaded from environment variables or a .env file.

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql://postgres:password@db:5432/resume_screener"

    # ── File Upload ───────────────────────────────────────────────────────────
    UPLOAD_DIR: str = "uploads"          # Directory where PDFs are stored
    MAX_UPLOAD_SIZE_MB: int = 10         # Maximum allowed PDF size in megabytes

    # ── App Meta ──────────────────────────────────────────────────────────────
    APP_NAME: str = "Resume Screening System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ── ML ────────────────────────────────────────────────────────────────────
    MODEL_PATH: str = "ml/model.pkl"     # Path to the persisted TF-IDF vectorizer

    class Config:
        env_file = ".env"                # Load overrides from a local .env file
        case_sensitive = True


# Single global settings instance — import this everywhere
settings = Settings()
