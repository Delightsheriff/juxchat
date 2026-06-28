import type { FastifyInstance } from 'fastify'
import { getMessages } from './message.service.js'

export async function messageRoute(app: FastifyInstance) {
  app.get('/conversations/:conversationId/messages', async (request, reply) => {
    const { conversationId } = request.params as { conversationId: string }
    const { userId } = request.query as { userId?: string }

    if (!conversationId || typeof conversationId !== 'string') {
      return reply.status(400).send({ error: 'conversationId is required' })
    }

    if (!userId || typeof userId !== 'string') {
      return reply.status(400).send({ error: 'userId is required' })
    }

    try {
      const messages = await getMessages(app.prisma, conversationId, userId)
      return reply.send(messages)
    } catch (err) {
      if (err instanceof Error && err.message === 'not a member of this conversation') {
        return reply.status(403).send({ error: err.message })
      }
      app.log.error({ err, conversationId }, 'get_messages failed')
      return reply.status(500).send({ error: 'failed to get messages' })
    }
  })
}
