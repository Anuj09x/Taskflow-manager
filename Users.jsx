import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Users() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/dashboard'); return }
    axios.get('/users').then(r => setUsers(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-muted text-sm">loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">users</h1>
        <p className="text-muted text-xs font-mono mt-0.5">{users.length} registered</p>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr className="text-muted text-xs font-mono">
              <th className="px-5 py-3 text-left">id</th>
              <th className="px-5 py-3 text-left">name</th>
              <th className="px-5 py-3 text-left">email</th>
              <th className="px-5 py-3 text-left">role</th>
              <th className="px-5 py-3 text-left">joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-border/30 transition-colors">
                <td className="px-5 py-3 text-muted font-mono text-xs">#{u.id}</td>
                <td className="px-5 py-3 text-slate-200">{u.name}</td>
                <td className="px-5 py-3 text-muted font-mono text-xs">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={u.role === 'admin' ? 'text-accent text-xs font-mono' : 'text-muted text-xs font-mono'}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted text-xs font-mono">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
