import { randomUUID } from 'node:crypto'

const SECTIONS_ALL = 'Todas'
const ROLES = ['master', 'admin']

const createStore = ({ alertLimit = 30, messageLimit = 60 } = {}) => {
  const state = {
    alerts: [
      {
        createdAt: new Date().toISOString(),
        id: randomUUID(),
        level: 'info',
        message: 'La aplicación está lista para recibir eventos en tiempo real.',
        title: 'Sistema iniciado',
      },
    ],
    hgcashConfig: {
      apiToken: '',
      autoVerifyDeposits: true,
      environment: 'production',
      webhookSecret: '',
    },
    messages: [
      {
        author: 'System',
        createdAt: new Date().toISOString(),
        id: randomUUID(),
        text: 'Bienvenido al canal interno de WebPlay.',
      },
    ],
    subscriptions: new Map(),
    users: [
      {
        createdAt: new Date().toISOString(),
        email: 'admin@drbeting.local',
        id: randomUUID(),
        nombre: 'Admin drbeting',
        rol: 'master',
        secciones: SECTIONS_ALL,
        estado: 'activo',
        usuario: 'admin',
      },
    ],
  }

  return {
    addAlert(input) {
      const alert = {
        createdAt: new Date().toISOString(),
        id: randomUUID(),
        level: input.level,
        message: input.message,
        title: input.title,
      }

      state.alerts = [alert, ...state.alerts].slice(0, alertLimit)
      return alert
    },
    addMessage(input) {
      const message = {
        author: input.author,
        createdAt: new Date().toISOString(),
        id: randomUUID(),
        text: input.text,
      }

      state.messages = [message, ...state.messages].slice(0, messageLimit)
      return message
    },
    getAlerts() {
      return state.alerts
    },
    getHgcashConfig() {
      return state.hgcashConfig
    },
    getMessages() {
      return state.messages
    },
    getSubscriptions() {
      return [...state.subscriptions.values()]
    },
    removeSubscription(endpoint) {
      state.subscriptions.delete(endpoint)
    },
    setHgcashConfig(input) {
      state.hgcashConfig = {
        apiToken: typeof input.apiToken === 'string' ? input.apiToken : state.hgcashConfig.apiToken,
        autoVerifyDeposits:
          typeof input.autoVerifyDeposits === 'boolean'
            ? input.autoVerifyDeposits
            : state.hgcashConfig.autoVerifyDeposits,
        environment:
          input.environment === 'production' || input.environment === 'sandbox'
            ? input.environment
            : state.hgcashConfig.environment,
        webhookSecret:
          typeof input.webhookSecret === 'string'
            ? input.webhookSecret
            : state.hgcashConfig.webhookSecret,
      }
      return state.hgcashConfig
    },
    upsertSubscription(subscription) {
      state.subscriptions.set(subscription.endpoint, subscription)
    },

    // ── Users ──────────────────────────────────────────────
    addUser(input) {
      if (state.users.some((u) => u.usuario === input.usuario)) {
        throw new Error('El nombre de usuario ya está en uso.')
      }
      if (input.email && state.users.some((u) => u.email === input.email)) {
        throw new Error('El email ya está en uso.')
      }
      const user = {
        createdAt: new Date().toISOString(),
        email: input.email ?? '',
        estado: input.estado === 'inactivo' ? 'inactivo' : 'activo',
        id: randomUUID(),
        nombre: input.nombre,
        rol: ROLES.includes(input.rol) ? input.rol : 'admin',
        secciones: input.secciones ?? SECTIONS_ALL,
        usuario: input.usuario,
      }
      state.users = [...state.users, user]
      return user
    },
    deleteUser(id) {
      const user = state.users.find((u) => u.id === id)
      if (!user) throw new Error('Usuario no encontrado.')
      state.users = state.users.filter((u) => u.id !== id)
      return user
    },
    getUsers() {
      return state.users
    },
    updateUser(id, input) {
      const index = state.users.findIndex((u) => u.id === id)
      if (index === -1) throw new Error('Usuario no encontrado.')
      const existing = state.users[index]
      if (
        input.usuario &&
        input.usuario !== existing.usuario &&
        state.users.some((u) => u.usuario === input.usuario)
      ) {
        throw new Error('El nombre de usuario ya está en uso.')
      }
      if (
        input.email &&
        input.email !== existing.email &&
        state.users.some((u) => u.email === input.email)
      ) {
        throw new Error('El email ya está en uso.')
      }
      const updated = {
        ...existing,
        email: typeof input.email === 'string' ? input.email : existing.email,
        estado:
          input.estado === 'activo' || input.estado === 'inactivo' ? input.estado : existing.estado,
        nombre: input.nombre ?? existing.nombre,
        rol: ROLES.includes(input.rol) ? input.rol : existing.rol,
        secciones: input.secciones ?? existing.secciones,
        usuario: input.usuario ?? existing.usuario,
      }
      state.users = [
        ...state.users.slice(0, index),
        updated,
        ...state.users.slice(index + 1),
      ]
      return updated
    },
  }
}

const store = createStore()

export { createStore, ROLES, store }
