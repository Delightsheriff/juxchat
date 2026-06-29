import type { PrismaClient } from '@prisma/client'

/**
 * Creates a message and updates the conversation preview in a
 * single transaction. This keeps the database consistent — the
 * conversation's lastMessage is never out of sync with the
 * actual messages table.
 *
 * Membership is verified first with a separate read to produce
 * a clearer error than a foreign-key violation would.
 */
export async function sendMessage(
  prisma: PrismaClient,
  senderId: string,
  conversationId: string,
  text: string,
) {
  const member = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: senderId,
      },
    },
  })

  if (!member) {
    throw new Error('not a member of this conversation')
  }

  const message = await prisma.$transaction(async (tx) => {
    const msg = await tx.message.create({
      data: {
        conversationId,
        senderId,
        text,
      },
      include: { sender: { select: { username: true } } },
    })

    await tx.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: text,
        lastMessageAt: msg.createdAt,
      },
    })

    const { sender, ...rest } = msg
    return { ...rest, senderUsername: sender?.username ?? 'Unknown user' }
  })

  return message
}

export async function getMessages(
  prisma: PrismaClient,
  conversationId: string,
  userId: string,
  options?: { cursor?: string; limit?: number },
) {
  const member = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  })

  if (!member) {
    throw new Error('not a member of this conversation')
  }

  const limit = options?.limit ?? 30

  const raw = await prisma.message.findMany({
    where: { conversationId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    ...(options?.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
    take: limit + 1,
    include: { sender: { select: { username: true } } },
  })

  const hasMore = raw.length > limit
  const page = hasMore ? raw.slice(0, limit) : raw
  page.reverse()

  const messages = page.map(({ sender, ...rest }) => ({
    ...rest,
    senderUsername: sender?.username ?? 'Unknown user',
  }))

  const nextCursor = hasMore ? (messages[0]?.id ?? null) : null

  return { messages, nextCursor, hasMore }
}
