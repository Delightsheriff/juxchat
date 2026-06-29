import { useCallback, useEffect, useRef, useState } from 'react'
import { getSocket, BACKEND_URL } from '../../socket/socket'
import { Events } from '../../socket/events'
import { useSocket } from '../../socket/SocketProvider'
import { MessageList, type ChatMessage } from './MessageList'
import { MessageInput } from './MessageInput'
import { ChatHeader } from './ChatHeader'

const PAGE_SIZE = 30

const CONVERSATION_MEMBERS: Record<string, string[]> = {
  conv_demo: ['alice', 'bob', 'charlie'],
}

interface PaginatedResponse {
  messages: ChatMessage[]
  nextCursor: string | null
  hasMore: boolean
}

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
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const loadingRef = useRef(false)

  const otherParticipant =
    CONVERSATION_MEMBERS[conversationId]?.find((m) => m !== username) ?? null

  useEffect(() => {
    const socket = getSocket()

    function onRegistered(data: { userId: string }) {
      setUserId(data.userId)
      socket.emit(Events.JoinConversation, conversationId)
    }

    function onJoinedConversation() {
      setJoined(true)
    }

    function onNewMessage(msg: ChatMessage) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    }

    function onRegisterError(data: { message: string }) {
      console.error('register error', data.message)
    }

    function onJoinConversationError(data: { message: string }) {
      console.error('join error', data.message)
    }

    function onDisconnect() {
      setUserId(null)
      setJoined(false)
    }

    socket.on(Events.Registered, onRegistered)
    socket.on(Events.JoinedConversation, onJoinedConversation)
    socket.on(Events.NewMessage, onNewMessage)
    socket.on(Events.RegisterError, onRegisterError)
    socket.on(Events.JoinConversationError, onJoinConversationError)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off(Events.Registered, onRegistered)
      socket.off(Events.JoinedConversation, onJoinedConversation)
      socket.off(Events.NewMessage, onNewMessage)
      socket.off(Events.RegisterError, onRegisterError)
      socket.off(Events.JoinConversationError, onJoinConversationError)
      socket.off('disconnect', onDisconnect)
    }
  }, [conversationId])

  useEffect(() => {
    if (connected && !userId) {
      getSocket().emit(Events.Register, username)
    }
  }, [connected, userId, username])

  useEffect(() => {
    if (!joined || !userId) return

    const url = `${BACKEND_URL}/conversations/${conversationId}/messages?userId=${userId}&limit=${PAGE_SIZE}`
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('failed to fetch messages')
        return res.json() as Promise<PaginatedResponse>
      })
      .then((data) => {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id))
          const toAdd = data.messages.filter((m) => !existingIds.has(m.id))
          if (toAdd.length === 0) return prev
          return [...prev, ...toAdd].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          )
        })
        setNextCursor(data.nextCursor)
        setHasMore(data.hasMore)
      })
      .catch((err) => {
        console.error('history fetch failed', err)
      })
  }, [joined, userId, conversationId])

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || loadingRef.current || !userId || !nextCursor) return

    loadingRef.current = true
    setLoadingHistory(true)

    try {
      const url = `${BACKEND_URL}/conversations/${conversationId}/messages?userId=${userId}&cursor=${nextCursor}&limit=${PAGE_SIZE}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('failed to load more messages')
      const data: PaginatedResponse = await res.json()

      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id))
        const toAdd = data.messages.filter((m) => !existingIds.has(m.id))
        if (toAdd.length === 0) return prev
        return [...toAdd, ...prev]
      })
      setNextCursor(data.nextCursor)
      setHasMore(data.hasMore)
    } catch (err) {
      console.error('load more failed', err)
    } finally {
      loadingRef.current = false
      setLoadingHistory(false)
    }
  }, [hasMore, userId, nextCursor, conversationId])

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
      <MessageList
        messages={messages}
        userId={userId!}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        loadingHistory={loadingHistory}
      />
      <MessageInput onSend={handleSend} />
    </div>
  )
}
