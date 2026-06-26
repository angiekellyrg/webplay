import { useEffect, useRef, useState } from 'react'

import { formatTimestamp } from '../utils/time'

const CHANNELS = [
  { id: 'general', label: 'general' },
  { id: 'operaciones', label: 'operaciones' },
  { id: 'soporte', label: 'soporte' },
  { id: 'trading', label: 'trading' },
  { id: 'riesgos', label: 'riesgos' },
]

const ONLINE_USERS = [
  { name: 'Admin', status: 'online' },
  { name: 'María López', status: 'online' },
  { name: 'Carlos Ruiz', status: 'away' },
  { name: 'Ana Torres', status: 'online' },
  { name: 'Pedro Sánchez', status: 'offline' },
]

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function ChatPanel({ messages, connectionStatus, displayName, onSubmit }) {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState({ pending: false, error: '' })
  const [activeChannel, setActiveChannel] = useState('general')
  const feedRef = useRef(null)
  const textareaRef = useRef(null)

  const channelMessages = activeChannel === 'general' ? messages : []

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [messages, activeChannel])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!message.trim() || activeChannel !== 'general') return
    setStatus({ pending: true, error: '' })

    try {
      await onSubmit({ author: displayName, text: message })
      setMessage('')
      setStatus({ pending: false, error: '' })
      textareaRef.current?.focus()
    } catch (error) {
      setStatus({ pending: false, error: error.message })
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  return (
    <div className="chat-layout panel">
      {/* Sidebar */}
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <span className="chat-org-name">Beting Pro</span>
          <span className={`chat-conn-dot chat-conn-${connectionStatus}`} />
        </div>

        <div className="chat-section">
          <div className="chat-section-title">Canales</div>
          <ul className="chat-channel-list">
            {CHANNELS.map((ch) => (
              <li key={ch.id}>
                <button
                  className={`chat-channel-item${activeChannel === ch.id ? ' active' : ''}`}
                  onClick={() => setActiveChannel(ch.id)}
                >
                  <span className="ch-hash">#</span>
                  {ch.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="chat-section">
          <div className="chat-section-title">Usuarios</div>
          <ul className="chat-user-list">
            {ONLINE_USERS.map((user) => (
              <li key={user.name} className="chat-user-item">
                <div className="chat-user-avatar-wrap">
                  <div className="chat-user-avatar">{getInitials(user.name)}</div>
                  <span className={`presence-dot presence-${user.status}`} />
                </div>
                <span className="chat-user-name">{user.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main area */}
      <div className="chat-main">
        <div className="chat-main-header">
          <div className="chat-main-title">
            <span className="ch-hash">#</span>
            <strong>{activeChannel}</strong>
            <span className="chat-main-desc">Canal interno de comunicación del equipo</span>
          </div>
          <span className={`status-badge status-${connectionStatus}`}>
            {connectionStatus === 'connected' ? 'Conectado' : 'Reconectando'}
          </span>
        </div>

        <div className="chat-feed" ref={feedRef} role="log" aria-live="polite">
          {channelMessages.length === 0 ? (
            <div className="chat-empty">
              <p className="ch-hash-big">#</p>
              <p>
                Bienvenido a <strong>#{activeChannel}</strong>
              </p>
              <p className="chat-empty-sub">Este es el inicio del canal. Sé el primero en escribir.</p>
            </div>
          ) : (
            channelMessages.map((entry) => (
              <article key={entry.id} className="chat-message">
                <div className="msg-avatar">{getInitials(entry.author)}</div>
                <div className="msg-body">
                  <div className="chat-message-header">
                    <strong>{entry.author}</strong>
                    <time dateTime={entry.createdAt}>{formatTimestamp(entry.createdAt)}</time>
                  </div>
                  <p>{entry.text}</p>
                </div>
              </article>
            ))
          )}
        </div>

        <form className="chat-composer" onSubmit={handleSubmit}>
          <div className="chat-input-row">
            <textarea
              ref={textareaRef}
              required
              rows={2}
              maxLength={240}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                activeChannel === 'general'
                  ? `Mensaje en #${activeChannel}`
                  : `#${activeChannel} es de solo lectura en esta vista`
              }
              disabled={activeChannel !== 'general' || status.pending}
              className="chat-textarea"
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={status.pending || !message.trim() || activeChannel !== 'general'}
              aria-label="Enviar mensaje"
            >
              {status.pending ? (
                <span className="chat-send-spinner" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
          {status.error ? <p className="error-text">{status.error}</p> : null}
          <p className="chat-hint">
            Enviando como <strong>{displayName}</strong> · Enter para enviar · Shift+Enter para nueva línea
          </p>
        </form>
      </div>
    </div>
  )
}

export default ChatPanel
