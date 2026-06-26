import fs from 'node:fs'
import path from 'node:path'

import cors from 'cors'
import express from 'express'

import { createApiRouter } from './routes/api.js'

const createApp = ({ config, io, pushToSubscribers, store }) => {
  const app = express()

  app.use(
    cors({
      credentials: true,
      origin(origin, callback) {
        if (!origin || origin === config.clientOrigin) {
          callback(null, true)
          return
        }

        callback(new Error('Origin no permitido'))
      },
    }),
  )
  app.use(express.json({ limit: '100kb' }))

  app.use(
    '/api',
    createApiRouter({
      config,
      io,
      pushToSubscribers,
      store,
    }),
  )

  if (fs.existsSync(config.staticDir)) {
    app.use(express.static(config.staticDir))

    app.get(/^(?!\/api|\/socket\.io).*/, (_request, response) => {
      response.sendFile(path.join(config.staticDir, 'index.html'))
    })
  }

  app.use((error, _request, response, _next) => {
    const status = error.message === 'Origin no permitido' ? 403 : 400

    response.status(status).json({
      message: error.message || 'No se pudo completar la solicitud.',
    })
  })

  return app
}

export { createApp }
