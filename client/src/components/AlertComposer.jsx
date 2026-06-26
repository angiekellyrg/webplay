import { useState } from 'react'

const initialForm = {
  title: '',
  message: '',
  level: 'info',
}

function AlertComposer({ onSubmit }) {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState({ pending: false, error: '' })

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ pending: true, error: '' })

    try {
      await onSubmit(form)
      setForm(initialForm)
      setStatus({ pending: false, error: '' })
    } catch (error) {
      setStatus({
        pending: false,
        error: error.message,
      })
    }
  }

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div className="panel-heading">
        <div>
          <h2>Crear alerta</h2>
          <p>Envía avisos en tiempo real al resto de la aplicación.</p>
        </div>
      </div>

      <label className="field">
        <span>Título</span>
        <input
          required
          maxLength={80}
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Incidencia, despliegue, aviso..."
        />
      </label>

      <label className="field">
        <span>Mensaje</span>
        <textarea
          required
          rows={4}
          maxLength={220}
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Describe el evento que debe ver el equipo."
        />
      </label>

      <label className="field">
        <span>Prioridad</span>
        <select name="level" value={form.level} onChange={handleChange}>
          <option value="info">Informativa</option>
          <option value="warning">Advertencia</option>
          <option value="critical">Crítica</option>
        </select>
      </label>

      {status.error ? <p className="error-text">{status.error}</p> : null}

      <button type="submit" className="primary-button" disabled={status.pending}>
        {status.pending ? 'Enviando…' : 'Publicar alerta'}
      </button>
    </form>
  )
}

export default AlertComposer
