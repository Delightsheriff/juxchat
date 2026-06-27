import Fastify from 'fastify'
import { healthRoute } from './modules/health/health.route.js'

/**
 * Creates and configures the Fastify application instance.
 * Keeping creation separate from server startup lets tests
 * import the app without binding to a network port.
 */
export function buildApp() {
  const app = Fastify({ logger: true })

  app.register(healthRoute)

  return app
}
