import 'dotenv/config'
import { buildApp } from './app.js'

/**
 * Application entry point. Bootstraps the Fastify app and starts
 * listening. Separated from app creation so the app can be reused
 * (e.g. in tests) without automatically binding to a port.
 */
async function main() {
  const app = buildApp()

  try {
    await app.listen({ port: 3000 })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

main()
