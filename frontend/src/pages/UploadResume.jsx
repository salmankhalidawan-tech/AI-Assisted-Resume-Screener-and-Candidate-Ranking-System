// src/pages/UploadResume.jsx
import { useState, useRef } from 'react'
import api from '../api/api'

export default function UploadResume() {
  const [file, setFile]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)
  const [error, setError]       = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  function handleFileChange(e) {
    const selected = e.target.files[0]
    if (selected) validateAndSet(selected)
  }

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) validateAndSet(dropped)
  }

  function validateAndSet(f) {
    setError(''); setResult(null)
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are accepted.'); return
    }
    setFile(f)
  }

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) { setError('Please select a PDF file first.'); return }
    setLoading(true); setError(''); setResult(null)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data); setFile(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const skillList = (skills) =>
    (skills || '').split(',').map(s => s.trim()).filter(Boolean)

  return (
    <div className="fade-up">
      <div className="page-header">
        <div>
          <h2>Upload Resume</h2>
          <p>Upload a PDF — we auto-extract name, email &amp; skills using NLP</p>
        </div>
      </div>

      <div className="two-col" style={{ alignItems: 'start' }}>
        {/* Upload card */}
        <div className="card">
          <div className="card-title">📤 Select Resume PDF</div>
          <div className="card-subtitle">PDF files only · max 10 MB</div>
          <div className="divider" />

          <form onSubmit={handleUpload}>
            <div
              className={`drop-zone${dragOver ? ' drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" accept=".pdf,application/pdf" onChange={handleFileChange} style={{ display: 'none' }} />
              <div className="drop-icon">📋</div>
              <h3>Drag &amp; drop your PDF here</h3>
              <p>or click to browse files</p>
              {file && <div className="file-selected">✅ {file.name} ({(file.size / 1024).toFixed(1)} KB)</div>}
            </div>

            {error && <div className="alert alert-error" style={{ marginTop: 14 }}>⚠️ {error}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-full"
              style={{ marginTop: 18 }}
              disabled={loading || !file}
            >
              {loading
                ? <><span className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} /> Uploading…</>
                : '⬆ Upload Resume'}
            </button>
          </form>
        </div>

        {/* Parsed result card */}
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
              <div className="spinner" />Parsing PDF…
            </div>
          )}

          {result && (
            <div className="fade-up">
              <div className="alert alert-success">
                ✅ Resume uploaded! ID: <strong>#{result.id}</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Field label="Resume ID" value={`#${result.id}`} accent />
                <Field label="Name"  value={result.name  || '—'} />
                <Field label="Email" value={result.email || '—'} />
                <Field
                  label="Skills detected"
                  value={skillList(result.skills)}
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

function Field({ label, value, accent, isTags }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
        {label}
      </div>
      {isTags ? (
        <div className="skills-list">
          {value.length > 0
            ? value.map(s => <span key={s} className="tag tag-teal">{s}</span>)
            : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>None detected</span>}
        </div>
      ) : (
        <div style={{ fontSize: 14, color: accent ? 'var(--primary)' : 'var(--text-primary)', fontWeight: accent ? 700 : 400 }}>
          {value}
        </div>
      )}
    </div>
  )
}
