// src/pages/Match.jsx
// Computes ML similarity score between a resume and a job (POST /match/)

import { useState, useEffect } from 'react'
import api from '../api/api'

// Derive score colour and label from the numeric score
function getScoreMeta(score) {
  if (score >= 80) return { color: 'var(--success)',  label: 'Excellent Match 🎯', grade: 'A' }
  if (score >= 60) return { color: 'var(--accent)',   label: 'Good Match 👍',      grade: 'B' }
  if (score >= 40) return { color: 'var(--warning)',  label: 'Moderate Match 🤔',  grade: 'C' }
  return              { color: 'var(--danger)',   label: 'Poor Match ❌',       grade: 'D' }
}

export default function Match() {
  const [resumeId, setResumeId] = useState('')
  const [jobId, setJobId]       = useState('')
  const [result, setResult]     = useState(null)    // Match API response
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // Dropdowns — load resume and job lists for convenience
  const [resumes, setResumes] = useState([])
  const [jobs, setJobs]       = useState([])

  useEffect(() => {
    api.get('/resumes/').then(r => setResumes(r.data)).catch(() => {})
    api.get('/jobs/').then(r => setJobs(r.data)).catch(() => {})
  }, [])

  async function handleMatch(e) {
    e.preventDefault()
    const rid = parseInt(resumeId, 10)
    const jid = parseInt(jobId, 10)

    if (!rid || rid < 1) { setError('Please enter a valid Resume ID (≥ 1).'); return }
    if (!jid || jid < 1) { setError('Please enter a valid Job ID (≥ 1).'); return }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await api.post('/match/', { resume_id: rid, job_id: jid })
      setResult(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const meta  = result ? getScoreMeta(result.score) : null
  const pct   = result ? result.score : 0

  return (
    <div className="fade-up">
      <div className="page-header">
        <h2>Match Score</h2>
        <p>Enter a resume ID and a job ID to compute the TF-IDF cosine similarity score.</p>
      </div>

      <div className="two-col" style={{ alignItems: 'start' }}>
        {/* ── Input Form ─────────────────────────────────────────────────── */}
        <div className="card">
          <div className="card-title">⚡ Run ML Match</div>
          <div className="card-subtitle">Select or type the IDs to compare</div>
          <div className="divider" />

          <form onSubmit={handleMatch}>
            {/* Resume selector */}
            <div className="form-group">
              <label className="form-label">Resume ID *</label>
              {resumes.length > 0 ? (
                <select
                  className="form-select"
                  value={resumeId}
                  onChange={e => setResumeId(e.target.value)}
                >
                  <option value="">— Select a resume —</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>
                      #{r.id} — {r.name || r.email || 'Unknown'}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  placeholder="Enter resume ID (e.g. 1)"
                  value={resumeId}
                  onChange={e => setResumeId(e.target.value)}
                />
              )}
            </div>

            {/* Job selector */}
            <div className="form-group">
              <label className="form-label">Job ID *</label>
              {jobs.length > 0 ? (
                <select
                  className="form-select"
                  value={jobId}
                  onChange={e => setJobId(e.target.value)}
                >
                  <option value="">— Select a job —</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>
                      #{j.id} — {j.title}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  placeholder="Enter job ID (e.g. 1)"
                  value={jobId}
                  onChange={e => setJobId(e.target.value)}
                />
              )}
            </div>

            {error && <div className="alert alert-error">⚠️ {error}</div>}

            <button
              type="submit"
              className="btn btn-accent btn-full"
              disabled={loading}
            >
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Computing…</>
                : '⚡ Compute Match Score'}
            </button>
          </form>

          {/* Scoring legend */}
          <div className="divider" />
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 2 }}>
            <div>🎯 <strong style={{ color: 'var(--success)' }}>80–100</strong> — Excellent match</div>
            <div>👍 <strong style={{ color: 'var(--accent)'  }}>60–79</strong> — Good match</div>
            <div>🤔 <strong style={{ color: 'var(--warning)' }}>40–59</strong> — Moderate match</div>
            <div>❌ <strong style={{ color: 'var(--danger)'  }}>0–39</strong> — Poor match</div>
          </div>
        </div>

        {/* ── Score Display ───────────────────────────────────────────────── */}
        <div className="card">
          <div className="card-title">📊 Result</div>
          <div className="card-subtitle">Cosine similarity score (0–100)</div>
          <div className="divider" />

          {!result && !loading && (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <h3>No match computed yet</h3>
              <p>Select resume and job IDs, then click compute.</p>
            </div>
          )}

          {loading && (
            <div className="spinner-wrap">
              <div className="spinner" />
              Running TF-IDF analysis…
            </div>
          )}

          {result && meta && (
            <div className="fade-up">
              {/* Score circle */}
              <div className="score-wrapper">
                <div
                  className="score-circle"
                  style={{
                    '--score-color': meta.color,
                    '--score-pct': `${pct}%`,
                  }}
                >
                  <span className="score-number">{result.score.toFixed(1)}</span>
                  <span className="score-unit">/ 100</span>
                </div>

                <div className="score-label" style={{ color: meta.color }}>
                  {meta.label}
                </div>
                <div className="score-sub">
                  Resume #{result.resume_id} vs Job #{result.job_id}
                </div>
              </div>

              {/* Progress bar */}
              <div className="score-bar-wrap">
                <div
                  className="score-bar"
                  style={{ width: `${pct}%`, background: meta.color }}
                />
              </div>
              <div className="score-brackets">
                <span>0 — No match</span>
                <span>100 — Perfect match</span>
              </div>

              {/* Meta info */}
              <div className="divider" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <InfoRow label="Match ID"    value={`#${result.id}`} />
                <InfoRow label="Grade"       value={meta.grade} />
                <InfoRow label="Resume ID"   value={`#${result.resume_id}`} />
                <InfoRow label="Job ID"      value={`#${result.job_id}`} />
                <InfoRow
                  label="Computed at"
                  value={new Date(result.created_at).toLocaleTimeString()}
                  full
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, full }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
      <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{value}</div>
    </div>
  )
}
