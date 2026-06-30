import 'socket.io'

declare module 'socket.io' {
  interface Socket {
    data: {
      connectedAt?: number
      user?: { id: string; username: string }
    }
  }
}
