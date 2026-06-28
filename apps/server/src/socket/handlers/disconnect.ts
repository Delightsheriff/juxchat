import type { Socket } from 'socket.io'
import type { FastifyBaseLogger } from 'fastify'
import { socketUserMap, userSocketMap } from '../store.js'

/**
 * Handles client disconnections. Cleans up the in-memory
 * registration so stale entries don't accumulate. Kept separate
 * from connection logic so each lifecycle stage has a single
 * responsibility and can be evolved independently.
 */
export function onDisconnect(socket: Socket, log: FastifyBaseLogger) {
  const duration = Date.now() - (socket.data.connectedAt ?? Date.now())

  const userId = socketUserMap.get(socket.id)
  if (userId) {
    socketUserMap.delete(socket.id)

    const sockets = userSocketMap.get(userId)
    if (sockets) {
      sockets.delete(socket.id)
      if (sockets.size === 0) {
        userSocketMap.delete(userId)
      }
    }
  }

  log.info({ socketId: socket.id, durationMs: duration }, 'client disconnected')
}
