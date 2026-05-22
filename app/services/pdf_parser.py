# app/services/pdf_parser.py
# Handles PDF file reading and text + field extraction.
# Uses pdfplumber for robust PDF text extraction.

import re
import pdfplumber
from pathlib import Path
from typing import Optional

# ── Skill keyword list ────────────────────────────────────────────────────────
# Extend this list with domain-specific skills as needed.
KNOWN_SKILLS = [
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
    "ruby", "php", "swift", "kotlin", "scala", "r", "matlab",
    "fastapi", "django", "flask", "spring", "react", "angular", "vue",
    "node", "express", "nextjs", "graphql", "rest", "grpc",
    "postgresql", "mysql", "sqlite", "mongodb", "redis", "elasticsearch",
    "docker", "kubernetes", "terraform", "ansible", "jenkins", "git",
    "aws", "azure", "gcp", "linux", "bash",
    "machine learning", "deep learning", "nlp", "computer vision",
    "scikit-learn", "tensorflow", "pytorch", "pandas", "numpy", "matplotlib",
    "sql", "html", "css", "figma", "jira", "agile", "scrum",
]


def extract_text_from_pdf(file_path: str) -> str:
    """
    Opens a PDF and extracts all text across every page.

    Args:
        file_path: Absolute or relative path to the PDF file.

    Returns:
        A single string containing all extracted text, pages joined by newlines.
        Returns an empty string if extraction fails.
    """
    text_pages = []
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_pages.append(page_text)
    except Exception as exc:
        # Log but don't crash — return whatever we got
        print(f"[pdf_parser] Warning: could not fully parse {file_path}: {exc}")

    return "\n".join(text_pages)


def extract_email(text: str) -> Optional[str]:
    """
    Finds the first email address in the given text using a regex pattern.

    Args:
        text: Raw text extracted from the resume PDF.

    Returns:
        The first email found, or None.
    """
    pattern = r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
    match = re.search(pattern, text)
    return match.group(0) if match else None


def extract_name(text: str) -> Optional[str]:
    """
    Heuristic name extraction: assumes the candidate's name appears on the
    first non-empty line of the resume (common for standard resume formats).

    Args:
        text: Raw text extracted from the resume PDF.

    Returns:
        The first non-empty line (stripped), or None.
    """
    for line in text.splitlines():
        stripped = line.strip()
        # Skip lines that look like section headers or are too long
        if stripped and len(stripped) < 60 and not any(
            keyword in stripped.lower()
            for keyword in ["resume", "cv", "curriculum", "address", "phone", "email", "@"]
        ):
            return stripped
    return None


def extract_skills(text: str) -> str:
    """
    Scans the resume text for known skill keywords (case-insensitive).

    Args:
        text: Raw text extracted from the resume PDF.

    Returns:
        A comma-separated string of matched skills (e.g. "python, docker, aws").
        Returns an empty string if no known skills are found.
    """
    text_lower = text.lower()
    found = [skill for skill in KNOWN_SKILLS if skill in text_lower]
    # Deduplicate while preserving order
    seen = set()
    unique_skills = []
    for s in found:
        if s not in seen:
            seen.add(s)
            unique_skills.append(s)
    return ", ".join(unique_skills)


def parse_resume(file_path: str) -> dict:
    """
    Full resume parsing pipeline: extract text → extract fields.

    Args:
        file_path: Path to the uploaded PDF.

    Returns:
        A dictionary with keys: parsed_text, name, email, skills.
    """
    parsed_text = extract_text_from_pdf(file_path)
    return {
        "parsed_text": parsed_text,
        "name"       : extract_name(parsed_text),
        "email"      : extract_email(parsed_text),
        "skills"     : extract_skills(parsed_text),
    }
