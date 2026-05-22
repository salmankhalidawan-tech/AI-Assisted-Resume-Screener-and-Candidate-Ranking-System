// src/api/api.js
// Centralised Axios instance for all FastAPI calls.
//
// Base URL:
//   - In development (Vite dev server):  Vite proxies /resumes, /jobs, /match → localhost:8000
//   - In production build: set VITE_API_BASE_URL env var to your deployed API URL
//
// Usage anywhere in the app:
//   import api from '../api/api'
//   const res = await api.get('/resumes/')

import axios from 'axios'

const api = axios.create({
  // Use env var if provided (production), otherwise empty string (Vite proxy handles it)
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,  // 30-second timeout for large PDF uploads
})

// ── Request interceptor ───────────────────────────────────────────────────────
// Can be used to attach auth tokens in the future
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// ── Response interceptor ──────────────────────────────────────────────────────
// Normalises error messages so every catch block gets a readable string
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

export default api
