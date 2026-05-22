# app/api/match.py
# FastAPI router for the ML matching endpoint.

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.match import MatchRequest, MatchResponse
from app.services.match_service import create_match

router = APIRouter(prefix="/match", tags=["Match"])


@router.post(
    "/",
    response_model=MatchResponse,
    summary="Match a resume against a job",
    status_code=201,
)
def match_resume_to_job(
    match_request: MatchRequest,
    db           : Session = Depends(get_db),
):
    """
    Compute the ML similarity score between a resume and a job description.

    **How it works:**
    1. Retrieves the resume text and the job description from the database.
    2. Converts both to TF-IDF vectors.
    3. Computes cosine similarity between the vectors.
    4. Scales the result to a **0–100** score and persists it.

    **Request body example:**
    ```json
    {
      "resume_id": 1,
      "job_id": 2
    }
    ```

    **Response includes:**
    - `score`: match percentage (0 = no match, 100 = perfect match)
    - `id`, `resume_id`, `job_id`, `created_at`

    Raises **404** if either the resume or job is not found.
    Raises **422** if either text is empty.
    """
    return create_match(db, match_request)
