import { useEffect, useState } from 'react'
import { getSocket } from '../../socket/socket'
import { Events } from '../../socket/events'
import { useSocket } from '../../socket/SocketProvider'

/**
 * Temporary registration flow. Once authentication exists this
 * will be replaced by a login screen — for now the user name is
 * hardcoded to keep the first vertical slice focused on the
 * socket connection alone.
 */
const USERNAME = 'alice'
const CONVERSATION_ID = 'conv_demo'

export function Chat() {
  const { connected } = useSocket()
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    const socket = getSocket()

    socket.on(Events.Registered, () => {
      setRegistered(true)
      socket.emit(Events.JoinConversation, CONVERSATION_ID)
    })

    socket.on(Events.RegisterError, (data: { message: string }) => {
      console.error('register error', data.message)
    })

    socket.on(Events.JoinConversationError, (data: { message: string }) => {
      console.error('join error', data.message)
    })

    return () => {
      socket.off(Events.Registered)
      socket.off(Events.RegisterError)
      socket.off(Events.JoinConversationError)
    }
  }, [])

  useEffect(() => {
    if (connected && !registered) {
      getSocket().emit(Events.Register, USERNAME)
    }
  }, [connected, registered])

  if (!connected) {
    return <div className="flex items-center justify-center h-svh text-muted-foreground">Connecting...</div>
  }

  return (
    <div className="flex items-center justify-center h-svh">
      <p className="text-lg">Connected as {USERNAME}</p>
    </div>
  )
}
