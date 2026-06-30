import type { FastifyInstance } from 'fastify'
import { getMessages } from './message.service.js'

export async function messageRoute(app: FastifyInstance) {
  app.get(
    '/conversations/:conversationId/messages',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      const { conversationId } = request.params as { conversationId: string }
      const { cursor, limit } = request.query as {
        cursor?: string
        limit?: string
      }

      if (!conversationId || typeof conversationId !== 'string') {
        return reply.status(400).send({ error: 'conversationId is required' })
      }

      const parsedLimit = limit ? parseInt(limit, 10) : undefined
      if (limit && (Number.isNaN(parsedLimit) || parsedLimit! < 1 || parsedLimit! > 100)) {
        return reply.status(400).send({ error: 'limit must be between 1 and 100' })
      }

      try {
        const result = await getMessages(app.prisma, conversationId, request.user.id, {
          cursor: cursor || undefined,
          limit: parsedLimit,
        })
        return reply.send(result)
      } catch (err) {
        if (err instanceof Error && err.message === 'not a member of this conversation') {
          return reply.status(403).send({ error: err.message })
        }
        app.log.error({ err, conversationId }, 'get_messages failed')
        return reply.status(500).send({ error: 'failed to get messages' })
      }
    },
  )
}
