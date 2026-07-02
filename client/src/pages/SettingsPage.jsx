import { useState } from 'react'

import { useAppContext } from '../context/useAppContext'

function SettingsPage() {
  const { profile, pushState, runtimeConfig, updateProfile } = useAppContext()
  const [displayName, setDisplayName] = useState(profile.displayName)

  const handleSubmit = (event) => {
    event.preventDefault()
    updateProfile({
      displayName: displayName.trim() || profile.displayName,
    })
  }

  return (
    <div className="page-grid">
      <form className="panel form-panel" onSubmit={handleSubmit}>
        <div className="panel-heading">
          <div>
            <h2>Preferencias</h2>
            <p>Configura la identidad usada por el chat interno.</p>
          </div>
        </div>

        <label className="field">
          <span>Nombre visible</span>
          <input
            required
            maxLength={40}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Tu alias para el chat"
          />
        </label>

        <button type="submit" className="primary-button">
          Guardar
        </button>
      </form>

      <section className="panel stack">
        <div className="panel-heading">
          <div>
            <h2>Runtime</h2>
            <p>Variables y servicios activos en el entorno actual.</p>
          </div>
        </div>

        <dl className="definition-list">
          <div>
            <dt>Push suscrito</dt>
            <dd>{pushState.subscribed ? 'Sí' : 'No'}</dd>
          </div>
          <div>
            <dt>Permiso del navegador</dt>
            <dd>{pushState.permission}</dd>
          </div>
          <div>
            <dt>Dotavip URL</dt>
            <dd>{runtimeConfig.dotavipUrl}</dd>
          </div>
          <div>
            <dt>VAPID disponible</dt>
            <dd>{runtimeConfig.pushPublicKey ? 'Sí' : 'Generada en arranque si no se define'}</dd>
          </div>
        </dl>
      </section>
    </div>
  )
}

export default SettingsPage
