# WebSocket Flow

## Lifecycle

```
Client                  Server
  │                       │
  ├── connect ──────────► │
  │                       │
  ├── register(alice) ──► │  Look up user by username in Prisma
  │                       │  Store socketId → userId in memory
  │◄── registered ────────┤
  │                       │
  ├── join_conv(demo) ──► │  Verify membership via ConversationMember
  │                       │  Add socket to Socket.IO room "conv_demo"
  │◄── joined_conv ───────┤
  │                       │
  ├── GET /conversations/ ┤  HTTP — fetch message history
  │     demo/messages     │  Ordered by createdAt ASC
  │◄── [ ...messages ] ───┤
  │                       │
  ├── send_message ──────►│  Validate payload
  │                       │  Resolve sender from socketId map
  │                       │  Verify membership in Prisma
  │                       │
  │                       │  ┌─ Transaction ─────────────┐
  │                       │  │  INSERT Message            │
  │                       │  │  UPDATE Conversation       │
  │                       │  │  (lastMessage, lastMessageAt)
  │                       │  └────────────────────────────┘
  │                       │
  │                       ├── new_message ──► All room members
  │◄── ack { success } ───┤
```

## Two kinds of state

**Persistent database state** — users, conversations, memberships, and messages — lives in PostgreSQL and survives server restarts. It is the source of truth for who belongs to which conversation and what messages have been sent.

**Temporary Socket.IO room state** is ephemeral. When a client joins a room, that mapping exists only in the server process's memory. If the server restarts, all rooms are gone and clients must rejoin. This is intentional — room membership is derived from the database (via ConversationMember), so it can always be reconstructed on reconnect. Storing room-state in the database would add latency and complexity for data whose lifetime is bounded by a single connection anyway.

## Why membership is checked on every join

Every `join_conversation` event queries ConversationMember rather than caching the result. This ensures that if a user is removed from a conversation while connected, their next join attempt (or their socket's reconnect) will correctly fail. The cost of a primary-key lookup per join is negligible.
