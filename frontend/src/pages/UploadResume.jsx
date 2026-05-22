// src/pages/UploadResume.jsx
// Allows users to drag-drop or click-select a PDF and POST to /resumes/upload

import { useState, useRef } from 'react'
import api from '../api/api'

export default function UploadResume() {
  const [file, setFile]         = useState(null)        // Selected File object
  const [loading, setLoading]   = useState(false)       // Upload in progress
  const [result, setResult]     = useState(null)        // Successful response
  const [error, setError]       = useState('')          // Error message
  const [dragOver, setDragOver] = useState(false)       // Drag-over visual state
  const inputRef = useRef(null)

  // ── File selection (click or drag) ──────────────────────────────────────────
  function handleFileChange(e) {
    const selected = e.target.files[0]
    if (selected) validateAndSet(selected)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) validateAndSet(dropped)
  }

  function validateAndSet(f) {
    setError('')
    setResult(null)
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are accepted. Please select a .pdf file.')
      return
    }
    setFile(f)
  }

  // ── Upload ──────────────────────────────────────────────────────────────────
  async function handleUpload(e) {
    e.preventDefault()
    if (!file) { setError('Please select a PDF file first.'); return }

    setLoading(true)
    setError('')
    setResult(null)

    // Build multipart/form-data — FastAPI expects the field named "file"
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data)
      setFile(null)
      // Reset file input
      if (inputRef.current) inputRef.current.value = ''
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-up">
      <div className="page-header">
        <h2>Upload Resume</h2>
        <p>Upload a PDF resume — the system will auto-extract name, email, and skills.</p>
      </div>

      <div className="two-col">
        {/* ── Upload Form ─────────────────────────────────────────────────── */}
        <div className="card">
          <div className="card-title">📤 Select Resume PDF</div>
          <div className="card-subtitle">PDF files only · max 10 MB</div>
          <div className="divider" />

          <form onSubmit={handleUpload}>
            {/* Drop zone */}
            <div
              className={`drop-zone${dragOver ? ' drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div className="drop-icon">📋</div>
              <h3>Drag & drop your PDF here</h3>
              <p>or click to browse files</p>
              {file && (
                <div className="file-selected">
                  ✅ {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            {/* Error alert */}
            {error && (
              <div className="alert alert-error" style={{ marginTop: '16px' }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full"
              style={{ marginTop: '20px' }}
              disabled={loading || !file}
            >
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Uploading…</>
              ) : '↑ Upload Resume'}
            </button>
          </form>
        </div>

        {/* ── Success Result ───────────────────────────────────────────────── */}
        <div className="card">
          <div className="card-title">📊 Parsed Result</div>
          <div className="card-subtitle">Fields extracted automatically from the PDF</div>
          <div className="divider" />

          {!result && !loading && (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No resume uploaded yet</h3>
              <p>Upload a PDF to see parsed fields here</p>
            </div>
          )}

          {loading && (
            <div className="spinner-wrap">
              <div className="spinner" />
              Parsing PDF…
            </div>
          )}

          {result && (
            <div className="fade-up">
              <div className="alert alert-success">
                ✅ Resume uploaded successfully! ID: <strong>#{result.id}</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Field label="Resume ID" value={`#${result.id}`} accent />
                <Field label="Name"  value={result.name  || '—'} />
                <Field label="Email" value={result.email || '—'} />
                <Field
                  label="Skills detected"
                  value={
                    result.skills
                      ? result.skills.split(',').map(s => s.trim()).filter(Boolean)
                      : []
                  }
                  isTags
                />
                <Field label="Uploaded at" value={new Date(result.created_at).toLocaleString()} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Small helper to render a label + value row
function Field({ label, value, accent, isTags }) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
        {label}
      </div>
      {isTags ? (
        <div className="skills-list">
          {value.length > 0
            ? value.map(s => <span key={s} className="tag tag-teal">{s}</span>)
            : <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>None detected</span>
          }
        </div>
      ) : (
        <div style={{ fontSize: '14px', color: accent ? 'var(--primary-light)' : 'var(--text-primary)', fontWeight: accent ? '700' : '400' }}>
          {value}
        </div>
      )}
    </div>
  )
}
