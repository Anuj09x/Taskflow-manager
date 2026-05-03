import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="text-accent font-display font-bold text-3xl">TaskFlow</div>
          <div className="text-muted text-sm font-mono mt-1">// sign in to your workspace</div>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="text-danger text-xs font-mono border border-danger/30 bg-danger/10 rounded px-3 py-2">
              error: {error}
            </div>
          )}
          <div>
            <label className="text-xs text-muted font-mono block mb-1">email</label>
            <input
              className="input"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-xs text-muted font-mono block mb-1">password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'signing in...' : '→ sign in'}
          </button>
        </form>

        <p className="text-center text-muted text-xs mt-4">
          no account?{' '}
          <Link to="/signup" className="text-accent hover:underline">sign up</Link>
        </p>
      </div>
    </div>
  )
}
