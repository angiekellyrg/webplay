import { io } from 'socket.io-client'

import { API_BASE_URL } from './api'

let socket

const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || API_BASE_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    })
  }

  return socket
}

export { getSocket }
