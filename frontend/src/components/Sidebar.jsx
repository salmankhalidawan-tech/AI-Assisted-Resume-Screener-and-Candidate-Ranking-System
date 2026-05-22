// src/components/Sidebar.jsx
// Persistent left-side navigation for the dashboard.

import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/',        icon: '⬡', label: 'Dashboard' },
  { to: '/upload',  icon: '↑', label: 'Upload Resume' },
  { to: '/resumes', icon: '📄', label: 'All Resumes' },
  { to: '/jobs',    icon: '💼', label: 'Job Postings' },
  { to: '/match',   icon: '⚡', label: 'Match Score' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">🎯</div>
        <h1>ResumeAI</h1>
        <p>Intelligent Screener</p>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="nav-label">Menu</span>

        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-item${isActive ? ' active' : ''}`
            }
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <p>FastAPI · PostgreSQL · TF-IDF</p>
      </div>
    </aside>
  )
}
