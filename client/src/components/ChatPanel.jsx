import { useState } from 'react'

import { formatTimestamp } from '../utils/time'

function ChatPanel({ messages, connectionStatus, displayName, onSubmit }) {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState({ pending: false, error: '' })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ pending: true, error: '' })

    try {
      await onSubmit({
        author: displayName,
        text: message,
      })
      setMessage('')
      setStatus({ pending: false, error: '' })
    } catch (error) {
      setStatus({
        pending: false,
        error: error.message,
      })
    }
  }

  return (
    <div className="panel stack">
      <div className="panel-heading">
        <div>
          <h2>Chat interno</h2>
          <p>Mensajería ligera con entrega inmediata por WebSocket.</p>
        </div>
        <span className={`status-badge status-${connectionStatus}`}>
          {connectionStatus === 'connected' ? 'Conectado' : 'Reconectando'}
        </span>
      </div>

      <div className="chat-feed" role="log" aria-live="polite">
        {messages.map((entry) => (
          <article key={entry.id} className="chat-message">
            <div className="chat-message-header">
              <strong>{entry.author}</strong>
              <time dateTime={entry.createdAt}>{formatTimestamp(entry.createdAt)}</time>
            </div>
            <p>{entry.text}</p>
          </article>
        ))}
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <div className="field">
          <span>Mensaje como {displayName}</span>
          <textarea
            required
            rows={3}
            maxLength={240}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Escribe un mensaje para el equipo."
          />
        </div>
        {status.error ? <p className="error-text">{status.error}</p> : null}
        <button type="submit" className="primary-button" disabled={status.pending}>
          {status.pending ? 'Enviando…' : 'Enviar mensaje'}
        </button>
      </form>
    </div>
  )
}

export default ChatPanel
