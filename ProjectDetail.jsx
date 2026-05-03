import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { format, isPast, parseISO } from 'date-fns'

const STATUS_CYCLE = { todo: 'in_progress', in_progress: 'done', done: 'todo' }

function TaskModal({ projectId, users, onClose, onSaved, initial }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    status: initial?.status || 'todo',
    priority: initial?.priority || 'medium',
    due_date: initial?.due_date ? initial.due_date.slice(0, 16) : '',
    assignee_id: initial?.assignee_id || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, assignee_id: form.assignee_id || null, due_date: form.due_date || null }
    try {
      if (initial) {
        await axios.put(`/tasks/${initial.id}`, payload)
      } else {
        await axios.post(`/projects/${projectId}/tasks`, payload)
      }
      onSaved()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="font-display font-semibold mb-4">{initial ? 'edit task' : 'new task'}</h2>
        <form onSubmit={submit} className="space-y-3">
          {error && <div className="text-danger text-xs font-mono">{error}</div>}
          <div>
            <label className="text-xs text-muted block mb-1">title</label>
            <input className="input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Implement feature X" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">description</label>
            <textarea className="input h-20 resize-none" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted block mb-1">status</label>
              <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option value="todo">todo</option>
                <option value="in_progress">in_progress</option>
                <option value="done">done</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted block mb-1">due date</label>
              <input type="datetime-local" className="input" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">assignee</label>
              <select className="input" value={form.assignee_id} onChange={e => setForm(p => ({ ...p, assignee_id: e.target.value }))}>
                <option value="">unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
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

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [taskModal, setTaskModal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchAll = async () => {
    try {
      const [proj, taskList] = await Promise.all([
        axios.get(`/projects/${id}`),
        axios.get(`/projects/${id}/tasks`),
      ])
      setProject(proj.data)
      setTasks(taskList.data)
      if (user?.role === 'admin') {
        const usersRes = await axios.get('/users')
        setAllUsers(usersRes.data)
      } else {
        setAllUsers(proj.data.members || [])
      }
    } catch {
      navigate('/projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [id])

  const toggleStatus = async (task) => {
    const nextStatus = STATUS_CYCLE[task.status]
    await axios.put(`/tasks/${task.id}`, { status: nextStatus })
    fetchAll()
  }

  const deleteTask = async (taskId) => {
    if (!confirm('Delete task?')) return
    await axios.delete(`/tasks/${taskId}`)
    fetchAll()
  }

  const addMember = async (userId) => {
    await axios.post(`/projects/${id}/members`, { user_id: parseInt(userId) })
    fetchAll()
  }

  const removeMember = async (userId) => {
    await axios.delete(`/projects/${id}/members/${userId}`)
    fetchAll()
  }

  if (loading) return <div className="text-muted text-sm">loading...</div>
  if (!project) return null

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

  const isOverdue = (task) =>
    task.due_date && isPast(new Date(task.due_date)) && task.status !== 'done'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button className="text-muted text-xs font-mono hover:text-accent mb-2 block" onClick={() => navigate('/projects')}>← projects</button>
          <h1 className="font-display text-2xl font-bold">{project.name}</h1>
          {project.description && <p className="text-muted text-sm mt-1">{project.description}</p>}
        </div>
        {user?.role === 'admin' && (
          <button className="btn-primary" onClick={() => setTaskModal('create')}>+ task</button>
        )}
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs font-mono">
        {['all', 'todo', 'in_progress', 'done'].map(s => {
          const count = s === 'all' ? tasks.length : tasks.filter(t => t.status === s).length
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded border transition-colors ${
                filter === s ? 'border-accent text-accent' : 'border-border text-muted hover:border-slate-500'
              }`}
            >
              {s} ({count})
            </button>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.length === 0 && (
            <div className="card text-center py-8 text-muted text-sm">no tasks</div>
          )}
          {filtered.map(task => (
            <div
              key={task.id}
              className={`card group transition-colors ${isOverdue(task) ? 'border-danger/30' : 'hover:border-accent/30'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`font-mono text-sm ${task.status === 'done' ? 'line-through text-muted' : 'text-slate-100'}`}>
                      {task.title}
                    </span>
                    {isOverdue(task) && <span className="text-danger text-xs font-mono">OVERDUE</span>}
                  </div>
                  {task.description && <p className="text-muted text-xs mb-2 line-clamp-2">{task.description}</p>}
                  <div className="flex gap-2 flex-wrap">
                    <span className={`badge-${task.status}`}>{task.status}</span>
                    <span className={`badge-${task.priority}`}>{task.priority}</span>
                    {task.assignee && <span className="text-xs text-muted font-mono">→ {task.assignee.name}</span>}
                    {task.due_date && (
                      <span className={`text-xs font-mono ${isOverdue(task) ? 'text-danger' : 'text-muted'}`}>
                        due {format(new Date(task.due_date), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    className="text-xs text-muted hover:text-accent font-mono transition-colors"
                    onClick={() => toggleStatus(task)}
                    title="cycle status"
                  >
                    ↻
                  </button>
                  {user?.role === 'admin' && (
                    <>
                      <button className="text-xs text-muted hover:text-accent opacity-0 group-hover:opacity-100 transition-all" onClick={() => setTaskModal(task)}>edit</button>
                      <button className="text-xs text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all" onClick={() => deleteTask(task.id)}>del</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Members panel (admin only) */}
        {user?.role === 'admin' && (
          <div className="card space-y-4 self-start">
            <h3 className="font-display font-semibold text-sm">members ({project.members?.length ?? 0})</h3>
            <div className="space-y-2">
              {(project.members || []).map(m => (
                <div key={m.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-300">{m.name}</div>
                    <div className="text-xs text-muted font-mono">{m.role}</div>
                  </div>
                  <button className="text-xs text-muted hover:text-danger" onClick={() => removeMember(m.id)}>remove</button>
                </div>
              ))}
            </div>
            {/* Add member */}
            <div>
              <label className="text-xs text-muted block mb-1">add member</label>
              <select className="input text-xs" onChange={e => { if (e.target.value) { addMember(e.target.value); e.target.value = '' } }} defaultValue="">
                <option value="" disabled>select user...</option>
                {allUsers
                  .filter(u => !project.members?.find(m => m.id === u.id))
                  .map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)
                }
              </select>
            </div>
          </div>
        )}
      </div>

      {taskModal && (
        <TaskModal
          projectId={id}
          users={allUsers}
          initial={taskModal === 'create' ? null : taskModal}
          onClose={() => setTaskModal(null)}
          onSaved={() => { setTaskModal(null); fetchAll() }}
        />
      )}
    </div>
  )
}
