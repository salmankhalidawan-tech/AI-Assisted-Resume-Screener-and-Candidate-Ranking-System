# app/services/ml_engine.py
# Core ML logic: TF-IDF vectorization + cosine similarity scoring.
#
# How it works:
#   1. Both texts (resume + job description) are converted into TF-IDF vectors.
#      TF-IDF (Term Frequency–Inverse Document Frequency) weights words by how
#      important they are relative to the entire corpus.
#   2. Cosine similarity is computed between the two vectors.
#      It measures the angle between them in high-dimensional space:
#        - Score = 1.0  → texts are identical in content
#        - Score = 0.0  → texts share no terms
#   3. The result is scaled to a 0–100 range for readability.

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def compute_similarity(resume_text: str, job_text: str) -> float:
    """
    Computes TF-IDF cosine similarity between a resume and a job description.

    Args:
        resume_text : Full extracted text from the resume (+ skills).
        job_text    : Full job description text (+ required skills).

    Returns:
        A float between 0.0 and 100.0 representing the match percentage.
        Higher is a better match.

    Example:
        >>> score = compute_similarity("Python developer Flask REST", "Python Flask developer needed")
        >>> print(f"{score:.2f}%")   # e.g. 78.43%
    """
    # ── Step 1: Initialise the TF-IDF vectorizer ─────────────────────────────
    # sublinear_tf=True dampens the effect of very frequent terms.
    # stop_words='english' removes common filler words (the, is, at…).
    vectorizer = TfidfVectorizer(
        sublinear_tf=True,
        stop_words="english",
        ngram_range=(1, 2),    # Captures both single words AND two-word phrases
    )

    # ── Step 2: Fit & transform both texts together ───────────────────────────
    # fit_transform builds the vocabulary from BOTH documents simultaneously
    # so the resulting vectors share the same feature space.
    tfidf_matrix = vectorizer.fit_transform([resume_text, job_text])

    # ── Step 3: Compute cosine similarity ────────────────────────────────────
    # cosine_similarity returns a 2×2 matrix; [0][1] is the cross-document score.
    similarity_score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

    # ── Step 4: Scale to 0–100 and round to 2 decimal places ─────────────────
    return round(float(similarity_score) * 100, 2)
