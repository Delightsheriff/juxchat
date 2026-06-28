/**
 * Presentation-only header that displays the other participant
 * and the logged-in user. It receives everything via props and
 * has no knowledge of sockets, state, or how the data was
 * obtained. Keeping it separate from Chat ensures it can be
 * reused or replaced without touching orchestration logic.
 */
export function ChatHeader({
  otherParticipant,
  username,
}: {
  otherParticipant: string | null
  username: string
}) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <div>
        <p className="text-sm font-semibold">
          {otherParticipant ?? 'Unknown'}
        </p>
        <p className="text-xs text-muted-foreground">You are {username}</p>
      </div>
    </div>
  )
}
