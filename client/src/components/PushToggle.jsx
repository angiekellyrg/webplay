function PushToggle({ pushState, onEnable, onDisable }) {
  const isReady = pushState.supported && pushState.permission === 'granted'

  return (
    <div className="panel compact-panel">
      <div className="panel-heading">
        <div>
          <h2>Notificaciones Push</h2>
          <p>Activa avisos del navegador para alertas y mensajes.</p>
        </div>
        <span className={`status-badge status-${pushState.subscribed ? 'connected' : 'neutral'}`}>
          {pushState.subscribed ? 'Activadas' : 'Inactivas'}
        </span>
      </div>

      <div className="stack">
        <p className="helper-text">
          {pushState.supported
            ? isReady
              ? 'El navegador está listo para recibir notificaciones.'
              : 'Solicita permiso y registra la suscripción desde esta pantalla.'
            : 'Tu navegador actual no soporta Push API.'}
        </p>

        {pushState.error ? <p className="error-text">{pushState.error}</p> : null}

        <div className="button-row">
          <button
            type="button"
            className="primary-button"
            disabled={pushState.pending || !pushState.supported || pushState.subscribed}
            onClick={onEnable}
          >
            {pushState.pending ? 'Procesando…' : 'Activar'}
          </button>
          <button
            type="button"
            className="secondary-button"
            disabled={pushState.pending || !pushState.subscribed}
            onClick={onDisable}
          >
            Desactivar
          </button>
        </div>
      </div>
    </div>
  )
}

export default PushToggle
