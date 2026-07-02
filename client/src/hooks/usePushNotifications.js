import { useCallback, useEffect, useState } from 'react'

import { api } from '../services/api'
import { isPushSupported, urlBase64ToUint8Array } from '../services/push'

function usePushNotifications({ publicKey, onPushMessage }) {
  const [state, setState] = useState({
    endpoint: '',
    error: '',
    pending: false,
    permission: typeof Notification === 'undefined' ? 'default' : Notification.permission,
    subscribed: false,
    supported: isPushSupported(),
  })

  const syncSubscription = useCallback(async () => {
    if (!isPushSupported()) {
      return
    }

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    setState((current) => ({
      ...current,
      endpoint: subscription?.endpoint || '',
      permission: Notification.permission,
      subscribed: Boolean(subscription),
      supported: true,
    }))
  }, [])

  useEffect(() => {
    if (!isPushSupported()) {
      return undefined
    }

    syncSubscription()

    const handleMessage = (event) => {
      if (event.data?.type === 'push') {
        onPushMessage(event.data.payload)
      }

      if (event.data?.type === 'navigate' && event.data.payload?.url) {
        window.history.pushState({}, '', event.data.payload.url)
        window.dispatchEvent(new PopStateEvent('popstate'))
      }
    }

    navigator.serviceWorker.addEventListener('message', handleMessage)

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage)
    }
  }, [onPushMessage, syncSubscription])

  const enable = useCallback(async () => {
    if (!publicKey) {
      setState((current) => ({
        ...current,
        error: 'La clave pública VAPID no está configurada.',
      }))
      return
    }

    setState((current) => ({
      ...current,
      error: '',
      pending: true,
    }))

    try {
      const permission = await Notification.requestPermission()

      if (permission !== 'granted') {
        throw new Error('El navegador no concedió permiso para notificaciones.')
      }

      const registration = await navigator.serviceWorker.ready
      const existingSubscription = await registration.pushManager.getSubscription()
      const subscription =
        existingSubscription ||
        (await registration.pushManager.subscribe({
          applicationServerKey: urlBase64ToUint8Array(publicKey),
          userVisibleOnly: true,
        }))

      await api.subscribeToPush(subscription)

      setState({
        endpoint: subscription.endpoint,
        error: '',
        pending: false,
        permission,
        subscribed: true,
        supported: true,
      })
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error.message,
        pending: false,
        permission: Notification.permission,
      }))
    }
  }, [publicKey])

  const disable = useCallback(async () => {
    setState((current) => ({
      ...current,
      error: '',
      pending: true,
    }))

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await api.unsubscribeFromPush(subscription.endpoint)
        await subscription.unsubscribe()
      }

      setState((current) => ({
        ...current,
        endpoint: '',
        error: '',
        pending: false,
        subscribed: false,
      }))
    } catch (error) {
      setState((current) => ({
        ...current,
        error: error.message,
        pending: false,
      }))
    }
  }, [])

  return {
    ...state,
    disable,
    enable,
  }
}

export { usePushNotifications }
