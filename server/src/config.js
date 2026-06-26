import path from 'node:path'
import { fileURLToPath } from 'node:url'

import webPush from 'web-push'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const generatedKeys = webPush.generateVAPIDKeys()
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || generatedKeys.publicKey
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || generatedKeys.privateKey

const config = {
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  dotavipUrl: process.env.DOTAVIP_URL || 'https://dotavip.net',
  port: Number(process.env.PORT || 3001),
  staticDir: path.resolve(__dirname, '../../client/dist'),
  vapidPrivateKey,
  vapidPublicKey,
  vapidSubject: process.env.VAPID_SUBJECT || 'mailto:webplay@example.com',
}

export { config }
