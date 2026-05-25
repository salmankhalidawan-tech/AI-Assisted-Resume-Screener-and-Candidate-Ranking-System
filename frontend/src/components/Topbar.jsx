// src/components/Topbar.jsx
import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/':        'Dashboard',
  '/upload':  'Upload Resume',
  '/resumes': 'Candidates (Active)',
  '/jobs':    'Open Roles',
  '/match':   'Analytics',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] || 'Dashboard'

  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-actions">
        <button className="icon-btn" title="Notifications">
          🔔
          <span className="dot" />
        </button>
        <button className="icon-btn" title="Settings">⚙️</button>
      </div>
    </div>
  )
}
