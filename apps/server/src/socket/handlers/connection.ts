import type { Socket } from 'socket.io'
import type { FastifyLoggerInstance } from 'fastify'
import { onDisconnect } from './disconnect.js'
import { onRegister } from './register.js'

/**
 * Handles a newly connected WebSocket client. Registers the
 * disconnect listener and the temporary register handler on
 * the socket. Separating each event into its own file keeps
 * lifecycle concerns isolated.
 */
export function onConnection(socket: Socket, log: FastifyLoggerInstance) {
  socket.data.connectedAt = Date.now()

  log.info({ socketId: socket.id }, 'client connected')

  socket.on('register', (userId: string) => onRegister(socket, log, userId))

  socket.on('disconnect', () => {
    onDisconnect(socket, log)
  })
}
