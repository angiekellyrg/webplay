import { useCallback, useEffect, useRef, useState } from 'react'

import { api } from '../services/api'
import { formatTimestamp } from '../utils/time'

/* ── Helpers ───────────────────────────────────────────── */
function initial(name) {
  return (name || '?').charAt(0).toUpperCase()
}

function timeAgo(unixSeconds) {
  if (!unixSeconds) return ''
  const diff = Math.floor(Date.now() / 1000) - unixSeconds
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

/* ── Icons ─────────────────────────────────────────────── */
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
function IcoAttach() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  )
}
function IcoPdf() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
      <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z" />
    </svg>
  )
}

/* ── Message content renderer ──────────────────────────── */
function MsgContent({ msg }) {
  if (msg.tipo === 'imagen') {
    const src = msg.imagen || msg.mensaje
    return (
      <a href={src} target="_blank" rel="noopener noreferrer">
        <img
          src={src}
          alt="imagen enviada"
          style={{ maxWidth: '220px', maxHeight: '220px', borderRadius: '6px', display: 'block', cursor: 'pointer' }}
        />
      </a>
    )
  }
  if (msg.tipo === 'pdf') {
    const href = msg.imagen || msg.mensaje
    return (
      <a
        href={href}
        download="documento.pdf"
        style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'inherit', textDecoration: 'underline' }}
      >
        <IcoPdf />
        <span>{msg.mensaje || 'documento.pdf'}</span>
      </a>
    )
  }
  return <p>{msg.mensaje}</p>
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

