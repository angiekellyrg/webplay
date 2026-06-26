import webPush from 'web-push'

const configureNotifications = (config) => {
  webPush.setVapidDetails(config.vapidSubject, config.vapidPublicKey, config.vapidPrivateKey)
}

const notifySubscribers = async ({ onInvalidSubscription, payload, subscriptions }) => {
  const results = await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await webPush.sendNotification(subscription, JSON.stringify(payload))
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          onInvalidSubscription(subscription.endpoint)
          return
        }

        throw error
      }
    }),
  )

  const failure = results.find((result) => result.status === 'rejected')

  if (failure) {
    throw failure.reason
  }
}

export { configureNotifications, notifySubscribers }
