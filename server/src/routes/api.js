import { Router } from 'express'

import { requireText } from '../utils/validate.js'

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

  return router
}

export { createApiRouter }
