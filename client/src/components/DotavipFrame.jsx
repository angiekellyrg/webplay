import { formatTimestamp } from '../utils/time'

function DotavipFrame({ url, active, iframe }) {
  return (
    <section className={`panel frame-panel ${active ? 'is-active' : 'is-hidden'}`}>
      <div className="panel-heading">
        <div>
          <h2>Vista principal</h2>
          <p>Integración embebida de {url.replace(/^https?:\/\//, '')}.</p>
        </div>
        <button type="button" className="secondary-button" onClick={iframe.reconnect}>
          Reconectar
        </button>
      </div>

      <div className={`frame-shell frame-${iframe.status}`}>
        <iframe
          key={iframe.frameKey}
          title="Dotavip"
          src={url}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="clipboard-read; clipboard-write"
          onLoad={iframe.onLoad}
          onError={iframe.onError}
        />

        <div className="frame-overlay">
          <strong>
            {iframe.status === 'ready'
              ? 'Contenido sincronizado'
              : iframe.status === 'error'
                ? 'No fue posible cargar el iframe'
                : 'Cargando experiencia principal'}
          </strong>
          <p>
            {iframe.status === 'ready'
              ? `Última carga correcta: ${formatTimestamp(iframe.lastLoadedAt)}`
              : iframe.error || 'Esperando la respuesta del sitio remoto.'}
          </p>
        </div>
      </div>
    </section>
  )
}

export default DotavipFrame
