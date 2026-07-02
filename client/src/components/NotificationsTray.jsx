import { useEffect } from 'react'

function NotificationsTray({ notifications, onDismiss }) {
  return (
    <div className="notifications-tray" aria-live="polite" aria-atomic="true">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  )
}

function NotificationItem({ notification, onDismiss }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onDismiss(notification.id)
    }, 6000)

    return () => window.clearTimeout(timer)
  }, [notification.id, onDismiss])

  return (
    <article className={`notification-card tone-${notification.tone}`}>
      <div>
        <strong>{notification.title}</strong>
        <p>{notification.message}</p>
      </div>
      <button type="button" onClick={() => onDismiss(notification.id)} aria-label="Cerrar">
        ×
      </button>
    </article>
  )
}

export default NotificationsTray
