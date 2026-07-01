import { useState } from 'react'

import './App.css'
import ChatPanel from './components/ChatPanel'
import NotificationsTray from './components/NotificationsTray'
import { useAppContext } from './context/useAppContext'
import CuentasPage from './pages/CuentasPage'
import LoginPage from './pages/LoginPage'
import UsuariosPage from './pages/UsuariosPage'

/* ── Inline SVG icons ──────────────────────────────────── */
function IcoChats() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
  )
}
function IcoUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  )
}
function IcoClients() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
      <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05C16.19 13.87 17 15 17 16.5V19h6v-2.5C23 14.17 18.33 13 16 13z" />
    </svg>
  )
}
function IcoWithdraw() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
      <path d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9-1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-6v11c0 1.1-.9 2-2 2H4v-2h17V7h2z" />
    </svg>
  )
}
function IcoAccounts() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
      <path d="M4 10h3v7H4zm6.5 0h3v7h-3zM2 19h20v3H2zm15-9h3v7h-3zM12 1 2 6v2h20V6z" />
    </svg>
  )
}
function IcoAudit() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
    </svg>
  )
}
function IcoBell() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  )
}
function IcoSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

const NAV_TOP = [
  { id: 'chats', label: 'CHATS', Icon: IcoChats },
  { id: 'usuarios', label: 'USUARIOS', Icon: IcoUsers },
  { id: 'clientes', label: 'CLIENTES', Icon: IcoClients },
]
const NAV_FINANZAS = [
  { id: 'retiros', label: 'RETIROS', Icon: IcoWithdraw },
  { id: 'cuentas', label: 'CUENTAS', Icon: IcoAccounts },
  { id: 'auditoria', label: 'AUDITORÍA', Icon: IcoAudit },
]

function App() {
  const { connectionStatus, dismissNotification, notifications } =
    useAppContext()

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('beting-auth') === 'true',
  )
  const [authUser, setAuthUser] = useState(
    () => localStorage.getItem('beting-user') || 'Admin',
  )
  const [activeNav, setActiveNav] = useState('chats')

  const [socioId, setSocioId] = useState(
    () => localStorage.getItem('beting-socio-id') || '',
  )

  const handleLogin = (usuario) => {
    const displayName = usuario.nombre || usuario.correo || 'Admin'
    const sid = usuario.ID || ''
    localStorage.setItem('beting-auth', 'true')
    localStorage.setItem('beting-user', displayName)
    localStorage.setItem('beting-socio-id', sid)
    setIsAuthenticated(true)
    setAuthUser(displayName)
    setSocioId(sid)
  }

  const handleLogout = () => {
    localStorage.removeItem('beting-auth')
    localStorage.removeItem('beting-user')
    localStorage.removeItem('beting-socio-id')
    setIsAuthenticated(false)
    setSocioId('')
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="bp-app">
      {/* ── Narrow icon sidebar ─────────────────────── */}
      <aside className="bp-sidebar">
        <div className="bp-sidebar-logo">
          <div className="bp-logo-mark">B</div>
        </div>

        <nav className="bp-sidebar-nav" aria-label="Navegación principal">
          {NAV_TOP.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`bp-nav-item${activeNav === id ? ' active' : ''}`}
              onClick={() => setActiveNav(id)}
              title={label}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}

          <div className="bp-nav-section-label">FINANZAS</div>

          {NAV_FINANZAS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`bp-nav-item${activeNav === id ? ' active' : ''}`}
              onClick={() => setActiveNav(id)}
              title={label}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="bp-sidebar-bottom">
          <button
            className="bp-nav-item bp-nav-user"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <div className="bp-avatar-sm">{authUser[0]}</div>
            <span>MASTER</span>
          </button>
          <button className="bp-nav-item" title="Notificaciones">
            <IcoBell />
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────── */}
      <div className="bp-main">
        <header className="bp-header">
          <h1 className="bp-header-title">
            {activeNav === 'chats'
              ? 'Chats'
              : activeNav === 'cuentas'
              ? 'Cuentas Bancarias'
              : activeNav === 'usuarios'
              ? 'Usuarios'
              : activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}
          </h1>
          <div className="bp-header-right">
            <div className="bp-casino-search">
              <IcoSearch />
              <input
                className="bp-casino-input"
                placeholder="Buscar usuario casino..."
                aria-label="Buscar usuario casino"
              />
            </div>
            <button className="bp-header-icon-btn" title="Notificaciones">
              <IcoBell />
            </button>
            <div className="bp-header-user">
              <div className="bp-avatar-sm">{authUser[0]}</div>
              <span>{authUser}</span>
            </div>
          </div>
        </header>

        {activeNav === 'chats' ? (
          <ChatPanel
            authUser={authUser}
            connectionStatus={connectionStatus}
            socioId={socioId}
          />
        ) : activeNav === 'cuentas' ? (
          <CuentasPage />
        ) : activeNav === 'usuarios' ? (
          <UsuariosPage />
        ) : (
          <div className="bp-placeholder">
            <div className="bp-placeholder-icon">🚧</div>
            <p>
              Módulo <strong>{activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}</strong> en
              construcción
            </p>
          </div>
        )}
      </div>

      <NotificationsTray notifications={notifications} onDismiss={dismissNotification} />
    </div>
  )
}

export default App
