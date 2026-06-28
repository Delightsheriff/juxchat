import 'dotenv/config'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const alice = await prisma.user.upsert({
    where: { username: 'alice' },
    update: {},
    create: { username: 'alice' },
  })

  const bob = await prisma.user.upsert({
    where: { username: 'bob' },
    update: {},
    create: { username: 'bob' },
  })

  const charlie = await prisma.user.upsert({
    where: { username: 'charlie' },
    update: {},
    create: { username: 'charlie' },
  })

  const convId = 'conv_demo'

  const conv = await prisma.conversation.upsert({
    where: { id: convId },
    update: {},
    create: { id: convId },
  })

  await prisma.conversationMember.upsert({
    where: { conversationId_userId: { conversationId: conv.id, userId: alice.id } },
    update: {},
    create: { conversationId: conv.id, userId: alice.id },
  })

  await prisma.conversationMember.upsert({
    where: { conversationId_userId: { conversationId: conv.id, userId: bob.id } },
    update: {},
    create: { conversationId: conv.id, userId: bob.id },
  })

  console.log(`Seeded: alice(${alice.id}), bob(${bob.id}), charlie(${charlie.id}), conversation(${conv.id})`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
