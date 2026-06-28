import type { Socket } from 'socket.io'
import type { FastifyLoggerInstance } from 'fastify'
import { socketUserMap, userSocketMap } from '../store.js'

/**
 * Temporary client registration. Once authentication is introduced,
 * this event will be replaced by a middleware that extracts the
 * userId from a JWT or session token at connection time.
 */
export function onRegister(socket: Socket, log: FastifyLoggerInstance, userId: string) {
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    socket.emit('register_error', { message: 'userId is required' })
    return
  }

  const trimmed = userId.trim()

  socketUserMap.set(socket.id, trimmed)
  userSocketMap.set(trimmed, socket.id)

  log.info({ socketId: socket.id, userId: trimmed }, 'socket registered as user')

  socket.emit('registered', { userId: trimmed })
}
