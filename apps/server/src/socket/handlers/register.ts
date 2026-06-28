import type { Socket } from 'socket.io'
import type { FastifyBaseLogger } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { socketUserMap, userSocketMap } from '../store.js'

export async function onRegister(
  socket: Socket,
  log: FastifyBaseLogger,
  prisma: PrismaClient,
  username: string,
) {
  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    socket.emit('register_error', { message: 'username is required' })
    return
  }

  const trimmed = username.trim()

  const user = await prisma.user.findUnique({ where: { username: trimmed } })
  if (!user) {
    socket.emit('register_error', { message: 'user not found' })
    return
  }

  socketUserMap.set(socket.id, user.id)
  userSocketMap.set(user.id, socket.id)

  log.info({ socketId: socket.id, userId: user.id, username: trimmed }, 'socket registered as user')

  socket.emit('registered', { userId: user.id, username: trimmed })
}
