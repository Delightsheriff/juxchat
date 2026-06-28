import type { FastifyInstance } from 'fastify'

/**
 * Registers the message history endpoint. History is served over
 * HTTP rather than Socket.IO because it is a request-response
 * pattern — the client asks once and receives a single response.
 * Socket.IO is reserved for ongoing real-time events.
 */
export async function messagesRoute(app: FastifyInstance) {
  app.get('/conversations/:conversationId/messages', async (request, reply) => {
    const { conversationId } = request.params as { conversationId: string }

    if (!conversationId || typeof conversationId !== 'string') {
      return reply.status(400).send({ error: 'conversationId is required' })
    }

    const { userId } = request.query as { userId?: string }

    if (!userId || typeof userId !== 'string') {
      return reply.status(400).send({ error: 'userId is required' })
    }

    const user = await app.prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return reply.status(401).send({ error: 'user not found' })
    }

    const member = await app.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    })

    if (!member) {
      return reply.status(403).send({ error: 'not a member of this conversation' })
    }

    const messages = await app.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    })

    return messages
  })
}
