# ml/train.py
# Standalone script to demonstrate and validate the TF-IDF model.
#
# This script:
#   1. Trains a TF-IDF vectorizer on a small synthetic dataset
#   2. Saves the trained vectorizer to ml/model.pkl
#   3. Prints example similarity scores so you can verify the logic
#
# Run with:  python ml/train.py
# (No Docker needed — just: pip install scikit-learn joblib)

import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ── Sample training corpus ────────────────────────────────────────────────────
# In a real system you would use actual resume/job-description pairs.
# This corpus just establishes a vocabulary for the vectorizer.
SAMPLE_CORPUS = [
    "Python developer with FastAPI Django Flask REST API experience",
    "Machine learning engineer scikit-learn TensorFlow PyTorch NLP",
    "Data analyst SQL PostgreSQL Excel Power BI Tableau reporting",
    "Frontend developer React Angular Vue HTML CSS JavaScript TypeScript",
    "DevOps engineer Docker Kubernetes AWS GCP Terraform CI/CD Jenkins",
    "Backend Java Spring Boot microservices REST gRPC Kafka",
    "Full stack developer Node Express MongoDB React Python Django",
    "Data scientist pandas numpy matplotlib seaborn machine learning",
    "Cloud architect AWS Azure GCP serverless Lambda containers",
    "Security engineer penetration testing OWASP firewall VPN SIEM",
]

# ── Train the vectorizer ──────────────────────────────────────────────────────
print("[ml/train.py] Training TF-IDF vectorizer on sample corpus...")

vectorizer = TfidfVectorizer(
    sublinear_tf=True,
    stop_words="english",
    ngram_range=(1, 2),
)
vectorizer.fit(SAMPLE_CORPUS)

# ── Save the trained vectorizer ───────────────────────────────────────────────
os.makedirs("ml", exist_ok=True)
model_path = "ml/model.pkl"
joblib.dump(vectorizer, model_path)
print(f"[ml/train.py] Vectorizer saved to {model_path}")

# ── Quick sanity-check: compute similarity between two example texts ──────────
print("\n[ml/train.py] Running example similarity checks...")

examples = [
    (
        "Experienced Python developer skilled in FastAPI PostgreSQL Docker AWS",
        "We are hiring a Python backend engineer with FastAPI and PostgreSQL experience",
    ),
    (
        "Frontend developer with React and CSS skills",
        "We are hiring a Python backend engineer with FastAPI and PostgreSQL experience",
    ),
    (
        "Machine learning engineer TensorFlow PyTorch scikit-learn NLP",
        "Seeking a data scientist with machine learning and Python skills",
    ),
]

for i, (resume, job) in enumerate(examples, 1):
    matrix = vectorizer.transform([resume, job])
    score  = cosine_similarity(matrix[0:1], matrix[1:2])[0][0] * 100
    print(f"  Example {i}: score = {score:.2f}%")
    print(f"    Resume : {resume[:60]}...")
    print(f"    Job    : {job[:60]}...")

print("\n[ml/train.py] Done.")
