import { createContext, useCallback, useEffect, useMemo, useState } from 'react'

import { usePushNotifications } from '../hooks/usePushNotifications'
import { api } from '../services/api'
import { loadProfile, saveProfile } from '../utils/storage'

const AppContext = createContext(null)
let notificationIdCounter = 0

const createNotificationId = () => {
  notificationIdCounter += 1
  return `notif-${Date.now()}-${notificationIdCounter}`
}

function AppProvider({ children }) {
  const [runtimeConfig, setRuntimeConfig] = useState({
    dotavipUrl: import.meta.env.VITE_DOTAVIP_URL || 'https://dotavip.net',
    pushPublicKey: '',
  })
  const [alerts, setAlerts] = useState([])
  const [messages, setMessages] = useState([])
  const [connectionStatus] = useState('connected')
  const [notifications, setNotifications] = useState([])
  const [routeHistory, setRouteHistory] = useState([])
  const [profile, setProfile] = useState(loadProfile)

  const pushNotification = useCallback((notification) => {
    setNotifications((current) => [
      {
        id: createNotificationId(),
        ...notification,
      },
      ...current,
    ].slice(0, 4))
  }, [])

  const dismissNotification = useCallback((id) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id))
  }, [])

  const recordRoute = useCallback((entry) => {
    setRouteHistory((current) => [
      entry,
      ...current.filter((route) => route.path !== entry.path),
    ].slice(0, 5))
  }, [])

  const updateProfile = useCallback((nextProfile) => {
    setProfile(nextProfile)
    saveProfile(nextProfile)
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadInitialData = async () => {
      try {
        const [configResponse, alertResponse, messageResponse] = await Promise.all([
          api.getConfig(),
          api.getAlerts(),
          api.getMessages(),
        ])

        if (!isMounted) {
          return
        }

        setRuntimeConfig({
          dotavipUrl: configResponse.dotavipUrl,
          pushPublicKey: configResponse.pushPublicKey,
        })
        setAlerts(alertResponse.alerts)
        setMessages(messageResponse.messages)
      } catch (error) {
        pushNotification({
          title: 'Carga inicial',
          message: error.message,
          tone: 'danger',
        })
      }
    }

    loadInitialData()

    return () => {
      isMounted = false
    }
  }, [pushNotification])

  const pushState = usePushNotifications({
    publicKey: runtimeConfig.pushPublicKey,
    onPushMessage: (payload) => {
      pushNotification({
        title: payload.title || 'Nueva notificación',
        message: payload.body || 'Se ha recibido un evento en tiempo real.',
        tone: 'accent',
      })
    },
  })

  const createAlert = useCallback(async (input) => {
    await api.createAlert(input)
  }, [])

  const sendMessage = useCallback(async (input) => {
    const response = await api.sendMessage(input)
    setMessages((current) => [response.message, ...current].slice(0, 60))
    return response.message
  }, [])

  const value = useMemo(
    () => ({
      alerts,
      connectionStatus,
      createAlert,
      dismissNotification,
      messages,
      notifications,
      profile,
      pushState,
      recordRoute,
      routeHistory,
      runtimeConfig,
      sendMessage,
      updateProfile,
    }),
    [
      alerts,
      connectionStatus,
      createAlert,
      dismissNotification,
      messages,
      notifications,
      profile,
      pushState,
      recordRoute,
      routeHistory,
      runtimeConfig,
      sendMessage,
      updateProfile,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export { AppContext, AppProvider }
