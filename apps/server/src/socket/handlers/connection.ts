import type { Socket } from 'socket.io'
import type { Server } from 'socket.io'
import type { FastifyBaseLogger } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { onDisconnect } from './disconnect.js'
import { onRegister } from './register.js'
import { onJoinConversation } from './join-conversation.js'
import { onSendMessage } from './send-message.js'

/**
 * Handles a newly connected WebSocket client. Registers the
 * disconnect listener and event handlers on the socket.
 * Separating each event into its own file keeps lifecycle
 * concerns isolated.
 */
export function onConnection(
  socket: Socket,
  log: FastifyBaseLogger,
  prisma: PrismaClient,
  io: Server,
) {
  socket.data.connectedAt = Date.now()

  log.info({ socketId: socket.id }, 'client connected')

  socket.on('register', (userId: string) => onRegister(socket, log, userId))

  socket.on('join_conversation', (conversationId: string) => {
    onJoinConversation(socket, log, prisma, conversationId)
  })

  socket.on('send_message', async (data, ack) => {
    const result = await onSendMessage(socket, log, prisma, io, data)
    if (ack) ack(result)
  })

  socket.on('disconnect', () => {
    onDisconnect(socket, log)
  })
}
