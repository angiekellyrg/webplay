import { useCallback, useEffect, useReducer, useRef, useState } from 'react'

import { api } from '../services/api'

const ROLES = [
  { value: 'master', label: 'Master' },
  { value: 'admin', label: 'Admin' },
  { value: 'usuario', label: 'Usuario' },
]

const ESTADOS = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
]

const PERMISO_KEYS = [
  'chats',
  'usuarios',
  'clientes',
  'retiros',
  'comandos',
  'mensajes',
  'apis',
  'cuentas',
  'auditoria',
  'notificaciones',
  'pushAuto',
  'eventos',
  'bonos',
  'metricas',
  'ajustes',
]

const PERMISOS_DEFAULT = {
  chats: true,
  usuarios: true,
  clientes: true,
  retiros: false,
  comandos: false,
  mensajes: true,
  apis: false,
  cuentas: false,
  auditoria: false,
  notificaciones: true,
  pushAuto: false,
  eventos: false,
  bonos: false,
  metricas: false,
  ajustes: false,
}

const EMPTY_FORM = {
  apellido: '',
  contrasena: '',
  correo: '',
  estatus: 'active',
  fin: '',
  inicio: '',
  nombre: '',
  permisos: { ...PERMISOS_DEFAULT },
  restriccion: '',
  rol: 'admin',
  usuario: '',
}

function permissionsForRole(rol, permisos) {
  if (rol === 'master') {
    return PERMISO_KEYS.reduce((acc, key) => ({ ...acc, [key]: true }), {})
  }
  return PERMISO_KEYS.reduce((acc, key) => ({ ...acc, [key]: Boolean(permisos?.[key]) }), {})
}

function rolLabel(rol) {
  if (rol === 'master') return 'Master'
  if (rol === 'admin') return 'Admin'
  return 'Usuario'
}

function estadoLabel(estado) {
  return estado === 'active' ? 'Activo' : 'Inactivo'
}

function estadoClass(estado) {
  return estado === 'active' ? 'activo' : 'inactivo'
}

function IcoClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function UserModal({ onClose, onSave, title }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const firstRef = useRef(null)

  useEffect(() => {
    firstRef.current?.focus()
  }, [])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const setPermiso = (key) => (e) =>
    setForm((f) => ({ ...f, permisos: { ...f.permisos, [key]: e.target.checked } }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onSave({
        ...form,
        fin: form.fin || null,
        inicio: form.inicio || null,
        permisos: permissionsForRole(form.rol, form.permisos),
      })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ub-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="ub-modal ub-modal-wide">
        <div className="ub-modal-header">
          <h2 className="ub-modal-title">{title}</h2>
          <button className="ub-modal-close" onClick={onClose} title="Cerrar">
            <IcoClose />
          </button>
        </div>

        <form className="ub-modal-body" onSubmit={handleSubmit}>
          <div className="ub-form-grid">
            <div className="ub-field">
              <label className="ub-field-label">NOMBRE</label>
              <input
                ref={firstRef}
                className="ub-input"
                required
                maxLength={80}
                value={form.nombre}
                onChange={set('nombre')}
              />
            </div>
            <div className="ub-field">
              <label className="ub-field-label">APELLIDO</label>
              <input
                className="ub-input"
                required
                maxLength={80}
                value={form.apellido}
                onChange={set('apellido')}
              />
            </div>
            <div className="ub-field">
              <label className="ub-field-label">USUARIO</label>
              <input
                className="ub-input"
                required
                maxLength={40}
                value={form.usuario}
                onChange={set('usuario')}
                autoComplete="off"
              />
            </div>
            <div className="ub-field">
              <label className="ub-field-label">CORREO</label>
              <input
                className="ub-input"
                type="email"
                required
                maxLength={120}
                value={form.correo}
                onChange={set('correo')}
                autoComplete="off"
              />
            </div>
            <div className="ub-field">
              <label className="ub-field-label">CONTRASEÑA</label>
              <input
                className="ub-input"
                type="password"
                required
                maxLength={120}
                value={form.contrasena}
                onChange={set('contrasena')}
                autoComplete="new-password"
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
              <select className="ub-select" value={form.estatus} onChange={set('estatus')}>
                {ESTADOS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="ub-field">
              <label className="ub-field-label">RESTRICCIÓN</label>
              <input
                className="ub-input"
                maxLength={120}
                value={form.restriccion}
                onChange={set('restriccion')}
              />
            </div>
          </div>

          <div className="ub-field ub-field-full">
            <label className="ub-field-label">PERMISOS</label>
            {form.rol === 'master' ? (
              <p className="ub-help-text">Master envía todas las secciones activas por defecto.</p>
            ) : (
              <div className="ub-permisos-grid">
                {PERMISO_KEYS.map((key) => (
                  <label className="ub-perm-item" key={key}>
                    <input
                      checked={Boolean(form.permisos[key])}
                      onChange={setPermiso(key)}
                      type="checkbox"
                    />
                    <span>{key}</span>
                  </label>
                ))}
              </div>
            )}
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

function normalizeUser(user, index) {
  return {
    ...user,
    apellido: user.apellido || '',
    correo: user.correo || user.email || '',
    estatus: user.estatus === 'inactive' ? 'inactive' : 'active',
    id: user.id || `${user.usuario || user.correo || 'u'}-${index}`,
    nombre: user.nombre || '',
    rol: user.rol || 'usuario',
    usuario: user.usuario || '',
  }
}

function usersReducer(state, action) {
  switch (action.type) {
    case 'SET': return action.users
    case 'ADD': return [action.user, ...state]
    default: return state
  }
}

function UsuariosPage({ socioId }) {
  const [users, dispatch] = useReducer(usersReducer, [])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    if (!socioId) {
      dispatch({ type: 'SET', users: [] })
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = await api.getPanelUsers(socioId)
      const normalized = (data.usuarios || [])
        .map(normalizeUser)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      dispatch({ type: 'SET', users: normalized })
    } catch {
      dispatch({ type: 'SET', users: [] })
    } finally {
      setLoading(false)
    }
  }, [socioId])

  useEffect(() => { load() }, [load])

  const handleCreate = async (form) => {
    if (!socioId) {
      throw new Error('No se encontró ID del socio.')
    }
    await api.createPanelUser(socioId, form)
    await load()
  }

  const visible = users.filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      `${u.nombre} ${u.apellido}`.toLowerCase().includes(q) ||
      u.usuario.toLowerCase().includes(q) ||
      u.correo.toLowerCase().includes(q)
    )
  })

  const total = users.length
  const activos = users.filter((u) => u.estatus === 'active').length
  const masters = users.filter((u) => u.rol === 'master').length
  const admins = users.filter((u) => u.rol === 'admin').length

  return (
    <div className="ub-page">
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
            <button className="ub-btn-gold" onClick={() => setModal({ mode: 'create' })}>
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
                  <th>CORREO</th>
                  <th>ROL</th>
                  <th>ESTADO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((user, idx) => (
                  <tr key={user.id}>
                    <td className="ub-td-num">{idx + 1}</td>
                    <td>{`${user.nombre} ${user.apellido}`.trim() || '—'}</td>
                    <td>{user.usuario || '—'}</td>
                    <td className="ub-td-email">{user.correo || '—'}</td>
                    <td>
                      <span className={`ub-badge ub-badge-${user.rol}`}>
                        {rolLabel(user.rol)}
                      </span>
                    </td>
                    <td>
                      <span className={`ub-badge ub-badge-estado-${estadoClass(user.estatus)}`}>
                        {estadoLabel(user.estatus)}
                      </span>
                    </td>
                    <td>
                      <button className="ub-btn-edit" disabled>
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

      {modal?.mode === 'create' && (
        <UserModal
          title="Nuevo Usuario"
          onSave={handleCreate}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

export default UsuariosPage
