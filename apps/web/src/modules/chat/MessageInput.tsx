import { useState } from 'react'
import { Button } from '@/components/ui/button'

/**
 * Owns only the input text state and exposes a callback when the
 * user presses Send. The parent is responsible for actually
 * transmitting the message — this component just collects the
 * text and hands it off after basic empty-string filtering.
 */
export function MessageInput({
  onSend,
}: {
  onSend: (text: string) => Promise<void>
}) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setSending(true)
    try {
      await onSend(trimmed)
      setText('')
    } catch {
      // keep the text in the input so the user can retry
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
      <input
        className="flex-1 rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={sending}
      />
      <Button type="submit" disabled={sending || !text.trim()}>
        Send
      </Button>
    </form>
  )
}
