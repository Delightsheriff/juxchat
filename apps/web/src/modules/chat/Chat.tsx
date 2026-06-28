import { useCallback, useEffect, useState } from 'react'
import { getSocket } from '../../socket/socket'
import { Events } from '../../socket/events'
import { useSocket } from '../../socket/SocketProvider'
import { MessageList, type ChatMessage } from './MessageList'
import { MessageInput } from './MessageInput'
import { ChatHeader } from './ChatHeader'

/**
 * Hardcoded mapping of seeded conversation members. Exists only
 * for the temporary DevLogin — real auth will derive participants
 * from the backend.
 */
const CONVERSATION_MEMBERS: Record<string, string[]> = {
  conv_demo: ['alice', 'bob'],
}

/**
 * Orchestrates the chat experience for a single conversation.
 * Owns socket interaction and message state, then delegates
 * presentation to child components. This keeps children focused
 * on rendering and avoids duplicating socket wiring.
 */
export function Chat({
  username,
  conversationId,
}: {
  username: string
  conversationId: string
}) {
  const { connected } = useSocket()
  const [userId, setUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [joined, setJoined] = useState(false)

  const otherParticipant =
    CONVERSATION_MEMBERS[conversationId]?.find((m) => m !== username) ?? null

  useEffect(() => {
    const socket = getSocket()

    socket.on(Events.Registered, (data: { userId: string }) => {
      setUserId(data.userId)
      socket.emit(Events.JoinConversation, conversationId)
    })

    socket.on(Events.JoinedConversation, () => {
      setJoined(true)
    })

    socket.on(Events.NewMessage, (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg])
    })

    socket.on(Events.RegisterError, (data: { message: string }) => {
      console.error('register error', data.message)
    })

    socket.on(Events.JoinConversationError, (data: { message: string }) => {
      console.error('join error', data.message)
    })

    socket.on('disconnect', () => {
      setUserId(null)
      setJoined(false)
      setMessages([])
    })

    return () => {
      socket.off(Events.Registered)
      socket.off(Events.JoinedConversation)
      socket.off(Events.NewMessage)
      socket.off(Events.RegisterError)
      socket.off(Events.JoinConversationError)
      socket.off('disconnect')
    }
  }, [conversationId])

  useEffect(() => {
    if (connected && !userId) {
      getSocket().emit(Events.Register, username)
    }
  }, [connected, userId, username])

  const handleSend = useCallback(async (text: string) => {
    return new Promise<void>((resolve, reject) => {
      getSocket().emit(
        Events.SendMessage,
        { conversationId, text },
        (response: { success: boolean; message: ChatMessage; error?: string }) => {
          if (response.success) {
            resolve()
          } else {
            reject(new Error(response.error))
          }
        },
      )
    })
  }, [conversationId])

  if (!connected) {
    return <div className="flex items-center justify-center h-svh text-muted-foreground">Connecting...</div>
  }

  if (!joined) {
    return <div className="flex items-center justify-center h-svh text-muted-foreground">Joining conversation...</div>
  }

  return (
    <div className="flex flex-col h-svh max-w-2xl mx-auto border-x bg-background">
      <ChatHeader otherParticipant={otherParticipant} username={username} />
      <MessageList messages={messages} userId={userId!} />
      <MessageInput onSend={handleSend} />
    </div>
  )
}
