/**
 * Centralised event-name constants so the server contract
 * is defined in one place rather than scattered as string
 * literals across the application.
 */
export const Events = {
  Register: 'register',
  JoinConversation: 'join_conversation',
  Registered: 'registered',
  RegisterError: 'register_error',
  JoinedConversation: 'joined_conversation',
  JoinConversationError: 'join_conversation_error',
  SendMessage: 'send_message',
  NewMessage: 'new_message',
} as const
