import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

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
          <Label>User</Label>
          <Select value={username} onValueChange={(v) => setUsername(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {USERS.map((u) => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Conversation</Label>
          <Select value={conversationId} onValueChange={(v) => setConversationId(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONVERSATIONS.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit">Continue</Button>
      </form>
    </div>
  )
}
