import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'

/**
 * Owns only the input text state and exposes a callback when the
 * user presses Send. The parent is responsible for actually
 * transmitting the message — this component just collects the
 * text and hands it off after basic empty-string filtering.
 *
 * Enter sends the message. Shift+Enter inserts a new line.
 */
export function MessageInput({
  onSend,
}: {
  onSend: (text: string) => Promise<void>
}) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!sending && textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`
    }
  }, [text, sending])

  async function handleSubmit() {
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

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const empty = text.trim().length === 0

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
      className="flex items-end gap-2 border-t p-4"
    >
      <textarea
        ref={textareaRef}
        className="flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-relaxed outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30"
        rows={1}
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={sending}
      />
      <Button type="submit" disabled={sending || empty}>
        Send
      </Button>
    </form>
  )
}
