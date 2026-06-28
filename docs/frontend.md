# Frontend

## Feature-first structure

The `src/` directory is organised by feature (`modules/chat/`, `modules/dev/`) rather than by technical role (`components/`, `containers/`, `hooks/`). Shared primitives live in `socket/` and `components/ui/`. This structure makes it easy to see what the application does by reading the module list, and keeps the code for each feature colocated so adding a feature does not require touching files across the tree.

## SocketProvider

`SocketProvider` is a React context that owns the single socket connection lifecycle. It connects when the provider mounts and disconnects when it unmounts. Wrapping the entire application in this provider guarantees exactly one active connection at any time and prevents individual components from accidentally creating duplicate connections or forgetting to clean up.

## Singleton socket client

The underlying Socket.IO client is created once and cached in a module-level variable. This is a separate concern from the provider — the provider decides *when* to connect and disconnect, while the singleton ensures there is only ever one socket instance to manage. Creating multiple clients to the same backend would waste resources and make it harder to reason about event listener registration.

## Local React state for messages

Messages are stored in a `useState` array inside the `Chat` component rather than in a global store. This is intentional for the current stage of the application: there is exactly one active conversation and no need to share message state across routes or screens. Introducing Zustand, Redux, or React Query would add indirection and boilerplate without solving a real problem today. When multi-conversation support or optimistic updates are needed, state can be lifted or replaced without rewriting the presentation components.

## History loading via HTTP

After registering and joining a conversation via Socket.IO, the client fetches message history over HTTP (`GET /conversations/:id/messages?userId=...`). The fetched messages replace the local state so that refresh or reconnect immediately restores the full history. New messages received through the `new_message` socket event are appended to the same array — the UI makes no distinction between HTTP-loaded and socket-received messages.

## Authentication deferred

The application currently uses a development login screen (`DevLogin`) that lets a developer pick from a hardcoded list of seeded users. This exists solely to allow testing multiple users in local development without modifying code. Real authentication has been deferred because it would add complexity (password hashing, session tokens, JWT verification) before the core messaging flow has been validated. Once authentication is introduced, `DevLogin` will be removed and the socket `register` event will be replaced by a middleware that extracts the user identity from a token at connection time.
