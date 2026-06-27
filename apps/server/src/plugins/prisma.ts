import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

/**
 * Registers a singleton Prisma Client on the Fastify instance.
 * Wrapping with fastify-plugin makes the `prisma` decoration visible
 * to all routes and plugins. The client disconnects automatically
 * when the server shuts down.
 */
export default fp(async function prismaPlugin(app: FastifyInstance) {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  app.decorate('prisma', prisma)

  app.addHook('onClose', async () => {
    await prisma.$disconnect()
  })
})
