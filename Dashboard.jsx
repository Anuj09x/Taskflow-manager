import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function Stat({ label, value, color }) {
  return (
    <div className="card">
      <div className={`text-3xl font-display font-bold ${color}`}>{value}</div>
      <div className="text-muted text-xs font-mono mt-1">{label}</div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/dashboard')
      .then(r => setStats(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-muted text-sm">loading stats...</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-100">
          gm, {user?.name.split(' ')[0]}
        </h1>
        <p className="text-muted text-xs font-mono mt-1">
          role: <span className="text-accent">{user?.role}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Stat label="projects" value={stats?.total_projects ?? 0} color="text-accent" />
        <Stat label="total tasks" value={stats?.total_tasks ?? 0} color="text-slate-200" />
        <Stat label="todo" value={stats?.todo ?? 0} color="text-slate-400" />
        <Stat label="in progress" value={stats?.in_progress ?? 0} color="text-blue-400" />
        <Stat label="done" value={stats?.done ?? 0} color="text-green-400" />
        <Stat label="overdue" value={stats?.overdue ?? 0} color="text-danger" />
      </div>

      {stats?.overdue > 0 && (
        <div className="border border-danger/30 bg-danger/5 rounded-lg px-5 py-4">
          <div className="text-danger text-sm font-mono">
            ⚠ {stats.overdue} overdue task{stats.overdue > 1 ? 's' : ''} — check your projects
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="font-display font-semibold text-slate-200 mb-4">quick links</h2>
        <div className="flex gap-3">
          <Link to="/projects" className="btn-ghost text-sm">→ view projects</Link>
          {user?.role === 'admin' && (
            <Link to="/users" className="btn-ghost text-sm">→ manage users</Link>
          )}
        </div>
      </div>
    </div>
  )
}
