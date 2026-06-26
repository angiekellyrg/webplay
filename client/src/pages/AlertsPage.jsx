import AlertComposer from '../components/AlertComposer'
import StatusBadge from '../components/StatusBadge'
import { useAppContext } from '../context/useAppContext'
import { formatTimestamp } from '../utils/time'

function AlertsPage() {
  const { alerts, createAlert } = useAppContext()

  return (
    <div className="page-grid">
      <AlertComposer onSubmit={createAlert} />

      <section className="panel stack">
        <div className="panel-heading">
          <div>
            <h2>Historial de alertas</h2>
            <p>Eventos sincronizados por socket y listos para Push.</p>
          </div>
        </div>

        <div className="timeline">
          {alerts.map((alert) => (
            <article key={alert.id} className="timeline-item">
              <div className="timeline-item-header">
                <h3>{alert.title}</h3>
                <StatusBadge tone={alert.level}>{alert.level}</StatusBadge>
              </div>
              <p>{alert.message}</p>
              <time dateTime={alert.createdAt}>{formatTimestamp(alert.createdAt)}</time>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AlertsPage
