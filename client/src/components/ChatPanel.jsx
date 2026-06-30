import { useEffect, useRef, useState } from 'react'

import { formatTimestamp } from '../utils/time'

/* ── Mock data ─────────────────────────────────────────── */
const MOCK_CHATS = [
  {
    id: 'c1',
    username: 'rio012234',
    lastMessage: '✅ ¡Fichas cargadas! Se acreditaron $2,000 en t...',
    timeAgo: '2d',
    tags: [],
    messages: [
      { id: 'c1m1', from: 'user', text: 'Hola, buen día. Realicé una transferencia hace un rato, ¿ya se acreditó?', ts: '2024-06-24T09:55:00Z' },
      { id: 'c1m2', from: 'admin', text: '✅ ¡Fichas cargadas! Se acreditaron $2,000 en tu cuenta. ¡Cualquier consulta estamos a disposición!', ts: '2024-06-24T10:02:00Z' },
    ],
  },
  {
    id: 'c2',
    username: 'mario032746',
    lastMessage: '¡Hola mario032746! 👋 Bienvenido a Dr.Beting...',
    timeAgo: '2d',
    tags: [],
    messages: [
      { id: 'c2m1', from: 'user', text: '¿Cómo me registro en la plataforma?', ts: '2024-06-24T08:10:00Z' },
      { id: 'c2m2', from: 'admin', text: '¡Hola mario032746! 👋 Bienvenido a Dr.Beting. Para registrarte, solo haz clic en el botón de registro y completa tus datos.', ts: '2024-06-24T08:12:00Z' },
    ],
  },
  {
    id: 'c3',
    username: 'Jona183230',
    lastMessage: 'Buenas, damos bonos del 100 % de lunes a viern...',
    timeAgo: '2d',
    tags: ['Soporte', 'Finalizar'],
    messages: [
      { id: 'c3m1', from: 'user', text: '¿Tienen bonos disponibles?', ts: '2024-06-24T11:00:00Z' },
      { id: 'c3m2', from: 'admin', text: 'Buenas, damos bonos del 100 % de lunes a viernes para depósitos desde $1.000.', ts: '2024-06-24T11:03:00Z' },
    ],
  },
  {
    id: 'c4',
    username: 'maximiliano062558',
    lastMessage: 'su contraseña es privada, por lo tanto en eso no...',
    timeAgo: '3d',
    tags: ['Soporte', 'Finalizar'],
    messages: [
      { id: 'c4m1', from: 'user', text: 'Olvidé mi contraseña, ¿me la pueden dar?', ts: '2024-06-23T14:20:00Z' },
      { id: 'c4m2', from: 'admin', text: 'su contraseña es privada, por lo tanto en eso no podemos ayudarte. Por favor usa la opción de recuperar contraseña.', ts: '2024-06-23T14:22:00Z' },
    ],
  },
  {
    id: 'c5',
    username: 'damian091031',
    lastMessage: '¿me pasa el link por este medio?',
    timeAgo: '6d',
    tags: ['Soporte', 'Finalizar'],
    messages: [
      { id: 'c5m1', from: 'user', text: '¿me pasa el link por este medio?', ts: '2024-06-20T16:45:00Z' },
      { id: 'c5m2', from: 'admin', text: 'Claro, el link de acceso es: https://drbeting.com. ¡Cualquier consulta, estamos aquí!', ts: '2024-06-20T16:47:00Z' },
    ],
  },
  {
    id: 'c6',
    username: 'olgadelasmercedes023932',
    lastMessage: 'buenas tardes el comprobante no corresponde ...',
    timeAgo: '7d',
    tags: [],
    messages: [
      { id: 'c6m1', from: 'user', text: 'buenas tardes el comprobante no corresponde al monto que envié', ts: '2024-06-19T17:00:00Z' },
      { id: 'c6m2', from: 'admin', text: 'Buenas tardes. Estamos verificando el comprobante. Te respondemos en breve.', ts: '2024-06-19T17:05:00Z' },
    ],
  },
  {
    id: 'c7',
    username: 'chiri174703',
    lastMessage: 'Hola buenas tardes pudo solucionar su inconven...',
    timeAgo: '7d',
    tags: [],
    messages: [
      { id: 'c7m1', from: 'user', text: 'Hola, no puedo ingresar a mi cuenta', ts: '2024-06-19T15:30:00Z' },
      { id: 'c7m2', from: 'admin', text: 'Hola buenas tardes. ¿Pudo solucionar su inconveniente? Quedamos a disposición.', ts: '2024-06-19T15:35:00Z' },
    ],
  },
  {
    id: 'c8',
    username: 'Marcelo202605',
    lastMessage: '¡Hola Marcelo202605! CBU: 000015150003240...',
    timeAgo: '10d',
    tags: ['Carga', 'Finalizar'],
    messages: [
      { id: 'c8m1', from: 'user', text: '¿Cuál es el CBU para transferir?', ts: '2024-06-16T10:00:00Z' },
      { id: 'c8m2', from: 'admin', text: '¡Hola Marcelo202605! CBU: 0000151500032440 - Alias: DRBETING.ARG. ¡Cualquier consulta, estamos aquí!', ts: '2024-06-16T10:02:00Z' },
    ],
  },
]

