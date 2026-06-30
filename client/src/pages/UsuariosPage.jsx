import { useCallback, useEffect, useReducer, useRef, useState } from 'react'

import { api } from '../services/api'

// ── Helpers ───────────────────────────────────────────────
const ROLES = [
  { value: 'master', label: 'Master' },
  { value: 'admin', label: 'Admin' },
]

const ESTADOS = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
]

const EMPTY_FORM = {
  email: '',
  estado: 'activo',
  nombre: '',
  rol: 'admin',
  secciones: 'Todas',
  usuario: '',
}

function rolLabel(rol) {
  return rol === 'master' ? 'Master' : 'Admin'
}

function estadoLabel(estado) {
  return estado === 'activo' ? 'Activo' : 'Inactivo'
}

// ── Icons ─────────────────────────────────────────────────
function IcoClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

// ── Modal ─────────────────────────────────────────────────
function UserModal({ initial, onClose, onSave, title }) {
  const [form, setForm] = useState(() => ({ ...EMPTY_FORM, ...initial }))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const firstRef = useRef(null)

  useEffect(() => {
    firstRef.current?.focus()
  }, [])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onSave(form)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ub-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="ub-modal">
        <div className="ub-modal-header">
          <h2 className="ub-modal-title">{title}</h2>
          <button className="ub-modal-close" onClick={onClose} title="Cerrar">
            <IcoClose />
          </button>
        </div>

        <form className="ub-modal-body" onSubmit={handleSubmit}>
          <div className="ub-form-grid">
            <div className="ub-field">
              <label className="ub-field-label">NOMBRE COMPLETO</label>
              <input
                ref={firstRef}
                className="ub-input"
                required
                maxLength={80}
                placeholder="Ej. Admin drbeting"
                value={form.nombre}
                onChange={set('nombre')}
              />
            </div>
            <div className="ub-field">
              <label className="ub-field-label">USUARIO</label>
              <input
                className="ub-input"
                required
                maxLength={40}
                placeholder="Ej. admin"
                value={form.usuario}
                onChange={set('usuario')}
                autoComplete="off"
              />
            </div>
            <div className="ub-field ub-field-full">
              <label className="ub-field-label">EMAIL</label>
              <input
                className="ub-input"
                type="email"
                maxLength={120}
                placeholder="Ej. admin@casino.local"
                value={form.email}
                onChange={set('email')}
                autoComplete="off"
              />
            </div>
            <div className="ub-field">
              <label className="ub-field-label">ROL</label>
              <select className="ub-select" value={form.rol} onChange={set('rol')}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="ub-field">
              <label className="ub-field-label">ESTADO</label>
              <select className="ub-select" value={form.estado} onChange={set('estado')}>
                {ESTADOS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="ub-field ub-field-full">
              <label className="ub-field-label">SECCIONES</label>
              <input
                className="ub-input"
                maxLength={120}
                placeholder="Todas"
                value={form.secciones}
                onChange={set('secciones')}
              />
            </div>
          </div>

          {error && <p className="ub-form-error">{error}</p>}

          <div className="ub-modal-actions">
            <button type="button" className="ub-btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="ub-btn-gold" disabled={loading}>
              {loading ? <span className="bp-spinner" /> : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────
function usersReducer(state, action) {
  switch (action.type) {
    case 'SET': return action.users
    case 'ADD': return [...state, action.user]
    case 'UPDATE': return state.map((u) => (u.id === action.user.id ? action.user : u))
    default: return state
  }
}

function UsuariosPage() {
  const [users, dispatch] = useReducer(usersReducer, [])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | { mode: 'create' } | { mode: 'edit', user }
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getUsers()
      dispatch({ type: 'SET', users: data.users })
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async (form) => {
    const data = await api.createUser(form)
    dispatch({ type: 'ADD', user: data.user })
  }

  const handleUpdate = async (form) => {
    const data = await api.updateUser(modal.user.id, form)
    dispatch({ type: 'UPDATE', user: data.user })
  }

  const visible = users.filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.nombre.toLowerCase().includes(q) ||
      u.usuario.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    )
  })

  const total = users.length
  const activos = users.filter((u) => u.estado === 'activo').length
  const masters = users.filter((u) => u.rol === 'master').length
  const admins = users.filter((u) => u.rol === 'admin').length

  return (
    <div className="ub-page">
      {/* Stats */}
      <div className="bp-stat-grid">
        <div className="bp-stat-card">
          <span className="bp-stat-label">Total Usuarios</span>
          <span className="bp-stat-value">{total}</span>
        </div>
        <div className="bp-stat-card">
          <span className="bp-stat-label">Activos</span>
          <span className="bp-stat-value">{activos}</span>
        </div>
        <div className="bp-stat-card">
          <span className="bp-stat-label">Masters</span>
          <span className="bp-stat-value">{masters}</span>
        </div>
        <div className="bp-stat-card">
          <span className="bp-stat-label">Admins</span>
          <span className="bp-stat-value">{admins}</span>
        </div>
      </div>

      {/* Table section */}
      <div className="ub-section">
        <div className="ub-section-header">
          <h2 className="ub-section-title">Listado de Usuarios</h2>
          <div className="ub-section-actions">
            <input
              className="ub-search-input"
              placeholder="Buscar usuario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar usuario"
            />
            <button
              className="ub-btn-gold"
              onClick={() => setModal({ mode: 'create' })}
            >
              + Nuevo Usuario
            </button>
          </div>
        </div>

        <div className="ub-table-wrap">
          {loading ? (
            <p className="ub-empty">Cargando...</p>
          ) : visible.length === 0 ? (
            <p className="ub-empty">No hay usuarios que coincidan.</p>
          ) : (
            <table className="ub-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>NOMBRE</th>
                  <th>USUARIO</th>
                  <th>EMAIL</th>
                  <th>ROL</th>
                  <th>SECCIONES</th>
                  <th>ESTADO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((user, idx) => (
                  <tr key={user.id}>
                    <td className="ub-td-num">{idx + 1}</td>
                    <td>{user.nombre}</td>
                    <td>{user.usuario}</td>
                    <td className="ub-td-email">{user.email || '—'}</td>
                    <td>
                      <span className={`ub-badge ub-badge-${user.rol}`}>
                        {rolLabel(user.rol)}
                      </span>
                    </td>
                    <td>{user.secciones}</td>
                    <td>
                      <span className={`ub-badge ub-badge-estado-${user.estado}`}>
                        {estadoLabel(user.estado)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="ub-btn-edit"
                        onClick={() => setModal({ mode: 'edit', user })}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal?.mode === 'create' && (
        <UserModal
          title="Nuevo Usuario"
          initial={EMPTY_FORM}
          onSave={handleCreate}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.mode === 'edit' && (
        <UserModal
          title="Editar Usuario"
          initial={modal.user}
          onSave={handleUpdate}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

export default UsuariosPage
