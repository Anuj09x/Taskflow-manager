import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: '// dashboard', icon: '▦' },
  { to: '/projects',  label: '// projects',  icon: '◈' },
  { to: '/users',     label: '// users',     icon: '◉', adminOnly: true },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-panel border-r border-border flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <div className="text-accent font-display font-bold text-lg tracking-tight">TaskFlow</div>
          <div className="text-muted text-xs font-mono mt-0.5">v1.0.0</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => {
            if (item.adminOnly && user?.role !== 'admin') return null
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                    isActive
                      ? 'bg-accent/10 text-accent border border-accent/20'
                      : 'text-muted hover:text-slate-300 hover:bg-border'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-border">
          <div className="text-slate-300 text-xs truncate">{user?.name}</div>
          <div className="text-muted text-xs font-mono">{user?.role}</div>
          <button
            onClick={handleLogout}
            className="mt-3 text-xs text-muted hover:text-danger transition-colors"
          >
            → logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-surface">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
