import { useCallback, useEffect, useReducer, useRef, useState } from 'react'

import { api } from '../services/api'

// ── Constants ─────────────────────────────────────────────
const ESTADOS = ['Activo', 'Inactivo', 'VIP']

const EMPTY_FORM = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  usuarioCasino: '',
  cuit: '',
  saldo: 0,
  wager: 0,
  saldoCobrable: 0,
  estado: 'Activo',
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
function ClienteModal({ initial, onClose, onSave, title }) {
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
      <div className="ub-modal cb-modal-wide">
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
                placeholder="Ej. Mario"
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
                placeholder="Ej. Perez"
                value={form.apellido}
                onChange={set('apellido')}
              />
            </div>
            <div className="ub-field">
              <label className="ub-field-label">EMAIL</label>
              <input
                className="ub-input"
                type="email"
                maxLength={120}
                placeholder="Ej. mario@test.com"
                value={form.email}
                onChange={set('email')}
                autoComplete="off"
              />
            </div>
            <div className="ub-field">
              <label className="ub-field-label">TELÉFONO</label>
              <input
                className="ub-input"
                maxLength={30}
                placeholder="Ej. 999999999"
                value={form.telefono}
                onChange={set('telefono')}
              />
            </div>
            <div className="ub-field">
              <label className="ub-field-label">USUARIO CASINO</label>
              <input
                className="ub-input"
                required
                maxLength={60}
                placeholder="Ej. mario032746"
                value={form.usuarioCasino}
                onChange={set('usuarioCasino')}
                autoComplete="off"
              />
            </div>
            <div className="ub-field">
              <label className="ub-field-label">CUIT</label>
              <input
                className="ub-input"
                maxLength={20}
                placeholder="Ej. 12345678"
                value={form.cuit}
                onChange={set('cuit')}
              />
            </div>
            <div className="ub-field">
              <label className="ub-field-label">SALDO</label>
              <input
                className="ub-input"
                type="number"
                min="0"
                step="0.01"
                value={form.saldo}
                onChange={set('saldo')}
              />
            </div>
            <div className="ub-field">
              <label className="ub-field-label">WAGER</label>
              <input
                className="ub-input"
                type="number"
                min="0"
                step="0.01"
                value={form.wager}
                onChange={set('wager')}
              />
            </div>
            <div className="ub-field">
              <label className="ub-field-label">SALDO COBRABLE</label>
              <input
                className="ub-input"
                type="number"
                min="0"
                step="0.01"
                value={form.saldoCobrable}
                onChange={set('saldoCobrable')}
              />
            </div>
            <div className="ub-field">
              <label className="ub-field-label">ESTADO</label>
              <select className="ub-select" value={form.estado} onChange={set('estado')}>
                {ESTADOS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
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

// ── Reducer ───────────────────────────────────────────────
function clientesReducer(state, action) {
  switch (action.type) {
    case 'SET': return action.clientes
    case 'ADD': return [action.cliente, ...state]
    default: return state
  }
}

// ── Helpers ───────────────────────────────────────────────
function fmtMoney(value) {
  const n = Number(value || 0)
  return n === 0 ? '$0' : `$${n.toLocaleString('es-AR')}`
}

function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString('es-AR', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function estadoBadgeClass(estado) {
  switch ((estado || '').toLowerCase()) {
    case 'activo': return 'cb-badge-activo'
    case 'vip': return 'cb-badge-vip'
    default: return 'cb-badge-inactivo'
  }
}

// ── Main page ─────────────────────────────────────────────
function ClientesPage({ socioId }) {
  const [clientes, dispatch] = useReducer(clientesReducer, [])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const importRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getClientes(socioId)
      dispatch({ type: 'SET', clientes: data.usuarios || [] })
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [socioId])

  useEffect(() => { load() }, [load])

  const handleCreate = async (form) => {
    const data = await api.createCliente(socioId, {
      ...form,
      saldo: Number(form.saldo),
      wager: Number(form.wager),
      saldoCobrable: Number(form.saldoCobrable),
    })
    dispatch({ type: 'ADD', cliente: data.cliente })
  }

  const handleDownloadCSV = () => {
    const headers = ['clienteId', 'nombre', 'apellido', 'usuarioCasino', 'cuit', 'telefono', 'email', 'saldo', 'wager', 'saldoCobrable', 'estado']
    const rows = clientes.map((c) =>
      headers.map((h) => JSON.stringify(c[h] ?? '')).join(','),
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'clientes.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const visible = clientes.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (c.nombre || '').toLowerCase().includes(q) ||
      (c.apellido || '').toLowerCase().includes(q) ||
      (c.usuarioCasino || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.cuit || '').toLowerCase().includes(q)
    )
  })

  const total = clientes.length
  const activos = clientes.filter((c) => c.estado === 'Activo').length
  const vip = clientes.filter((c) => c.estado === 'VIP').length
  const referidos = clientes.filter((c) => c.referidoPor).length

  return (
    <div className="ub-page">
      {/* Stats */}
      <div className="bp-stat-grid">
        <div className="bp-stat-card">
          <span className="bp-stat-label">Total Clientes</span>
          <span className="bp-stat-value">{total}</span>
        </div>
        <div className="bp-stat-card">
          <span className="bp-stat-label">Activos</span>
          <span className="bp-stat-value">{activos}</span>
        </div>
        <div className="bp-stat-card">
          <span className="bp-stat-label">VIP</span>
          <span className="bp-stat-value">{vip}</span>
        </div>
        <div className="bp-stat-card">
          <span className="bp-stat-label">Referidos</span>
          <span className="bp-stat-value">{referidos}</span>
        </div>
      </div>

      {/* Table section */}
      <div className="ub-section">
        <div className="ub-section-header cb-clientes-header">
          <input
            className="ub-search-input"
            placeholder="Buscar usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar usuario"
          />
          <span className="cb-section-label">Listado de Clientes</span>
          <div className="ub-section-actions">
            <button className="cb-btn-csv cb-btn-csv-download" onClick={handleDownloadCSV}>
              ⬇ Descargar CSV
            </button>
            <button
              className="cb-btn-csv cb-btn-csv-import"
              onClick={() => importRef.current?.click()}
            >
              ⬆ Importar CSV
            </button>
            <input ref={importRef} type="file" accept=".csv" className="cb-hidden-input" />
            <button className="ub-btn-gold" onClick={() => setModal({ mode: 'create' })}>
              + Nuevo Cliente
            </button>
          </div>
        </div>

        <div className="ub-table-wrap">
          {loading ? (
            <p className="ub-empty">Cargando...</p>
          ) : visible.length === 0 ? (
            <p className="ub-empty">No hay clientes que coincidan.</p>
          ) : (
            <table className="ub-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NOMBRE</th>
                  <th>USUARIO CASINO</th>
                  <th>CUIT</th>
                  <th>TELEFONO</th>
                  <th>SALDO</th>
                  <th>WAGER</th>
                  <th>ESTADO</th>
                  <th>REFERIDO POR</th>
                  <th>DISPOSITIVOS</th>
                  <th>PUSH</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((c, idx) => {
                  const rowId = total - idx
                  const isExpanded = expandedId === c.clienteId
                  return (
                    <>
                      <tr
                        key={c.clienteId}
                        className="cb-row"
                        onClick={() => setExpandedId(isExpanded ? null : c.clienteId)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="ub-td-num">{rowId}</td>
                        <td>
                          {[c.nombre, c.apellido].filter(Boolean).join(' ') || c.usuarioCasino}
                        </td>
                        <td>{c.usuarioCasino || '—'}</td>
                        <td className="cb-cuit">{c.cuit || '—'}</td>
                        <td>{c.telefono || '—'}</td>
                        <td>{fmtMoney(c.saldo)}</td>
                        <td>{fmtMoney(c.wager)}</td>
                        <td>
                          <span className={`ub-badge ${estadoBadgeClass(c.estado)}`}>
                            {c.estado || '—'}
                          </span>
                        </td>
                        <td>{c.referidoPor || '—'}</td>
                        <td>—</td>
                        <td>—</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="cb-actions">
                            <button
                              className="ub-btn-edit"
                              onClick={() => setModal({ mode: 'edit', cliente: c })}
                            >
                              Editar
                            </button>
                            <button className="cb-btn-delete" disabled>
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${c.clienteId}-detail`} className="cb-detail-row">
                          <td colSpan={12}>
                            <div className="cb-detail-grid">
                              <div className="cb-detail-cell">
                                <span className="cb-detail-label">FINGERPRINT</span>
                                <span className="cb-detail-value cb-detail-mono">—</span>
                              </div>
                              <div className="cb-detail-cell">
                                <span className="cb-detail-label">IP</span>
                                <span className="cb-detail-value">—</span>
                              </div>
                              <div className="cb-detail-cell cb-detail-wide">
                                <span className="cb-detail-label">USER AGENT</span>
                                <span className="cb-detail-value">—</span>
                              </div>
                              <div className="cb-detail-cell">
                                <span className="cb-detail-label">PRIMERA VEZ</span>
                                <span className="cb-detail-value">{fmtDate(c.createdAt)}</span>
                              </div>
                              <div className="cb-detail-cell">
                                <span className="cb-detail-label">ÚLTIMA VEZ</span>
                                <span className="cb-detail-value">{fmtDate(c.updatedAt)}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal?.mode === 'create' && (
        <ClienteModal
          title="Nuevo Cliente"
          initial={EMPTY_FORM}
          onSave={handleCreate}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.mode === 'edit' && (
        <ClienteModal
          title="Editar Cliente"
          initial={modal.cliente}
          onSave={async () => {
            setModal(null)
          }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

export default ClientesPage
