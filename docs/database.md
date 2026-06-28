# Database

## User

Represents a person who can send messages. Currently minimal — `id`, `username`, `createdAt` — because authentication has not been introduced yet. Once auth exists, this model will gain a password hash or external identity reference.

## Conversation

A grouping of messages and participants. The `lastMessage` and `lastMessageAt` fields exist so that a conversation list screen can display a preview of the most recent activity without joining the messages table. These fields are updated inside the same transaction that creates a new message, so they are always consistent with the actual data.

## ConversationMember

A join table linking users to conversations. Storing participant IDs directly on the Conversation model (for example, as a JSON array or a Postgres array column) would make it difficult to query whether a specific user belongs to a conversation, enforce unique membership, or add per-member metadata later (such as roles, nicknames, or mute status). A dedicated model keeps each concern in its own row.

The composite unique constraint `@@unique([conversationId, userId])` prevents duplicate memberships at the database level.

## Message

Each message belongs to exactly one conversation and has a sender. Messages are modelled as belonging to a conversation rather than as directed from one user to another because conversations involve multiple participants — broadcasting a direct message model to N recipients would require either N rows or a separate recipient tracking mechanism.

The `@@index([conversationId])` index exists because loading a conversation's message history is the primary query pattern.
