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
    })

    await tx.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: text,
        lastMessageAt: msg.createdAt,
      },
    })

    return msg
  })

  return message
}

export async function getMessages(
  prisma: PrismaClient,
  conversationId: string,
  userId: string,
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

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  })

  return messages
}
