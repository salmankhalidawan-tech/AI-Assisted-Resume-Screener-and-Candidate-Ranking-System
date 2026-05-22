// src/pages/Dashboard.jsx
// Overview page — shows live counts of resumes, jobs, and matches.

import { useState, useEffect } from 'react'
import api from '../api/api'

export default function Dashboard() {
  const [counts, setCounts] = useState({ resumes: 0, jobs: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch both lists in parallel and extract counts
    Promise.all([
      api.get('/resumes/'),
      api.get('/jobs/'),
    ])
      .then(([resumeRes, jobRes]) => {
        setCounts({
          resumes: resumeRes.data.length,
          jobs:    jobRes.data.length,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="fade-up">
      {/* Page header */}
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Welcome to ResumeAI — your ML-powered resume screening system.</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon purple">📄</div>
          <div>
            <div className="stat-value">{loading ? '—' : counts.resumes}</div>
            <div className="stat-label">Resumes uploaded</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon teal">💼</div>
          <div>
            <div className="stat-value">{loading ? '—' : counts.jobs}</div>
            <div className="stat-label">Job postings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">⚡</div>
          <div>
            <div className="stat-value">TF-IDF</div>
            <div className="stat-label">ML model active</div>
          </div>
        </div>
      </div>

      {/* Quick start guide */}
      <div className="card fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="card-title">🚀 Quick Start</div>
        <div className="card-subtitle">Follow these steps to screen your first resume</div>
        <div className="divider" />

        <ol style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '2' }}>
          <li>Go to <strong style={{ color: 'var(--primary-light)' }}>Upload Resume</strong> and upload a PDF</li>
          <li>Go to <strong style={{ color: 'var(--primary-light)' }}>Job Postings</strong> and create a job</li>
          <li>Go to <strong style={{ color: 'var(--primary-light)' }}>Match Score</strong>, enter resume ID and job ID</li>
          <li>View the <strong style={{ color: 'var(--accent)' }}>0–100 similarity score</strong> computed by TF-IDF cosine similarity</li>
        </ol>
      </div>

      {/* ML note */}
      <div className="card fade-up" style={{ marginTop: '16px', animationDelay: '0.2s' }}>
        <div className="card-title">🧠 How the ML Works</div>
        <div className="card-subtitle">TF-IDF + Cosine Similarity</div>
        <div className="divider" />
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          The system converts both the resume text and job description into
          <strong style={{ color: 'var(--text-primary)' }}> TF-IDF vectors</strong> — numeric representations
          that weight words by their importance. It then computes the
          <strong style={{ color: 'var(--text-primary)' }}> cosine similarity</strong> between those vectors.
          A score of <span style={{ color: 'var(--success)' }}>80–100</span> means excellent match,
          <span style={{ color: 'var(--warning)' }}> 40–79</span> is moderate, and
          <span style={{ color: 'var(--danger)' }}> 0–39</span> is a poor match.
        </p>
      </div>
    </div>
  )
}
