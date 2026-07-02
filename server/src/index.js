import 'dotenv/config'

import http from 'node:http'

import { Server } from 'socket.io'

import { createApp } from './app.js'
import { config } from './config.js'
import { store } from './data/store.js'
import { configureNotifications, notifySubscribers } from './utils/notifications.js'
import { requireText } from './utils/validate.js'

configureNotifications(config)

const pushToSubscribers = (payload) =>
  notifySubscribers({
    onInvalidSubscription: (endpoint) => {
      store.removeSubscription(endpoint)
    },
    payload,
    subscriptions: store.getSubscriptions(),
  })

const io = new Server({
  cors: {
    origin: config.clientOrigin,
  },
})

const app = createApp({
  config,
  io,
  pushToSubscribers,
  store,
})

const server = http.createServer(app)

io.attach(server)
io.on('connection', (socket) => {
  socket.on('chat:send', async (payload, callback = () => {}) => {
    try {
      const message = store.addMessage({
        author: requireText(payload.author, 'El nombre', 40),
        text: requireText(payload.text, 'El mensaje', 240),
      })

      io.emit('chat:message', message)
      await pushToSubscribers({
        body: message.text,
        data: { url: '/chat' },
        tag: `chat-${message.id}`,
        title: `Nuevo mensaje de ${message.author}`,
      })

      if (typeof callback === 'function') {
        callback({ message, ok: true })
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({ message: error.message, ok: false })
      }
    }
  })
})

server.listen(config.port, () => {
  console.log(`WebPlay server listening on http://localhost:${config.port}`)
})