const TAG_CLASS = { Soporte: 'bp-tag-blue', Finalizar: 'bp-tag-blue', Carga: 'bp-tag-green' }

function initial(name) {
  return (name || '?').charAt(0).toUpperCase()
}

function IcoRefresh() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true">
      <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
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
function IcoSend() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function EmptyState({ label }) {
  return (
    <div className="bp-empty-state">
      <div className="bp-empty-bubble">
        <svg viewBox="0 0 24 24" fill="currentColor" width="56" height="56" aria-hidden="true">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      </div>
      <p className="bp-empty-label">{label}</p>
    </div>
  )
}

function ChatPanel({ authUser, connectionStatus, displayName, messages: wsMessages, onSubmit }) {
  const [activeChatId, setActiveChatId] = useState(null)
  const [filter, setFilter] = useState('todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [manualMode, setManualMode] = useState(false)
  const [inputText, setInputText] = useState('')
  const [sendStatus, setSendStatus] = useState({ pending: false, error: '' })
  const feedRef = useRef(null)
  const inputRef = useRef(null)

  const activeChatData = MOCK_CHATS.find((c) => c.id === activeChatId) ?? null

  // Merge mock messages with real-time WebSocket messages for the active chat
  const liveMessages = activeChatData
    ? [
        ...activeChatData.messages,
        ...wsMessages.map((m) => ({
          id: `ws-${m.id}`,
          from: m.author === (authUser || displayName) ? 'admin' : 'user',
          text: m.text,
          ts: m.createdAt,
        })),
      ]
    : []

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [liveMessages.length, activeChatId])

  const visibleChats = MOCK_CHATS.filter((c) => {
    if (filter !== 'todos') return false
    if (searchQuery && !c.username.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputText.trim()) return
    setSendStatus({ pending: true, error: '' })
    try {
      await onSubmit({ author: authUser || displayName, text: inputText })
      setInputText('')
      setSendStatus({ pending: false, error: '' })
      inputRef.current?.focus()
    } catch (err) {
      setSendStatus({ pending: false, error: err.message })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  return (
    <div className="bp-chat">

      {/* ── Chat list ─────────────────────────────────── */}
      <div className="bp-chat-list">

        {/* Manual toggle + refresh */}
        <div className="bp-list-controls">
          <label className="bp-toggle" htmlFor="manual-toggle">
            <input
              id="manual-toggle"
              type="checkbox"
              checked={manualMode}
              onChange={() => setManualMode((v) => !v)}
            />
            <span className="bp-toggle-track" />
            <span className="bp-toggle-label">Manual</span>
          </label>
          <button className="bp-refresh-btn" type="button" title="Actualizar">
            <IcoRefresh />
          </button>
        </div>

        {/* Search */}
        <div className="bp-list-search">
          <IcoSearch />
          <input
            className="bp-list-search-input"
            placeholder="Buscar un chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Buscar chat"
          />
        </div>

        {/* Filter tabs */}
        <div className="bp-filter-tabs" role="tablist">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'noleidos', label: 'No leídos' },
            { id: 'archivados', label: 'Archivados' },
          ].map(({ id, label }) => (
            <button
              key={id}
              role="tab"
              aria-selected={filter === id}
              className={`bp-filter-tab${filter === id ? ' active' : ''}`}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Chat items */}
        <div className="bp-chat-items" role="listbox" aria-label="Conversaciones">
          {visibleChats.map((chat) => (
            <button
              key={chat.id}
              role="option"
              aria-selected={activeChatId === chat.id}
              className={`bp-chat-item${activeChatId === chat.id ? ' active' : ''}`}
              onClick={() => setActiveChatId(chat.id)}
            >
              <div className="bp-avatar">{initial(chat.username)}</div>
              <div className="bp-chat-item-body">
                <div className="bp-chat-item-top">
                  <span className="bp-chat-username">{chat.username}</span>
                  {chat.tags.map((tag) => (
                    <span key={tag} className={`bp-tag ${TAG_CLASS[tag] ?? 'bp-tag-blue'}`}>
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="bp-chat-preview">{chat.lastMessage}</p>
              </div>
              <span className="bp-chat-time">{chat.timeAgo}</span>
            </button>
          ))}

          {visibleChats.length === 0 && (
            <p className="bp-no-chats">No hay conversaciones{searchQuery ? ' con ese nombre' : ''}.</p>
          )}
        </div>
      </div>

      {/* ── Conversation area ──────────────────────────── */}
      <div className="bp-conv">
        {!activeChatData ? (
          <EmptyState label="Selecciona un chat para comenzar" />
        ) : (
          <>
            {/* Conversation header */}
            <div className="bp-conv-header">
              <div className="bp-avatar">{initial(activeChatData.username)}</div>
              <div className="bp-conv-user-info">
                <strong>{activeChatData.username}</strong>
                <span className={`bp-online-dot bp-conn-${connectionStatus}`}>
                  {connectionStatus === 'connected' ? 'En línea' : 'Desconectado'}
                </span>
              </div>
              <div className="bp-conv-tags">
                {activeChatData.tags.map((tag) => (
                  <span key={tag} className={`bp-tag ${TAG_CLASS[tag] ?? 'bp-tag-blue'}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="bp-conv-feed" ref={feedRef} role="log" aria-live="polite">
              {liveMessages.map((msg) => (
                <div key={msg.id} className={`bp-msg bp-msg-${msg.from}`}>
                  {msg.from === 'user' && (
                    <div className="bp-avatar bp-avatar-xs">{initial(activeChatData.username)}</div>
                  )}
                  <div className="bp-msg-bubble">
                    <p>{msg.text}</p>
                    <time dateTime={msg.ts}>{formatTimestamp(msg.ts)}</time>
                  </div>
                  {msg.from === 'admin' && (
                    <div className="bp-avatar bp-avatar-xs bp-avatar-admin">
                      {initial(authUser || 'Admin')}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Composer */}
            <form className="bp-composer" onSubmit={handleSend}>
              <input
                ref={inputRef}
                type="text"
                className="bp-composer-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Responder a ${activeChatData.username}...`}
                disabled={sendStatus.pending}
                maxLength={240}
              />
              <button
                type="submit"
                className="bp-composer-send"
                disabled={sendStatus.pending || !inputText.trim()}
                aria-label="Enviar"
              >
                {sendStatus.pending ? <span className="bp-spinner" /> : <IcoSend />}
              </button>
            </form>
            {sendStatus.error && <p className="bp-conv-error">{sendStatus.error}</p>}
          </>
        )}
      </div>

      {/* ── Right info panel ──────────────────────────── */}
      <div className="bp-info-panel">
        {activeChatData ? (
          <div className="bp-info-content">
            <div className="bp-info-avatar">{initial(activeChatData.username)}</div>
            <strong className="bp-info-name">{activeChatData.username}</strong>
            <div className="bp-info-tags">
              {activeChatData.tags.map((tag) => (
                <span key={tag} className={`bp-tag ${TAG_CLASS[tag] ?? 'bp-tag-blue'}`}>
                  {tag}
                </span>
              ))}
            </div>
            <dl className="bp-info-dl">
              <dt>Estado</dt>
              <dd>{connectionStatus === 'connected' ? 'En línea' : 'Desconectado'}</dd>
              <dt>Canal</dt>
              <dd>Soporte</dd>
            </dl>
          </div>
        ) : (
          <p className="bp-info-placeholder">Selecciona un chat para comenzar.</p>
        )}
      </div>
    </div>
  )
}

export default ChatPanel
