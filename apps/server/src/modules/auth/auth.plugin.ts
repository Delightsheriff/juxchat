import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import { verifyToken } from './auth.service.js'

declare module 'fastify' {
  interface FastifyRequest {
    user: { userId: string; username: string }
  }
}

export default fp(async function authPlugin(app: FastifyInstance) {
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    const header = request.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      reply.status(401).send({ error: 'missing or invalid authorization header' })
      return
    }
    try {
      request.user = verifyToken(header.slice(7))
    } catch {
      reply.status(401).send({ error: 'invalid or expired token' })
    }
  })
})

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}
