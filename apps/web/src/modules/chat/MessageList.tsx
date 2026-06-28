import { Message, MessageContent } from '@/components/ui/message'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from '@/components/ui/message-scroller'

export interface ChatMessage {
  id: string
  senderId: string
  text: string
  createdAt: string
}

/**
 * Pure presentation component. It receives messages via props and
 * has no knowledge of sockets, state management, or the conversation
 * it belongs to.
 *
 * Ownership is determined by comparing each message's senderId to
 * the current user's database ID (not username). senderId is a
 * stable primary key that never changes, unlike a display name
 * which could be edited later.
 */
export function MessageList({
  messages,
  userId,
}: {
  messages: ChatMessage[]
  userId: string
}) {
  return (
    <MessageScrollerProvider>
      <MessageScroller className="flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent>
            {messages.map((msg, i) => {
              const isMine = msg.senderId === userId
              const isLast = i === messages.length - 1

              return (
                <MessageScrollerItem key={msg.id} scrollAnchor={isLast}>
                  <Message align={isMine ? 'end' : 'start'}>
                    <MessageContent>
                      <Bubble variant={isMine ? 'default' : 'muted'}>
                        <BubbleContent>{msg.text}</BubbleContent>
                      </Bubble>
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
