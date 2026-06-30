const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(
  /\/$/,
  '',
)

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

const api = {
  createAlert: (input) =>
    request('/api/alerts', {
      body: JSON.stringify(input),
      method: 'POST',
    }),
  getAlerts: () => request('/api/alerts'),
  getConfig: () => request('/api/config'),
  getHgcashConfig: () => request('/api/hgcash/config'),
  getMessages: () => request('/api/chat/messages'),
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
}

export { API_BASE_URL, api }
