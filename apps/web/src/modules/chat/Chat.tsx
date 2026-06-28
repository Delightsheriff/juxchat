import { useCallback, useEffect, useState } from 'react'
import { getSocket } from '../../socket/socket'
import { Events } from '../../socket/events'
import { useSocket } from '../../socket/SocketProvider'
import { MessageList, type ChatMessage } from './MessageList'
import { MessageInput } from './MessageInput'

/**
 * Coordinates the socket interaction for the current conversation.
 * It receives the active user and conversation from the parent and
 * has no knowledge of how they were chosen — the same component
 * works with the development entry screen and will work with a
 * real login screen later.
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
    <div className="flex flex-col h-svh max-w-2xl mx-auto">
      <MessageList messages={messages} userId={userId!} />
      <MessageInput onSend={handleSend} />
    </div>
  )
}
