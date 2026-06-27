import type { FastifyInstance } from 'fastify'

/**
 * Registers the health-check route as a Fastify plugin.
 * Each feature module follows this pattern — encapsulating its routes
 * so the app registers them as a unit.
 */
export async function healthRoute(app: FastifyInstance) {
  app.get('/health', async (_request, _reply) => {
    return { status: 'ok' }
  })
}
