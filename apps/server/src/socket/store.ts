/**
 * Temporary in-memory mapping between socket IDs and user IDs.
 *
 * This state is ephemeral — it lives only as long as the process
 * runs. Storing it in PostgreSQL would add latency and complexity
 * for data that is already lost on server restart. A proper
 * authentication system will replace this with a database-backed
 * session store.
 */
export const socketUserMap = new Map<string, string>()
export const userSocketMap = new Map<string, string>()
