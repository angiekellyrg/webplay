# WebPlay

SPA/PWA con React + Vite y backend Node.js + Express para integrar una vista principal por iframe, alertas en tiempo real, notificaciones Push y chat interno.

## Stack

- React + Vite
- React Router
- Vite PWA
- Node.js + Express
- Socket.IO
- Web Push

## Estructura

```text
client/src
  components/
  context/
  hooks/
  pages/
  services/
  utils/
server/src
  data/
  routes/
  utils/
```

## Variables de entorno

Copiar los ejemplos:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Variables principales:

- `VITE_API_BASE_URL`
- `VITE_SOCKET_URL`
- `VITE_DOTAVIP_URL`
- `PORT`
- `CLIENT_ORIGIN`
- `DOTAVIP_URL`
- `VAPID_SUBJECT`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`

## Desarrollo

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
```

## Producción

1. Ejecutar `npm run build`
2. Arrancar `npm run start`
3. Asegurar valores VAPID reales y `CLIENT_ORIGIN` correcto

## Funcionalidades incluidas

- Navegación SPA sin recarga
- PWA instalable con service worker personalizado
- Suscripción a notificaciones Push
- Alertas en tiempo real
- Chat interno funcional
- Integración principal de `https://dotavip.net` por iframe con estados de carga, error y reconexión