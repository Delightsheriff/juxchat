import { useCallback, useEffect, useRef, useState } from 'react'
import { getSocket } from '../../socket/socket'
import { Events } from '../../socket/events'
import { useSocket } from '../../socket/SocketProvider'
import { MessageList, type ChatMessage } from './MessageList'
import { MessageInput } from './MessageInput'

const USERNAME = 'alice'
const CONVERSATION_ID = 'conv_demo'

/**
 * Coordinates the socket interaction for the current conversation.
 * Message state is local because it only represents what has arrived
 * over the wire for a single conversation — there is no need for
 * global state or a store at this stage.
 *
 * Rendering happens exclusively from the server's `new_message`
 * broadcast. The sender never inserts a message locally; it waits
 * for the server to echo it back through the room. This guarantees
 * that every displayed message was persisted first.
 */
export function Chat() {
  const { connected } = useSocket()
  const [userId, setUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [joined, setJoined] = useState(false)
  const messagesRef = useRef<ChatMessage[]>([])

  messagesRef.current = messages

  useEffect(() => {
    const socket = getSocket()

    socket.on(Events.Registered, (data: { userId: string }) => {
      setUserId(data.userId)
      socket.emit(Events.JoinConversation, CONVERSATION_ID)
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
    })

    return () => {
      socket.off(Events.Registered)
      socket.off(Events.JoinedConversation)
      socket.off(Events.NewMessage)
      socket.off(Events.RegisterError)
      socket.off(Events.JoinConversationError)
      socket.off('disconnect')
    }
  }, [])

  useEffect(() => {
    if (connected && !userId) {
      getSocket().emit(Events.Register, USERNAME)
    }
  }, [connected, userId])

  const handleSend = useCallback(async (text: string) => {
    return new Promise<void>((resolve, reject) => {
      getSocket().emit(
        Events.SendMessage,
        { conversationId: CONVERSATION_ID, text },
        (response: { success: boolean; message: ChatMessage; error?: string }) => {
          if (response.success) {
            resolve()
          } else {
            reject(new Error(response.error))
          }
        },
      )
    })
  }, [])

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
