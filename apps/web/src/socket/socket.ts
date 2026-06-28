import { io, type Socket } from 'socket.io-client'

/**
 * A single Socket.IO client is shared across the entire app.
 * Creating multiple connections to the same backend would waste
 * resources and make it harder to reason about connection state.
 */
let socket: Socket | null = null

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000'

export function getSocket(): Socket {
  if (!socket) {
    socket = io(BACKEND_URL, { autoConnect: false })
  }
  return socket
}
