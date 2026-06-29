import { formatDateLabel } from '@/lib/format'
import type { ChatMessage } from './MessageList'

export type MessagePosition = 'single' | 'first' | 'middle' | 'last'

export interface PositionedMessage extends ChatMessage {
  position: MessagePosition
}

export interface DateSeparator {
  type: 'separator'
  key: string
  label: string
}

export interface RenderedMessage {
  type: 'message'
  key: string
  message: PositionedMessage
  isLast: boolean
}

export type RenderItem = DateSeparator | RenderedMessage

function getDateKey(isoString: string): string {
  return new Date(isoString).toISOString().slice(0, 10)
}

function getPosition(
  prev: ChatMessage | undefined,
  next: ChatMessage | undefined,
  msg: ChatMessage,
): MessagePosition {
  const sameAsPrev = prev !== undefined && prev.senderId === msg.senderId
  const sameAsNext = next !== undefined && next.senderId === msg.senderId

  if (!sameAsPrev && !sameAsNext) return 'single'
  if (!sameAsPrev && sameAsNext) return 'first'
  if (sameAsPrev && sameAsNext) return 'middle'
  return 'last'
}

export function buildRenderItems(
  messages: ChatMessage[],
): RenderItem[] {
  if (messages.length === 0) return []

  const items: RenderItem[] = []
  let lastDateKey: string | null = null

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    const dateKey = getDateKey(msg.createdAt)

    if (dateKey !== lastDateKey) {
      items.push({
        type: 'separator',
        key: `sep-${dateKey}`,
        label: formatDateLabel(msg.createdAt),
      })
      lastDateKey = dateKey
    }

    const prev = i > 0 ? messages[i - 1] : undefined
    const next = i < messages.length - 1 ? messages[i + 1] : undefined
    const position = getPosition(prev, next, msg)

    items.push({
      type: 'message',
      key: msg.id,
      message: { ...msg, position },
      isLast: i === messages.length - 1,
    })
  }

  return items
}
