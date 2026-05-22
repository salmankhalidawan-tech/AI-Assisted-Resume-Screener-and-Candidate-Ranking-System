// src/pages/Jobs.jsx
// Lists all job postings (GET /jobs/) and allows creating new ones (POST /jobs/)

import { useState, useEffect } from 'react'
import api from '../api/api'

export default function Jobs() {
  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  // Form state
  const [form, setForm]         = useState({ title: '', description: '', required_skills: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError]   = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  // Fetch all jobs on mount
  useEffect(() => {
    fetchJobs()
  }, [])

  async function fetchJobs() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/jobs/')
      setJobs(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      setFormError('Title and description are required.')
      return
    }
    setSubmitting(true)
    setFormError('')
    setFormSuccess('')
    try {
      const res = await api.post('/jobs/', form)
      setJobs(prev => [res.data, ...prev])  // Prepend new job to the list
      setForm({ title: '', description: '', required_skills: '' })
      setFormSuccess(`Job "${res.data.title}" created! (ID: #${res.data.id})`)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fade-up">
      <div className="page-header">
        <h2>Job Postings</h2>
        <p>{loading ? 'Loading…' : `${jobs.length} job${jobs.length !== 1 ? 's' : ''} posted`}</p>
      </div>

      <div className="two-col" style={{ alignItems: 'start' }}>
        {/* ── Create Job Form ────────────────────────────────────────────── */}
        <div className="card" style={{ position: 'sticky', top: '24px' }}>
          <div className="card-title">➕ Post a New Job</div>
          <div className="card-subtitle">Fill in the details below</div>
          <div className="divider" />

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Job Title *</label>
              <input
                className="form-input"
                name="title"
                placeholder="e.g. Senior Python Developer"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Description *</label>
              <textarea
                className="form-textarea"
                name="description"
                placeholder="Describe responsibilities, qualifications, and expectations…"
                value={form.description}
                onChange={handleChange}
                rows={5}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Required Skills</label>
              <input
                className="form-input"
                name="required_skills"
                placeholder="e.g. Python, FastAPI, PostgreSQL, Docker"
                value={form.required_skills}
                onChange={handleChange}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Comma-separated list of skills
              </div>
            </div>

            {formError   && <div className="alert alert-error">⚠️ {formError}</div>}
            {formSuccess && <div className="alert alert-success">✅ {formSuccess}</div>}

            <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
              {submitting
                ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating…</>
                : '💼 Create Job Posting'}
            </button>
          </form>
        </div>

        {/* ── Jobs List ──────────────────────────────────────────────────── */}
        <div>
          {error && <div className="alert alert-error">⚠️ {error}</div>}

          {loading && (
            <div className="spinner-wrap">
              <div className="spinner" />
              Loading jobs…
            </div>
          )}

          {!loading && jobs.length === 0 && !error && (
            <div className="empty-state card">
              <div className="empty-icon">📭</div>
              <h3>No jobs posted yet</h3>
              <p>Create your first job posting using the form.</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {jobs.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        </div>
      </div>
    </div>
  )
}

function JobCard({ job }) {
  const skills = job.required_skills
    ? job.required_skills.split(',').map(s => s.trim()).filter(Boolean)
    : []

  return (
    <div className="item-card fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div>
          <div className="item-id">Job #{job.id}</div>
          <div className="item-name">{job.title}</div>
        </div>
        <span className="tag tag-purple">ID: {job.id}</span>
      </div>

      <div className="item-desc" style={{ marginTop: '10px' }}>{job.description}</div>

      {skills.length > 0 && (
        <div className="skills-list">
          {skills.map(s => <span key={s} className="tag tag-purple">{s}</span>)}
        </div>
      )}

      <div style={{ marginTop: '14px', fontSize: '11px', color: 'var(--text-muted)' }}>
        Posted {new Date(job.created_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric'
        })}
      </div>
    </div>
  )
}
