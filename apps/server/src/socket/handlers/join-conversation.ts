import type { Socket } from 'socket.io'
import type { FastifyBaseLogger } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { socketUserMap } from '../store.js'

/**
 * Handles a client joining a conversation room.
 *
 * Room membership is temporary — it lasts only as long as the
 * socket connection. The database remains the source of truth
 * for who belongs to which conversation. Every join request
 * is verified against the ConversationMember table so stale
 * or revoked memberships are never honoured.
 */
export async function onJoinConversation(
  socket: Socket,
  log: FastifyBaseLogger,
  prisma: PrismaClient,
  conversationId: string,
) {
  if (!conversationId || typeof conversationId !== 'string') {
    socket.emit('join_conversation_error', { message: 'conversationId is required' })
    return
  }

  const userId = socketUserMap.get(socket.id)
  if (!userId) {
    socket.emit('join_conversation_error', { message: 'not registered' })
    return
  }

  try {
    const member = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    })

    if (!member) {
      socket.emit('join_conversation_error', { message: 'not a member of this conversation' })
      return
    }

    socket.join(conversationId)

    log.info({ socketId: socket.id, userId, conversationId }, 'socket joined conversation room')

    socket.emit('joined_conversation', { conversationId })
  } catch (err) {
    log.error({ err, conversationId }, 'join_conversation failed')
    socket.emit('join_conversation_error', { message: 'failed to join conversation' })
  }
}
