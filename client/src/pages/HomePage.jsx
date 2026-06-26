import PushToggle from '../components/PushToggle'
import StatusBadge from '../components/StatusBadge'
import { useAppContext } from '../context/useAppContext'
import { formatTimestamp } from '../utils/time'

function HomePage({ iframeStatus }) {
  const { alerts, connectionStatus, messages, pushState, routeHistory, runtimeConfig } =
    useAppContext()

  return (
    <div className="page-grid">
      <section className="panel stack">
        <div className="panel-heading">
          <div>
            <h2>Resumen operativo</h2>
            <p>Estado de la SPA, del iframe y del canal en tiempo real.</p>
          </div>
          <StatusBadge tone={connectionStatus}>
            {connectionStatus === 'connected' ? 'Tiempo real activo' : 'Reintentando conexión'}
          </StatusBadge>
        </div>

        <div className="metric-grid">
          <article className="metric-card">
            <span>Alertas</span>
            <strong>{alerts.length}</strong>
          </article>
          <article className="metric-card">
            <span>Mensajes</span>
            <strong>{messages.length}</strong>
          </article>
          <article className="metric-card">
            <span>Iframe</span>
            <strong>{iframeStatus.status}</strong>
          </article>
        </div>

        <div className="info-card">
          <strong>Navegación SPA</strong>
          <p>La aplicación conserva el estado sin recargas y registra los cambios de ruta.</p>
          <ul className="route-list">
            {routeHistory.map((route) => (
              <li key={route.path}>
                <span>{route.path}</span>
                <time dateTime={route.visitedAt}>{formatTimestamp(route.visitedAt)}</time>
              </li>
            ))}
          </ul>
        </div>

        <div className="info-card">
          <strong>Origen integrado</strong>
          <p>{runtimeConfig.dotavipUrl}</p>
        </div>
      </section>

      <PushToggle
        pushState={pushState}
        onDisable={pushState.disable}
        onEnable={pushState.enable}
      />
    </div>
  )
}

export default HomePage