/* ── Component ─────────────────────────────────────────── */
function ChatPanel({ authUser, connectionStatus, socioId }) {
  const [chats, setChats] = useState([])
  const [loadingChats, setLoadingChats] = useState(false)
  const [chatsError, setChatsError] = useState('')

  const [activeChat, setActiveChat] = useState(null)
  const [clienteInfo, setClienteInfo] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [messagesError, setMessagesError] = useState('')

  const [filter, setFilter] = useState('todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [manualMode, setManualMode] = useState(false)
  const [infoTab, setInfoTab] = useState('informacion')

  const [inputText, setInputText] = useState('')
  const [sendStatus, setSendStatus] = useState({ pending: false, error: '' })

  const feedRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)

  /* ── Fetch chat list ─────────────────────────────────── */
  const fetchChats = useCallback(async () => {
    if (!socioId) return
    setLoadingChats(true)
    setChatsError('')
    try {
      const data = await api.getChatList(socioId)
      const sorted = [...(data?.chats || [])].sort(
        (a, b) => b.fechaUltimoMensaje - a.fechaUltimoMensaje,
      )
      setChats(sorted)
    } catch (err) {
      setChatsError(err.message)
    }
    setLoadingChats(false)
  }, [socioId])

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  /* ── Select a chat → fetch history ──────────────────── */
  const handleSelectChat = async (chat) => {
    if (activeChat?.clienteId === chat.clienteId) return
    setActiveChat(chat)
    setClienteInfo(null)
    setMessages([])
    setMessagesError('')
    setLoadingMessages(true)
    try {
      const data = await api.getChatHistory(socioId, chat.clienteId)
      const sorted = [...(data?.mensajes || [])].sort((a, b) => a.fecha - b.fecha)
      setMessages(sorted)
      if (data?.cliente) setClienteInfo(data.cliente)
    } catch (err) {
      setMessagesError(err.message)
    }
    setLoadingMessages(false)
  }

  /* ── Scroll to bottom when messages change ───────────── */
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [messages.length, activeChat?.clienteId])

  /* ── Filter chat list ────────────────────────────────── */
  const visibleChats = chats.filter((c) => {
    if (filter === 'noleidos') return c.noLeidos > 0
    if (filter === 'archivados') return c.estado === 'ARCHIVADO'
    if (searchQuery && !c.nombre.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  /* ── Send text message ───────────────────────────────── */
  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputText.trim() || !activeChat || sendStatus.pending) return
    const texto = inputText.trim()
    setInputText('')
    setSendStatus({ pending: true, error: '' })
    const optimistic = { mensaje: texto, sender: 'SOCIO', fecha: Math.floor(Date.now() / 1000) }
    setMessages((prev) => [...prev, optimistic])
    try {
      await api.sendChatMessage(socioId, activeChat.clienteId, texto)
      setSendStatus({ pending: false, error: '' })
    } catch (err) {
      setSendStatus({ pending: false, error: err.message })
      setMessages((prev) => prev.filter((m) => m !== optimistic))
      setInputText(texto)
    }
  }

  /* ── Send file (image / pdf) ─────────────────────────── */
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !activeChat || sendStatus.pending) return
    // reset so same file can be re-selected
    e.target.value = ''

    const isImage = file.type.startsWith('image/')
    const isPdf = file.type === 'application/pdf'
    if (!isImage && !isPdf) {
      setSendStatus({ pending: false, error: 'Solo se permiten imágenes o archivos PDF.' })
      return
    }

    const tipo = isImage ? 'imagen' : 'pdf'

    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result // data:<mime>;base64,<data>
      setSendStatus({ pending: true, error: '' })
      const optimistic = {
        mensaje: file.name,
        tipo,
        imagen: base64,
        sender: 'SOCIO',
        fecha: Math.floor(Date.now() / 1000),
      }
      setMessages((prev) => [...prev, optimistic])
      try {
        await api.sendChatMessage(socioId, activeChat.clienteId, file.name, { tipo, imagen: base64 })
        setSendStatus({ pending: false, error: '' })
      } catch (err) {
        setSendStatus({ pending: false, error: err.message })
        setMessages((prev) => prev.filter((m) => m !== optimistic))
      }
    }
    reader.readAsDataURL(file)
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
          <button
            className="bp-refresh-btn"
            type="button"
            title="Actualizar"
            disabled={loadingChats}
            onClick={fetchChats}
          >
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
          {loadingChats && (
            <p className="bp-no-chats">Cargando conversaciones...</p>
          )}
          {!loadingChats && chatsError && (
            <p className="bp-no-chats" style={{ color: 'var(--bp-danger, #f87171)' }}>
              {chatsError}
            </p>
          )}
          {!loadingChats && !chatsError && visibleChats.map((chat) => (
            <button
              key={chat.clienteId}
              role="option"
              aria-selected={activeChat?.clienteId === chat.clienteId}
              className={`bp-chat-item${activeChat?.clienteId === chat.clienteId ? ' active' : ''}`}
              onClick={() => handleSelectChat(chat)}
            >
              <div className="bp-avatar">{initial(chat.nombre)}</div>
              <div className="bp-chat-item-body">
                <div className="bp-chat-item-top">
                  <span className="bp-chat-username">{chat.nombre}</span>
                  {chat.noLeidos > 0 && (
                    <span className="bp-tag bp-tag-green">{chat.noLeidos}</span>
                  )}
                  {chat.estado && chat.estado !== 'ACTIVO' && (
                    <span className="bp-tag bp-tag-blue">{chat.estado}</span>
                  )}
                </div>
                <p className="bp-chat-preview">{chat.ultimoMensaje}</p>
              </div>
              <span className="bp-chat-time">{timeAgo(chat.fechaUltimoMensaje)}</span>
            </button>
          ))}

          {!loadingChats && !chatsError && visibleChats.length === 0 && (
            <p className="bp-no-chats">
              No hay conversaciones{searchQuery ? ' con ese nombre' : ''}.
            </p>
          )}
        </div>
      </div>

      {/* ── Conversation area ──────────────────────────── */}
      <div className="bp-conv">
        {!activeChat ? (
          <EmptyState label="Selecciona un chat para comenzar" />
        ) : (
          <>
            {/* Conversation header */}
            <div className="bp-conv-header">
              <div className="bp-avatar">{initial(activeChat.nombre)}</div>
              <div className="bp-conv-user-info">
                <strong>{activeChat.nombre}</strong>
                <span className={`bp-online-dot bp-conn-${connectionStatus}`}>
                  {activeChat.estado === 'ACTIVO' ? 'Activo' : activeChat.estado}
                </span>
              </div>
              <div className="bp-conv-tags">
                <span className="bp-tag bp-tag-blue">{activeChat.clienteId}</span>
              </div>
            </div>

            {/* Messages */}
            <div className="bp-conv-feed" ref={feedRef} role="log" aria-live="polite">
              {loadingMessages && (
                <p style={{ textAlign: 'center', padding: '1rem', opacity: 0.6 }}>
                  Cargando mensajes...
                </p>
              )}
              {!loadingMessages && messagesError && (
                <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--bp-danger, #f87171)' }}>
                  {messagesError}
                </p>
              )}
              {!loadingMessages && messages.map((msg, idx) => {
                const isAdmin = msg.sender === 'SOCIO'
                const from = isAdmin ? 'admin' : 'user'
                return (
                  <div key={`${msg.fecha}-${idx}`} className={`bp-msg bp-msg-${from}`}>
                    {!isAdmin && (
                      <div className="bp-avatar bp-avatar-xs">{initial(activeChat.nombre)}</div>
                    )}
                    <div className="bp-msg-bubble">
                      <MsgContent msg={msg} />
                      <time dateTime={new Date(msg.fecha * 1000).toISOString()}>
                        {formatTimestamp(msg.fecha * 1000)}
                      </time>
                    </div>
                    {isAdmin && (
                      <div className="bp-avatar bp-avatar-xs bp-avatar-admin">
                        {initial(authUser || 'Admin')}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Composer */}
            <form className="bp-composer" onSubmit={handleSend}>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <button
                type="button"
                className="bp-composer-attach"
                title="Adjuntar imagen o PDF"
                disabled={sendStatus.pending}
                onClick={() => fileInputRef.current?.click()}
                aria-label="Adjuntar archivo"
              >
                <IcoAttach />
              </button>
              <input
                ref={inputRef}
                type="text"
                className="bp-composer-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Responder a ${activeChat.nombre}...`}
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
        {activeChat ? (
          <>
            {/* Tab bar */}
            <div className="bp-info-tabs" role="tablist">
              {[
                { id: 'informacion', label: 'INFORMACIÓN' },
                { id: 'pagos', label: 'PAGOS' },
                { id: 'casino', label: 'CASINO' },
                { id: 'fingerprint', label: 'FINGERPRINT' },
                { id: 'media', label: 'MEDIA' },
                { id: 'regalo', label: 'REGALO' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={infoTab === id}
                  className={`bp-info-tab${infoTab === id ? ' active' : ''}`}
                  onClick={() => setInfoTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* INFORMACIÓN tab content */}
            {infoTab === 'informacion' && (
              <div className="bp-info-content">
                <dl className="bp-info-dl">
                  <dt>USUARIO</dt>
                  <dd>{clienteInfo?.usuarioCasino || activeChat.nombre || '—'}</dd>
                  <dt>NOMBRE</dt>
                  <dd>{clienteInfo ? `${clienteInfo.nombre} ${clienteInfo.apellido}`.trim() : activeChat.nombre || '—'}</dd>
                  <dt>TELÉFONO</dt>
                  <dd>{clienteInfo?.telefono || '—'}</dd>
                  <dt>CUIL / CUIT</dt>
                  <dd className="bp-info-cuit">{clienteInfo?.cuit || '—'}</dd>
                  <dt>EMAIL</dt>
                  <dd>{clienteInfo?.email || '—'}</dd>
                  <dt>SALDO</dt>
                  <dd>{clienteInfo?.saldo != null ? clienteInfo.saldo : '—'}</dd>
                  <dt>SALDO COBRABLE</dt>
                  <dd>{clienteInfo?.saldoCobrable != null ? clienteInfo.saldoCobrable : '—'}</dd>
                  <dt>WAGER</dt>
                  <dd>{clienteInfo?.wager != null ? clienteInfo.wager : '—'}</dd>
                  <dt>ESTADO</dt>
                  <dd>{clienteInfo?.estado || activeChat.estado || '—'}</dd>
                  <dt>SOCIO ID</dt>
                  <dd>{clienteInfo?.socioId || socioId || '—'}</dd>
                  <dt>FECHA REGISTRO</dt>
                  <dd>{clienteInfo?.createdAt ? new Date(clienteInfo.createdAt * 1000).toLocaleString('es-AR') : '—'}</dd>
                </dl>
              </div>
            )}

            {/* Other tabs – placeholder */}
            {infoTab !== 'informacion' && (
              <p className="bp-info-placeholder">Sin datos disponibles.</p>
            )}
          </>
        ) : (
          <p className="bp-info-placeholder">Selecciona un chat para comenzar.</p>
        )}
      </div>
    </div>
  )
}

export default ChatPanel
