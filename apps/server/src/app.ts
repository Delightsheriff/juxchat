import Fastify from 'fastify'
import { healthRoute } from './modules/health/health.route.js'
import prismaPlugin from './plugins/prisma.js'

/**
 * Creates and configures the Fastify application instance.
 * Keeping creation separate from server startup lets tests
 * import the app without binding to a network port.
 *
 * Plugins are registered in dependency order — Prisma first so
 * all route modules that follow can rely on `fastify.prisma`
 * being available.
 */
export function buildApp() {
  const app = Fastify({ logger: true })

  app.register(prismaPlugin)
  app.register(healthRoute)

  return app
}
