import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { PrismaClient } from '@prisma/client'

const SALT_ROUNDS = 10

function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return secret
}

export interface JwtPayload {
  userId: string
  username: string
}

export async function register(
  prisma: PrismaClient,
  username: string,
  password: string,
): Promise<{ user: { id: string; username: string }; token: string }> {
  const trimmed = username.trim()
  if (!trimmed || trimmed.length < 2) {
    throw new Error('username must be at least 2 characters')
  }
  if (!password || password.length < 6) {
    throw new Error('password must be at least 6 characters')
  }

  const existing = await prisma.user.findUnique({ where: { username: trimmed } })
  if (existing) {
    throw new Error('username already taken')
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  const user = await prisma.user.create({
    data: { username: trimmed, passwordHash },
  })

  const token = jwt.sign(
    { userId: user.id, username: user.username } satisfies JwtPayload,
    getSecret(),
    { expiresIn: '7d' },
  )

  return { user: { id: user.id, username: user.username }, token }
}

export async function login(
  prisma: PrismaClient,
  username: string,
  password: string,
): Promise<{ user: { id: string; username: string }; token: string }> {
  const trimmed = username.trim()
  if (!trimmed) {
    throw new Error('username is required')
  }
  if (!password) {
    throw new Error('password is required')
  }

  const user = await prisma.user.findUnique({ where: { username: trimmed } })
  if (!user || !user.passwordHash) {
    throw new Error('invalid username or password')
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    throw new Error('invalid username or password')
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username } satisfies JwtPayload,
    getSecret(),
    { expiresIn: '7d' },
  )

  return { user: { id: user.id, username: user.username }, token }
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getSecret()) as JwtPayload
}
