import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

function ProjectModal({ onClose, onSaved, initial }) {
  const [form, setForm] = useState({ name: initial?.name || '', description: initial?.description || '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (initial) {
        await axios.put(`/projects/${initial.id}`, form)
      } else {
        await axios.post('/projects', form)
      }
      onSaved()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="font-display font-semibold mb-4">{initial ? 'edit project' : 'new project'}</h2>
        <form onSubmit={submit} className="space-y-3">
          {error && <div className="text-danger text-xs font-mono">{error}</div>}
          <div>
            <label className="text-xs text-muted block mb-1">name</label>
            <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Project Alpha" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">description</label>
            <textarea className="input h-20 resize-none" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What's this project about?" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'saving...' : 'save'}</button>
            <button type="button" className="btn-ghost" onClick={onClose}>cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | project obj

  const fetch = () => {
    axios.get('/projects').then(r => setProjects(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const deleteProject = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return
    await axios.delete(`/projects/${id}`)
    fetch()
  }

  if (loading) return <div className="text-muted text-sm">loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">projects</h1>
          <p className="text-muted text-xs font-mono mt-0.5">{projects.length} total</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn-primary" onClick={() => setModal('create')}>+ new project</button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card text-center py-12 text-muted text-sm">
          no projects yet{user?.role === 'admin' ? ' — create one above' : ''}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <div key={p.id} className="card hover:border-accent/40 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <Link to={`/projects/${p.id}`} className="font-display font-semibold text-slate-100 hover:text-accent transition-colors">
                  {p.name}
                </Link>
                {user?.role === 'admin' && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-muted hover:text-accent text-xs" onClick={() => setModal(p)}>edit</button>
                    <button className="text-muted hover:text-danger text-xs" onClick={() => deleteProject(p.id)}>del</button>
                  </div>
                )}
              </div>
              {p.description && <p className="text-muted text-xs mb-4 line-clamp-2">{p.description}</p>}
              <div className="flex items-center justify-between text-xs text-muted font-mono">
                <span>{p.task_count ?? 0} tasks</span>
                <span>{p.members?.length ?? 0} members</span>
              </div>
              <div className="text-xs text-muted font-mono mt-1">owner: {p.owner?.name}</div>
            </div>
          ))}
        </div>
      )}

      {(modal === 'create' || (modal && modal.id)) && (
        <ProjectModal
          initial={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetch() }}
        />
      )}
    </div>
  )
}
