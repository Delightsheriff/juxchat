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
 * Registers Prisma as a Fastify plugin so every route and plugin
 * can access the database through `fastify.prisma`.
 *
 * A single PrismaClient instance is shared across the entire app.
 * This avoids connection pool exhaustion and keeps resource usage
 * predictable. The client eagerly connects on registration so the
 * server fails fast if the database is unreachable. On shutdown,
 * the connection is closed gracefully to prevent hanging queries.
 */
export default fp(async function prismaPlugin(app: FastifyInstance) {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  await prisma.$connect()

  app.decorate('prisma', prisma)

  app.addHook('onClose', async () => {
    await prisma.$disconnect()
  })
})
