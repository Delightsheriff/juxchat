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
 *
 * Scrolling behaviour is owned entirely by this component through
 * the shadcn MessageScroller primitive. The last item is marked as
 * the scroll anchor so that:
 *   - New messages keep the viewport at the bottom when the user
 *     is already there (auto-follow).
 *   - Scrolling upward to read older messages never forces the
 *     viewport back down.
 *
 * Keeping scroll logic in the presentation layer means the parent
 * (Chat) only worries about data — not about where the scrollbar
 * should be. It also prepares for future pagination: when older
 * messages are prepended, the anchor maintains the user's position
 * without additional scroll calculations.
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
