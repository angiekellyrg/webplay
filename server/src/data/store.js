import { randomUUID } from 'node:crypto'

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
  }
}

const store = createStore()

export { createStore, store }
