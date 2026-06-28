import { useState } from 'react'

const USERS = ['alice', 'bob', 'charlie']
const CONVERSATIONS = ['conv_demo']

/**
 * Development-only entry screen. Lets the developer pick a seeded
 * user and conversation before entering the chat. This will be
 * replaced by a real login screen when authentication is added.
 *
 * Seeded users (alice, bob, charlie) and the development
 * conversation (conv_demo) are hardcoded here rather than fetched
 * from the API because they are fixed developer data — fetching
 * would add unnecessary network round-trips during development.
 */
export function DevLogin({
  onStart,
}: {
  onStart: (username: string, conversationId: string) => void
}) {
  const [username, setUsername] = useState<string>(USERS[0])
  const [conversationId, setConversationId] = useState<string>(CONVERSATIONS[0])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onStart(username, conversationId)
  }

  return (
    <div className="flex items-center justify-center h-svh">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-80">
        <h1 className="text-xl font-semibold text-center">Chat App</h1>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">User</label>
          <select
            className="rounded-md border px-3 py-2 text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          >
            {USERS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Conversation</label>
          <select
            className="rounded-md border px-3 py-2 text-sm"
            value={conversationId}
            onChange={(e) => setConversationId(e.target.value)}
          >
            {CONVERSATIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Continue
        </button>
      </form>
    </div>
  )
}
