import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      devOptions: {
        enabled: true,
        type: 'module',
      },
      injectRegister: 'auto',
      manifest: {
        background_color: '#0b1120',
        description: 'SPA con integración por iframe, tiempo real, chat y notificaciones Push.',
        display: 'standalone',
        icons: [
          {
            purpose: 'any',
            sizes: 'any',
            src: '/favicon.svg',
            type: 'image/svg+xml',
          },
        ],
        name: 'WebPlay',
        short_name: 'WebPlay',
        start_url: '/',
        theme_color: '#0f172a',
      },
      filename: 'sw.js',
      srcDir: 'src',
      strategies: 'injectManifest',
    }),
  ],
})
