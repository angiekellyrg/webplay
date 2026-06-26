import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

clientsClaim()
self.skipWaiting()

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html'), { denylist: [/^\/api\//] }))

const readPayload = (event) => {
  try {
    return JSON.parse(event.data?.text() || '{}')
  } catch {
    return {}
  }
}

const notifyClients = async (payload) => {
  const windowClients = await self.clients.matchAll({
    includeUncontrolled: true,
    type: 'window',
  })

  windowClients.forEach((client) => {
    client.postMessage({
      payload,
      type: 'push',
    })
  })
}

self.addEventListener('push', (event) => {
  const payload = readPayload(event)
  const title = payload.title || 'WebPlay'
  const options = {
    badge: '/favicon.svg',
    body: payload.body || 'Tienes una nueva actualización.',
    data: payload.data || { url: '/' },
    icon: '/favicon.svg',
    tag: payload.tag || 'webplay-notification',
  }

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      notifyClients({
        body: options.body,
        data: options.data,
        title,
      }),
    ]),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({
      includeUncontrolled: true,
      type: 'window',
    }).then((windowClients) => {
      const existingClient = windowClients.find((client) => 'focus' in client)

      if (existingClient) {
        existingClient.postMessage({
          payload: { url: targetUrl },
          type: 'navigate',
        })

        return existingClient.focus()
      }

      return self.clients.openWindow(targetUrl)
    }),
  )
})
