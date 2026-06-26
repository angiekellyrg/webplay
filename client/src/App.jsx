import { NavLink, Route, Routes, useLocation } from 'react-router-dom'

import './App.css'
import DotavipFrame from './components/DotavipFrame'
import NotificationsTray from './components/NotificationsTray'
import StatusBadge from './components/StatusBadge'
import { useAppContext } from './context/useAppContext'
import { useIframeStatus } from './hooks/useIframeStatus'
import { useRouteTracker } from './hooks/useRouteTracker'
import AlertsPage from './pages/AlertsPage'
import ChatPage from './pages/ChatPage'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/SettingsPage'

function App() {
  const { connectionStatus, dismissNotification, notifications, recordRoute, runtimeConfig } =
    useAppContext()
  const location = useLocation()
  const iframeStatus = useIframeStatus(runtimeConfig.dotavipUrl)

  useRouteTracker(recordRoute)

  const navigation = [
    { label: 'Inicio', path: '/' },
    { label: 'Alertas', path: '/alerts' },
    { label: 'Chat', path: '/chat' },
    { label: 'Ajustes', path: '/settings' },
  ]

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">WebPlay</p>
          <h1>SPA operativa con PWA, Push y tiempo real</h1>
        </div>
        <StatusBadge tone={connectionStatus}>
          {connectionStatus === 'connected' ? 'Socket activo' : 'Sincronizando'}
        </StatusBadge>
      </header>

      <nav className="navigation" aria-label="Navegación principal">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className={`app-layout ${location.pathname === '/' ? 'home-active' : 'home-hidden'}`}>
        <DotavipFrame active={location.pathname === '/'} iframe={iframeStatus} url={runtimeConfig.dotavipUrl} />

        <section className="content-panel">
          <Routes>
            <Route path="/" element={<HomePage iframeStatus={iframeStatus} />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </section>
      </main>

      <NotificationsTray notifications={notifications} onDismiss={dismissNotification} />
    </div>
  )
}

export default App
