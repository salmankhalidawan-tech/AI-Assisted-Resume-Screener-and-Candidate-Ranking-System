// src/pages/Resumes.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??'
}

function getStatus(index) {
  return ['Shortlisted', 'Under Review', 'Contacted', 'Pending'][index % 4]
}

function StatusBadge({ status }) {
  const cls = {
    'Shortlisted':  'status-badge status-shortlisted',
    'Under Review': 'status-badge status-review',
    'Contacted':    'status-badge status-contacted',
    'Pending':      'status-badge status-pending',
  }[status] || 'status-badge status-pending'
  return <span className={cls}>{status}</span>
}

export default function Resumes() {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [search, setSearch]   = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/resumes/')
      .then(res => setResumes(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = resumes.filter(r => {
    const q = search.toLowerCase()
    return (
      (r.name  || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.skills|| '').toLowerCase().includes(q)
    )
  })

  const skillList = (skills) =>
    (skills || '').split(',').map(s => s.trim()).filter(Boolean)

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h2>Candidates (Active)</h2>
          <p>{loading ? 'Loading…' : `${resumes.length} candidate${resumes.length !== 1 ? 's' : ''} in the system`}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/upload')}>
          + Upload Resume
        </button>
      </div>

      {/* Search */}
      <div className="search-filter-row" style={{ marginBottom: 20 }}>
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            placeholder="Search by name, email or skill…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-filter">⚡ Filters</button>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {loading && (
        <div className="spinner-wrap">
          <div className="spinner" />Fetching candidates…
        </div>
      )}

      {!loading && !error && resumes.length === 0 && (
        <div className="empty-state card">
          <div className="empty-icon">📭</div>
          <h3>No candidates yet</h3>
          <p>Upload a PDF resume to get started.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="table-wrap">
          <table className="candidate-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Candidate Name</th>
                <th>Email</th>
                <th>Skills</th>
                <th>Status</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id}>
                  <td className="rank-cell">
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</span>
                  </td>
                  <td>
                    <div className="candidate-cell">
                      <div className="candidate-avatar">{getInitials(r.name)}</div>
                      <div>
                        <div className="candidate-name">{r.name || 'Unknown'}</div>
                        <div className="candidate-score-sub">Resume #{r.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--primary)', fontSize: 13 }}>{r.email || '—'}</td>
                  <td>
                    <div className="skills-cell">
                      {skillList(r.skills).slice(0, 3).map((s, si) => (
                        <span key={s} className={`tag ${si % 2 === 0 ? 'tag-teal' : 'tag-blue'}`}>{s}</span>
                      ))}
                    </div>
                  </td>
                  <td><StatusBadge status={getStatus(i)} /></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <div className="action-col">
                      <button className="action-btn evaluate" onClick={() => navigate('/match')}>Evaluate</button>
                      <button className="action-btn">Schedule</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
