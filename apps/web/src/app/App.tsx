import { useState } from 'react'
import { SocketProvider } from '../socket/SocketProvider'
import { DevLogin } from '../modules/dev/DevLogin'
import { Chat } from '../modules/chat/Chat'

function App() {
  const [session, setSession] = useState<{ username: string; conversationId: string } | null>(null)

  if (!session) {
    return (
      <DevLogin
        onStart={(username, conversationId) => setSession({ username, conversationId })}
      />
    )
  }

  return (
    <SocketProvider>
      <Chat username={session.username} conversationId={session.conversationId} />
    </SocketProvider>
  )
}

export default App
