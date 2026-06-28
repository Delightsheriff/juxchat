import type { Socket } from 'socket.io'
import type { Server } from 'socket.io'
import type { FastifyBaseLogger } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { socketUserMap } from '../store.js'
import { sendMessage } from '../../modules/messages/message.service.js'

/**
 * Handles an incoming chat message. The handler is intentionally
 * thin — it only validates the wire format and delegates the
 * rest to the service layer. This keeps socket logic testable
 * without a running Socket.IO server.
 *
 * The message is emitted to the room only after the database
 * transaction commits, so clients never see a message that
 * wasn't persisted.
 */
export async function onSendMessage(
  socket: Socket,
  log: FastifyBaseLogger,
  prisma: PrismaClient,
  io: Server,
  data: { conversationId?: string; text?: string },
) {
  if (!data || !data.conversationId || !data.text || typeof data.text !== 'string') {
    return { error: 'conversationId and text are required' }
  }

  const text = data.text.trim()
  if (text.length === 0) {
    return { error: 'text must not be empty' }
  }

  const userId = socketUserMap.get(socket.id)
  if (!userId) {
    return { error: 'not registered' }
  }

  try {
    const message = await sendMessage(prisma, userId, data.conversationId, text)

    io.to(data.conversationId).emit('new_message', message)

    return { success: true, message }
  } catch (err) {
    log.error({ err, conversationId: data.conversationId }, 'send_message failed')
    return { error: err instanceof Error ? err.message : 'failed to send message' }
  }
}
