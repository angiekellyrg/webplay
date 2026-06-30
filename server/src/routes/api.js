import { Router } from 'express'

import { getAccount, getBaseUrl } from '../services/hgcash.js'
import { requireText } from '../utils/validate.js'

const VALID_ROLES = ['master', 'admin']

const createApiRouter = ({ config, io, pushToSubscribers, store }) => {
  const router = Router()

  router.get('/health', (_request, response) => {
    response.json({
      ok: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
    })
  })

  router.get('/config', (_request, response) => {
    response.json({
      dotavipUrl: config.dotavipUrl,
      pushPublicKey: config.vapidPublicKey,
    })
  })

  router.get('/alerts', (_request, response) => {
    response.json({
      alerts: store.getAlerts(),
    })
  })

  router.get('/chat/messages', (_request, response) => {
    response.json({
      messages: store.getMessages(),
    })
  })

  router.post('/alerts', async (request, response, next) => {
    try {
      const alert = store.addAlert({
        level: ['info', 'warning', 'critical'].includes(request.body.level)
          ? request.body.level
          : 'info',
        message: requireText(request.body.message, 'El mensaje', 220),
        title: requireText(request.body.title, 'El título', 80),
      })

      io.emit('alert:new', alert)
      await pushToSubscribers({
        body: alert.message,
        data: { url: '/alerts' },
        tag: `alert-${alert.id}`,
        title: alert.title,
      })

      response.status(201).json({ alert })
    } catch (error) {
      next(error)
    }
  })

  router.post('/push/subscribe', (request, response, next) => {
    try {
      const subscription = request.body.subscription

      if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
        throw new Error('La suscripción Push no es válida.')
      }

      store.upsertSubscription(subscription)
      response.status(201).json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  router.post('/push/unsubscribe', (request, response, next) => {
    try {
      const endpoint = requireText(request.body.endpoint, 'El endpoint', 500)
      store.removeSubscription(endpoint)
      response.json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  // ── HG Cash ──────────────────────────────────────────────

  router.get('/hgcash/config', (_request, response) => {
    const cfg = store.getHgcashConfig()
    const mask = (token) =>
      token && token.length > 8
        ? token.slice(0, 6) + '...' + token.slice(-4)
        : token
        ? '****'
        : ''
    response.json({
      apiToken: mask(cfg.apiToken),
      apiTokenSet: Boolean(cfg.apiToken),
      autoVerifyDeposits: cfg.autoVerifyDeposits,
      environment: cfg.environment,
      webhookSecretSet: Boolean(cfg.webhookSecret),
    })
  })

  router.post('/hgcash/config', (request, response, next) => {
    try {
      const body = request.body ?? {}
      const updated = store.setHgcashConfig({
        apiToken:
          typeof body.apiToken === 'string' && body.apiToken !== ''
            ? body.apiToken
            : store.getHgcashConfig().apiToken,
        autoVerifyDeposits: body.autoVerifyDeposits,
        environment: body.environment,
        webhookSecret:
          typeof body.webhookSecret === 'string' && body.webhookSecret !== ''
            ? body.webhookSecret
            : store.getHgcashConfig().webhookSecret,
      })
      response.json({ ok: true, environment: updated.environment })
    } catch (error) {
      next(error)
    }
  })

  router.post('/hgcash/test', async (_request, response, next) => {
    try {
      const cfg = store.getHgcashConfig()
      if (!cfg.apiToken) {
        return response.status(400).json({ message: 'Configure el API Token primero.' })
      }
      const account = await getAccount(cfg.apiToken, cfg.environment)
      response.json({ account, ok: true })
    } catch (error) {
      next(error)
    }
  })

  router.post('/hgcash/webhook', (request, response) => {
    // Webhook receiver — extend here to process deposit confirmations
    const event = request.body
    if (event && store.getHgcashConfig().autoVerifyDeposits) {
      // Future: auto-verify deposits on event.type === 'deposit.confirmed'
    }
    response.json({ received: true })
  })

  // ── Users ─────────────────────────────────────────────────

  router.get('/users', (_request, response) => {
    response.json({ users: store.getUsers() })
  })

  router.post('/users', (request, response, next) => {
    try {
      const body = request.body ?? {}
      const user = store.addUser({
        email: typeof body.email === 'string' ? body.email.trim().toLowerCase() : '',
        estado: body.estado,
        nombre: requireText(body.nombre, 'El nombre', 80),
        rol: VALID_ROLES.includes(body.rol) ? body.rol : 'admin',
        secciones: typeof body.secciones === 'string' && body.secciones.trim()
          ? body.secciones.trim()
          : 'Todas',
        usuario: requireText(body.usuario, 'El usuario', 40),
      })
      response.status(201).json({ user })
    } catch (error) {
      next(error)
    }
  })

  router.put('/users/:id', (request, response, next) => {
    try {
      const body = request.body ?? {}
      const user = store.updateUser(request.params.id, {
        email: typeof body.email === 'string' ? body.email.trim().toLowerCase() : undefined,
        estado: body.estado,
        nombre: body.nombre ? requireText(body.nombre, 'El nombre', 80) : undefined,
        rol: VALID_ROLES.includes(body.rol) ? body.rol : undefined,
        secciones: typeof body.secciones === 'string' && body.secciones.trim()
          ? body.secciones.trim()
          : undefined,
        usuario: body.usuario ? requireText(body.usuario, 'El usuario', 40) : undefined,
      })
      response.json({ user })
    } catch (error) {
      next(error)
    }
  })

  return router
}

export { createApiRouter }
