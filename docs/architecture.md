# Architecture

## Monorepo (pnpm workspaces)

A monorepo keeps the backend (`apps/server`) and frontend (`apps/web`) in a single repository so that shared types, configuration, and tooling can be managed without publishing packages. It also makes it trivial to run both sides of a feature branch in CI with a single checkout. The trade-off — a larger root — is negligible for a two-package project.

## Fastify

Fastify was chosen over Express because it provides a built-in plugin system that maps naturally to feature modules. Plugins can encapsulate routes, decorate the instance, and control scope — which means the health check, database, and Socket.IO setup are each registered as self-contained plugins with no shared middleware soup. Express's middleware model would require manual ordering discipline to achieve the same separation.

## Socket.IO

Socket.IO was chosen over raw WebSockets for two reasons. First, it provides room-based broadcasting, which maps directly to conversations — clients join a room named after the conversation ID, and messages are emitted to that room. Second, it falls back to long-polling when WebSockets cannot be established, which avoids a class of connectivity issues in restrictive network environments. The trade-off is additional protocol overhead, which is acceptable for a chat application.

## Prisma

Prisma provides type-safe database access that catches schema mismatches at build time rather than runtime. The generated client mirrors the schema exactly, so adding a field to a model immediately surfaces any incorrect queries in the codebase. The query API also eliminates the need for a separate ORM mapping layer — the models are the mapping.

## Feature-first architecture

Modules are organised by feature (`modules/health/`, `modules/messages/`) rather than by layer (`controllers/`, `services/`, `routes/`). This keeps related code colocated, so adding a feature means adding a single directory rather than touching four scattered directories. It also makes it easy to see at a glance what the application does — the module list is a table of contents.

## Business logic separated from transport

Socket handlers validate the incoming event and delegate to a service module (`message.service.ts`). The service has no knowledge of Socket.IO, HTTP, or any transport — it receives plain values and returns plain values. This separation means the same business logic can be reused (for example, exposing the same operation over HTTP later), and it can be unit-tested without starting a server or creating fake socket objects.

## HTTP for history, Socket.IO for realtime

Message history is fetched over HTTP (`GET /conversations/:id/messages`) rather than through a socket event. HTTP is a better fit for bulk, one-shot data: it has built-in caching semantics, works with standard browser devtools, and does not require the client to be registered before loading history. Socket.IO is kept for what it does best — low-latency bidirectional communication for realtime events like `new_message`. Splitting the concerns avoids forcing every new client to wait for a socket connection to complete before seeing their chat history.

## Multi-socket user mapping

A single user can have multiple browser tabs open simultaneously. Each tab creates its own WebSocket connection, and each connection registers a separate socket ID. The server maintains a `Map<userId, Set<socketId>>` so that all of a user's active sockets are tracked. Registering a new tab adds to the set; closing a tab removes just that socket. The user entry is deleted only when the last socket disconnects. This prevents one tab from unregistering another and ensures broadcast events reach all open instances.

## Development seed

The database seed creates three users (alice, bob, charlie) and a single conversation (`conv_demo`) that all three belong to. Seed data exists so that developers can open multiple browser tabs, pick different users, and immediately test sending and receiving messages without manually creating accounts or conversation memberships. The seed is idempotent — running it multiple times does not create duplicates.
