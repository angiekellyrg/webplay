const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'https://vrtt7h3co2.execute-api.us-east-2.amazonaws.com'
).replace(/\/$/, '')

const CHAT_API_BASE = 'https://17iwi3fpi4.execute-api.us-east-2.amazonaws.com'

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await response.json() : null

  if (!response.ok) {
    throw new Error(payload?.message || 'La solicitud no pudo completarse.')
  }

  return payload
}

const chatRequest = async (path, body) => {
  const response = await fetch(`${CHAT_API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  let payload = null
  try {
    payload = await response.json()
  } catch {
    // response body is not JSON
  }

  if (!response.ok) {
    throw new Error(payload?.message || 'La solicitud no pudo completarse.')
  }

  return payload
}

const api = {
  createAlert: (input) =>
    request('/api/alerts', {
      body: JSON.stringify(input),
      method: 'POST',
    }),
  createUser: (input) =>
    request('/api/users', {
      body: JSON.stringify(input),
      method: 'POST',
    }),
  getAlerts: () => request('/api/alerts'),
  getConfig: () => request('/api/config'),
  getChatList: (socioId) =>
    chatRequest('/chat/list', { op: 'buscar', socioId }),
  getChatHistory: (socioId, clienteId) =>
    chatRequest('/chat/history', { op: 'buscarhistorialid', socioId, clienteId }),
  sendChatMessage: (socioId, clienteId, mensaje, extraFields = {}) =>
    chatRequest('/chat/send', { socioId, clienteId, mensaje, sender: 'SOCIO', ...extraFields }),
  getHgcashConfig: () => request('/api/hgcash/config'),
  getMessages: () => request('/api/chat/messages'),
  sendMessage: (input) =>
    request('/api/chat/messages', {
      body: JSON.stringify(input),
      method: 'POST',
    }),
  getUsers: () => request('/api/users'),
  saveHgcashConfig: (input) =>
    request('/api/hgcash/config', {
      body: JSON.stringify(input),
      method: 'POST',
    }),
  subscribeToPush: (subscription) =>
    request('/api/push/subscribe', {
      body: JSON.stringify({ subscription }),
      method: 'POST',
    }),
  testHgcashConnection: () =>
    request('/api/hgcash/test', { method: 'POST' }),
  unsubscribeFromPush: (endpoint) =>
    request('/api/push/unsubscribe', {
      body: JSON.stringify({ endpoint }),
      method: 'POST',
    }),
  updateUser: (id, input) =>
    request(`/api/users/${id}`, {
      body: JSON.stringify(input),
      method: 'PUT',
    }),
}

export { API_BASE_URL, api }
