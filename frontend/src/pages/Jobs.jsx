// src/pages/Jobs.jsx
import { useState, useEffect } from 'react'
import api from '../api/api'

export default function Jobs() {
  const [jobs, setJobs]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [form, setForm]             = useState({ title: '', description: '', required_skills: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError]   = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [showForm, setShowForm]     = useState(false)

  useEffect(() => { fetchJobs() }, [])

  async function fetchJobs() {
    setLoading(true); setError('')
    try { const res = await api.get('/jobs/'); setJobs(res.data) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) { setFormError('Title and description are required.'); return }
    setSubmitting(true); setFormError(''); setFormSuccess('')
    try {
      const res = await api.post('/jobs/', form)
      setJobs(prev => [res.data, ...prev])
      setForm({ title: '', description: '', required_skills: '' })
      setFormSuccess(`Job "${res.data.title}" created! (ID: #${res.data.id})`)
      setShowForm(false)
    } catch (err) { setFormError(err.message) }
    finally { setSubmitting(false) }
  }

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h2>Open Roles</h2>
          <p>{loading ? 'Loading…' : `${jobs.length} job${jobs.length !== 1 ? 's' : ''} posted`}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ Post New Role'}
        </button>
      </div>

      {/* Create form (collapsible) */}
      {showForm && (
        <div className="card fade-up" style={{ marginBottom: 24 }}>
          <div className="card-title">Post a New Job Role</div>
          <div className="card-subtitle">Fill in the details below to create a new posting</div>
          <div className="divider" />
          <form onSubmit={handleSubmit}>
            <div className="two-col" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Job Title *</label>
                <input className="form-input" name="title" placeholder="e.g. Senior Python Developer" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Required Skills</label>
                <input className="form-input" name="required_skills" placeholder="e.g. Python, FastAPI, PostgreSQL" value={form.required_skills} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Job Description *</label>
              <textarea className="form-textarea" name="description" placeholder="Describe responsibilities and qualifications…" value={form.description} onChange={handleChange} rows={4} required />
            </div>
            {formError   && <div className="alert alert-error">⚠️ {formError}</div>}
            {formSuccess && <div className="alert alert-success">✅ {formSuccess}</div>}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Creating…</> : '💼 Create Job Posting'}
            </button>
          </form>
        </div>
      )}

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {!showForm && formSuccess && <div className="alert alert-success">✅ {formSuccess}</div>}

      {loading && <div className="spinner-wrap"><div className="spinner" />Loading roles…</div>}

      {!loading && jobs.length === 0 && !error && (
        <div className="empty-state card">
          <div className="empty-icon">📭</div>
          <h3>No roles posted yet</h3>
          <p>Click "Post New Role" to create your first job posting.</p>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="table-wrap">
          <table className="candidate-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Job Title</th>
                <th>Description</th>
                <th>Required Skills</th>
                <th>Posted</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, i) => {
                const skills = job.required_skills
                  ? job.required_skills.split(',').map(s => s.trim()).filter(Boolean)
                  : []
                return (
                  <tr key={job.id}>
                    <td className="rank-cell">
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{job.id}</span>
                    </td>
                    <td>
                      <div className="candidate-name">{job.title}</div>
                    </td>
                    <td style={{ maxWidth: 280 }}>
                      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {job.description}
                      </div>
                    </td>
                    <td>
                      <div className="skills-cell">
                        {skills.slice(0, 4).map((s, si) => (
                          <span key={s} className={`tag ${si % 2 === 0 ? 'tag-teal' : 'tag-blue'}`}>{s}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
