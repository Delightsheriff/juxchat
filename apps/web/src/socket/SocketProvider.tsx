import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getSocket } from './socket'
import { Events } from './events'

interface SocketContextValue {
  connected: boolean
}

const SocketContext = createContext<SocketContextValue>({ connected: false })

/**
 * Owns the socket lifecycle — connects when the app mounts and
 * disconnects when it unmounts. Wrapping this in a provider
 * (rather than calling connect/disconnect in individual components)
 * guarantees a single point of control and prevents leaks.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socket = getSocket()

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.connect()

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.disconnect()
    }
  }, [])

  return (
    <SocketContext value={{ connected }}>
      {children}
    </SocketContext>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
