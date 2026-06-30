import type { FastifyInstance } from 'fastify'
import { register, login } from './auth.service.js'

export async function authRoute(app: FastifyInstance) {
  app.post('/auth/register', async (request, reply) => {
    const { username, password } = request.body as { username?: string; password?: string }

    if (!username || !password) {
      return reply.status(400).send({ error: 'username and password are required' })
    }

    try {
      const result = await register(app.prisma, username, password)
      return reply.status(201).send(result)
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'username already taken') {
          return reply.status(409).send({ error: err.message })
        }
        if (err.message.includes('at least')) {
          return reply.status(400).send({ error: err.message })
        }
      }
      app.log.error({ err }, 'register failed')
      return reply.status(500).send({ error: 'registration failed' })
    }
  })

  app.post('/auth/login', async (request, reply) => {
    const { username, password } = request.body as { username?: string; password?: string }

    if (!username || !password) {
      return reply.status(400).send({ error: 'username and password are required' })
    }

    try {
      const result = await login(app.prisma, username, password)
      return reply.send(result)
    } catch (err) {
      if (err instanceof Error && err.message === 'invalid username or password') {
        return reply.status(401).send({ error: err.message })
      }
      app.log.error({ err }, 'login failed')
      return reply.status(500).send({ error: 'login failed' })
    }
  })
}
