// src/pages/Resumes.jsx
// Lists all uploaded resumes fetched from GET /resumes/

import { useState, useEffect } from 'react'
import api from '../api/api'

export default function Resumes() {
  const [resumes, setResumes]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')

  // Fetch all resumes on mount
  useEffect(() => {
    api.get('/resumes/')
      .then(res => setResumes(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Client-side search filter (name, email, skills)
  const filtered = resumes.filter(r => {
    const q = search.toLowerCase()
    return (
      (r.name  || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.skills|| '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="fade-up">
      <div className="page-header">
        <h2>All Resumes</h2>
        <p>
          {loading ? 'Loading…' : `${resumes.length} resume${resumes.length !== 1 ? 's' : ''} in the database`}
        </p>
      </div>

      {/* Search bar */}
      {!loading && resumes.length > 0 && (
        <div className="form-group" style={{ maxWidth: '400px', marginBottom: '24px' }}>
          <input
            className="form-input"
            placeholder="🔍  Search by name, email or skill…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Error */}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Loading */}
      {loading && (
        <div className="spinner-wrap">
          <div className="spinner" />
          Fetching resumes…
        </div>
      )}

      {/* Empty */}
      {!loading && !error && resumes.length === 0 && (
        <div className="empty-state card">
          <div className="empty-icon">📭</div>
          <h3>No resumes yet</h3>
          <p>Upload a PDF resume to get started.</p>
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="item-grid">
          {filtered.map(resume => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      )}

      {/* No search results */}
      {!loading && resumes.length > 0 && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No matches for "{search}"</h3>
          <p>Try a different name, email, or skill.</p>
        </div>
      )}
    </div>
  )
}

function ResumeCard({ resume }) {
  const skills = resume.skills
    ? resume.skills.split(',').map(s => s.trim()).filter(Boolean)
    : []

  return (
    <div className="item-card fade-up">
      <div className="item-id">Resume #{resume.id}</div>
      <div className="item-name">{resume.name || 'Unknown Candidate'}</div>
      <div className="item-email">{resume.email || 'No email found'}</div>

      {skills.length > 0 && (
        <div className="skills-list">
          {skills.slice(0, 6).map(s => (
            <span key={s} className="tag tag-teal">{s}</span>
          ))}
          {skills.length > 6 && (
            <span className="tag tag-gray">+{skills.length - 6} more</span>
          )}
        </div>
      )}

      <div style={{ marginTop: '14px', fontSize: '11px', color: 'var(--text-muted)' }}>
        Uploaded {new Date(resume.created_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric'
        })}
      </div>
    </div>
  )
}
