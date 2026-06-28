import { useCallback, useEffect, useState } from 'react'
import { getSocket, BACKEND_URL } from '../../socket/socket'
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
 * History is loaded over HTTP because it is a one-time request–
 * response operation. Live messages arrive over Socket.IO because
 * they are push events. Both sources write into the same local
 * messages array so the UI treats them identically.
 */
export function Chat() {
  const { connected } = useSocket()
  const [userId, setUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    const socket = getSocket()

    socket.on(Events.Registered, (data: { userId: string }) => {
      setUserId(data.userId)
      socket.emit(Events.JoinConversation, CONVERSATION_ID)
    })

    socket.on(Events.JoinedConversation, async () => {
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
  }, [])

  useEffect(() => {
    if (connected && !userId) {
      getSocket().emit(Events.Register, USERNAME)
    }
  }, [connected, userId])

  useEffect(() => {
    if (!joined || !userId) return

    async function loadHistory() {
      try {
        const res = await fetch(
          `${BACKEND_URL}/conversations/${CONVERSATION_ID}/messages?userId=${userId}`,
        )
        if (!res.ok) {
          console.error('failed to load history', res.status)
          return
        }
        const history: ChatMessage[] = await res.json()
        setMessages(history)
      } catch (err) {
        console.error('failed to load history', err)
      }
    }

    loadHistory()
  }, [joined, userId])

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
