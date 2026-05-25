// src/pages/Dashboard.jsx
// AI Resume Screener: Active Candidates — ranked table view

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'

const STATUS_OPTIONS = ['All Status', 'Shortlisted', 'Under Review', 'Contacted', 'Pending']
const ROLE_OPTIONS   = ['All Roles', 'Software Engineer', 'Junior Engineer', 'Senior Engineer', 'Data Scientist', 'Product Manager']
const EXP_OPTIONS    = ['All Experience', '0-1 Years', '1-3 Years', '3-5 Years', '5+ Years']

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??'
}

function getAvatarColor(name = '') {
  const colors = [
    ['#58a6ff', '#00d4aa'],
    ['#00d4aa', '#3fb950'],
    ['#e3b341', '#f85149'],
    ['#bc8cff', '#58a6ff'],
    ['#f78166', '#e3b341'],
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

function getStatus(index) {
  if (index === 0) return 'Shortlisted'
  if (index === 1) return 'Under Review'
  if (index === 2) return 'Contacted'
  return 'Pending'
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

export default function Dashboard() {
  const [resumes, setResumes]     = useState([])
  const [jobs, setJobs]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [roleFilter, setRole]     = useState('All Roles')
  const [statusFilter, setStatus] = useState('All Status')
  const [expFilter, setExp]       = useState('All Experience')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([api.get('/resumes/'), api.get('/jobs/')])
      .then(([r, j]) => { setResumes(r.data); setJobs(j.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Build a candidate list from resumes, assign mock AI scores descending
  const candidates = resumes
    .map((r, i) => ({
      ...r,
      aiScore: Math.max(55, 98 - i * 7 + (r.id % 5)),
      jobRole: jobs[i % Math.max(jobs.length, 1)]?.title || 'Software Engineer',
      experience: ['1 Year', '2 Years', '3 Years', '4 Years', '5 Years'][i % 5],
      location: ['San Francisco', 'Austin', 'New York', 'Seattle', 'Chicago'][i % 5],
      status: getStatus(i),
    }))
    .sort((a, b) => b.aiScore - a.aiScore)

  // Filters
  const filtered = candidates.filter(c => {
    const q = search.toLowerCase()
    const matchSearch =
      (c.name  || '').toLowerCase().includes(q) ||
      (c.skills|| '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    const matchStatus = statusFilter === 'All Status' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const skillList = (skills) =>
    (skills || '').split(',').map(s => s.trim()).filter(Boolean)

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>AI Resume Screener: Active Candidates</h2>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/upload')}>
          + Dashboard
        </button>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon teal">👥</div>
          <div>
            <div className="stat-value">{loading ? '—' : resumes.length}</div>
            <div className="stat-label">Total Candidates</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📋</div>
          <div>
            <div className="stat-value">{loading ? '—' : jobs.length}</div>
            <div className="stat-label">Open Roles</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teal">✅</div>
          <div>
            <div className="stat-value">{loading ? '—' : candidates.filter(c => c.status === 'Shortlisted').length}</div>
            <div className="stat-label">Shortlisted</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⚡</div>
          <div>
            <div className="stat-value">TF-IDF</div>
            <div className="stat-label">ML Model Active</div>
          </div>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="search-filter-row">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            placeholder="Search Candidates, Skills, Experience..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-filter">⚡ Filters</button>
        <button className="btn-filter">▼</button>
      </div>

      <div className="filter-dropdowns" style={{ marginBottom: 16 }}>
        <select className="filter-select" value={roleFilter} onChange={e => setRole(e.target.value)}>
          {ROLE_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
        <select className="filter-select" value={statusFilter} onChange={e => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
        <select className="filter-select">
          <option>Location: All</option>
          <option>San Francisco</option>
          <option>New York</option>
          <option>Austin</option>
          <option>Seattle</option>
        </select>
        <select className="filter-select" value={expFilter} onChange={e => setExp(e.target.value)}>
          {EXP_OPTIONS.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading && (
        <div className="spinner-wrap">
          <div className="spinner" />
          Loading candidates…
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty-state card">
          <div className="empty-icon">👥</div>
          <h3>No candidates found</h3>
          <p>Upload resumes to start screening candidates.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="table-wrap">
          <table className="candidate-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Candidate Name</th>
                <th>AI Score ↕</th>
                <th>Job Role</th>
                <th>Experience</th>
                <th>Skills</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const rank = i + 1
                const skills = skillList(c.skills).slice(0, 3)
                const [c1, c2] = getAvatarColor(c.name || '')
                return (
                  <tr key={c.id}>
                    {/* Rank */}
                    <td className="rank-cell">
                      {rank <= 3 ? (
                        <div className={`rank-medal rank-${rank}`}>{rank}</div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{rank}</span>
                      )}
                    </td>

                    {/* Name */}
                    <td>
                      <div className="candidate-cell">
                        <div
                          className="candidate-avatar"
                          style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                        >
                          {getInitials(c.name)}
                        </div>
                        <div>
                          <div className="candidate-name">{c.name || 'Unknown'}</div>
                          <div className="candidate-score-sub">AI Score {c.aiScore}</div>
                        </div>
                      </div>
                    </td>

                    {/* AI Score */}
                    <td>
                      <div className="score-cell">
                        <span className="score-trend" style={{ color: 'var(--primary)' }}>📈</span>
                        <span className="score-num" style={{ color: c.aiScore >= 80 ? 'var(--primary)' : c.aiScore >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                          {c.aiScore}
                        </span>
                      </div>
                    </td>

                    {/* Job Role */}
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      {c.jobRole}
                    </td>

                    {/* Experience */}
                    <td>{c.experience}</td>

                    {/* Skills */}
                    <td>
                      <div className="skills-cell">
                        {skills.map((s, si) => (
                          <span key={s} className={`tag ${si % 2 === 0 ? 'tag-teal' : 'tag-blue'}`}>{s}</span>
                        ))}
                      </div>
                    </td>

                    {/* Location */}
                    <td>{c.location}</td>

                    {/* Status */}
                    <td><StatusBadge status={c.status} /></td>

                    {/* Actions */}
                    <td>
                      <div className="action-col">
                        <button className="action-btn" onClick={() => navigate('/resumes')}>View Profile</button>
                        <button className="action-btn evaluate" onClick={() => navigate('/match')}>Evaluate</button>
                        <button className="action-btn">Schedule Interview</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
