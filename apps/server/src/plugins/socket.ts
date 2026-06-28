import { Server } from 'socket.io'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { registerSocketHandlers } from '../socket/index.js'

declare module 'fastify' {
  interface FastifyInstance {
    io: Server
  }
}

/**
 * Registers Socket.IO as a Fastify plugin so it shares the
 * application's HTTP server. Wrapping with fastify-plugin
 * exposes `fastify.io` to all route and socket modules.
 *
 * The Socket.IO server is created inside `onReady` because
 * `fastify.server` is only available after the HTTP server
 * is created (which happens before the `onReady` hooks fire).
 *
 * On shutdown, all active WebSocket connections are closed
 * before the HTTP server stops.
 */
export default fp(async function socketPlugin(app: FastifyInstance) {
  app.addHook('onReady', async function () {
    const io = new Server(app.server, {
      cors: { origin: '*' },
    })

    app.decorate('io', io)

    registerSocketHandlers(io, app.log)
  })

  app.addHook('preClose', async function () {
    if (app.io) {
      app.io.local.disconnectSockets(true)
    }
  })
})
