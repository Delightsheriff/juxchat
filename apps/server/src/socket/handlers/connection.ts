import type { Socket } from 'socket.io'
import type { FastifyLoggerInstance } from 'fastify'
import { onDisconnect } from './disconnect.js'

/**
 * Handles a newly connected WebSocket client. Registers the
 * disconnect listener on the socket because disconnect is a
 * per-socket event. Separating the handlers keeps each
 * lifecycle concern isolated.
 */
export function onConnection(socket: Socket, log: FastifyLoggerInstance) {
  socket.data.connectedAt = Date.now()

  log.info({ socketId: socket.id }, 'client connected')

  socket.on('disconnect', () => {
    onDisconnect(socket, log)
  })
}
