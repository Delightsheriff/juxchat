import { SocketProvider } from '../socket/SocketProvider'
import { Chat } from '../modules/chat/Chat'

function App() {
  return (
    <SocketProvider>
      <Chat />
    </SocketProvider>
  )
}

export default App
