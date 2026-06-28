import type { Server } from 'socket.io'
import type { FastifyBaseLogger } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { onConnection } from './handlers/connection.js'

/**
 * Registers all socket event handlers on the Socket.IO server.
 * Each handler is isolated in its own file so concerns like
 * connection lifecycle, room management, and message handling
 * can evolve independently without touching shared wiring.
 */
export function registerSocketHandlers(io: Server, log: FastifyBaseLogger, prisma: PrismaClient) {
  io.on('connection', (socket) => onConnection(socket, log, prisma, io))
}
