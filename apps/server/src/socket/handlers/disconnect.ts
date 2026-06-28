import type { Socket } from 'socket.io'
import type { FastifyLoggerInstance } from 'fastify'

/**
 * Handles client disconnections. Kept separate from connection
 * logic so each lifecycle stage has a single responsibility and
 * can be evolved independently (e.g. adding cleanup or metrics).
 */
export function onDisconnect(socket: Socket, log: FastifyLoggerInstance) {
  const duration = Date.now() - (socket.data.connectedAt ?? Date.now())

  log.info({ socketId: socket.id, durationMs: duration }, 'client disconnected')
}
