import { useMemo } from 'react'
import { Message, MessageContent, MessageFooter } from '@/components/ui/message'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from '@/components/ui/message-scroller'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/format'
import { buildRenderItems, type MessagePosition } from './group-messages'

export interface ChatMessage {
  id: string
  senderId: string
  text: string
  createdAt: string
}

const roundedByPosition: Record<MessagePosition, string> = {
  single: '',
  first: 'rounded-b-sm',
  middle: 'rounded-sm',
  last: 'rounded-t-sm',
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex justify-center py-3">
      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

export function MessageList({
  messages,
  userId,
}: {
  messages: ChatMessage[]
  userId: string
}) {
  const renderItems = useMemo(() => buildRenderItems(messages), [messages])

  return (
    <MessageScrollerProvider>
      <MessageScroller className="flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent className="gap-0 px-4 py-3">
            {renderItems.map((item) => {
              if (item.type === 'separator') {
                return <DateSeparator key={item.key} label={item.label} />
              }

              const msg = item.message
              const isMine = msg.senderId === userId
              const rounded = roundedByPosition[msg.position]
              const isStartOfGroup = msg.position === 'first' || msg.position === 'single'

              return (
                <MessageScrollerItem
                  key={msg.id}
                  scrollAnchor={item.isLast}
                  className={cn(isStartOfGroup && 'mt-4')}
                >
                  <Message align={isMine ? 'end' : 'start'}>
                    <MessageContent>
                      <Bubble variant={isMine ? 'default' : 'muted'}>
                        <BubbleContent className={rounded}>
                          {msg.text}
                        </BubbleContent>
                      </Bubble>
                      <MessageFooter>{formatTime(msg.createdAt)}</MessageFooter>
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              )
            })}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  )
}
