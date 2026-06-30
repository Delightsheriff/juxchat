import type { Socket } from 'socket.io'
import type { FastifyBaseLogger } from 'fastify'

/**
 * Handles client disconnections.
 */
export function onDisconnect(socket: Socket, log: FastifyBaseLogger) {
  const duration = Date.now() - (socket.data.connectedAt ?? Date.now())

  log.info(
    { socketId: socket.id, userId: socket.data.user?.id, durationMs: duration },
    'client disconnected',
  )
}
