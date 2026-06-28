import { Message, MessageContent } from '@/components/ui/message'
import { Bubble, BubbleContent } from '@/components/ui/bubble'

export interface ChatMessage {
  id: string
  senderId: string
  text: string
  createdAt: string
}

/**
 * Pure presentation component. It receives messages via props and
 * has no knowledge of sockets, state management, or the conversation
 * it belongs to. Keeping it focused on rendering makes it reusable
 * and easy to test.
 */
export function MessageList({
  messages,
  userId,
}: {
  messages: ChatMessage[]
  userId: string
}) {
  return (
    <div className="flex flex-col gap-2 p-4 overflow-y-auto">
      {messages.map((msg) => {
        const isMine = msg.senderId === userId
        return (
          <Message key={msg.id} align={isMine ? 'end' : 'start'}>
            <MessageContent>
              <Bubble variant={isMine ? 'default' : 'muted'}>
                <BubbleContent>{msg.text}</BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
        )
      })}
    </div>
  )
}
