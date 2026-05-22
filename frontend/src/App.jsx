// src/App.jsx
// Root component — sets up the shell layout and client-side routes.

import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import UploadResume from './pages/UploadResume'
import Resumes from './pages/Resumes'
import Jobs from './pages/Jobs'
import Match from './pages/Match'

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        <Routes>
          <Route path="/"        element={<Dashboard />} />
          <Route path="/upload"  element={<UploadResume />} />
          <Route path="/resumes" element={<Resumes />} />
          <Route path="/jobs"    element={<Jobs />} />
          <Route path="/match"   element={<Match />} />
        </Routes>
      </main>
    </div>
  )
}
