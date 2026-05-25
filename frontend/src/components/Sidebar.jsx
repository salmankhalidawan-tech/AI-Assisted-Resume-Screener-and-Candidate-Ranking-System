// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/',         icon: '⊞', label: 'Dashboard' },
  { to: '/jobs',     icon: '📋', label: 'Open Roles' },
  { to: '/resumes',  icon: '👥', label: 'Candidates (Active)' },
  { to: '/match',    icon: '📊', label: 'Analytics' },
  { to: '/upload',   icon: '⬆', label: 'Upload Resume' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-box">R</div>
        <span className="logo-text">RankFlow</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}

        <div className="nav-section-label" style={{ marginTop: 16 }}>System</div>
        <a href="#" className="nav-item">
          <span className="nav-icon">⚙</span>Settings
        </a>
        <a href="#" className="nav-item">
          <span className="nav-icon">🛡</span>Admin
        </a>
      </nav>

      {/* User */}
      <div className="sidebar-user">
        <div className="user-avatar">SJ</div>
        <div className="user-info">
          <div className="user-name">Sarah J.</div>
          <div className="user-role">Admin</div>
        </div>
      </div>
    </aside>
  )
}
