import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signup(form.name, form.email, form.password, form.role)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="text-accent font-display font-bold text-3xl">TaskFlow</div>
          <div className="text-muted text-sm font-mono mt-1">// create your account</div>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="text-danger text-xs font-mono border border-danger/30 bg-danger/10 rounded px-3 py-2">
              error: {error}
            </div>
          )}
          <div>
            <label className="text-xs text-muted font-mono block mb-1">name</label>
            <input className="input" placeholder="Your Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div>
            <label className="text-xs text-muted font-mono block mb-1">email</label>
            <input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div>
            <label className="text-xs text-muted font-mono block mb-1">password</label>
            <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={6} />
          </div>
          <div>
            <label className="text-xs text-muted font-mono block mb-1">role</label>
            <select className="input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              <option value="member">member</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'creating...' : '→ create account'}
          </button>
        </form>

        <p className="text-center text-muted text-xs mt-4">
          have an account?{' '}
          <Link to="/login" className="text-accent hover:underline">sign in</Link>
        </p>
      </div>
    </div>
  )
}
