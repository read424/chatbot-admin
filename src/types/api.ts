/**
 * Mensaje de chat tal como viene del backend
 */
export interface ApiChatMessage {
  id: string;
  content: string;
  messageType: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contact';
  direction: 'incoming' | 'outgoing';
  status: number; // -1: failed, 0: sending, 1: sent, 2: delivered, 3: read
  createdAt: string;
  updatedAt: string;
  chatSessionId: string;
  contactId: string;
  mediaUrl?: string;
  mediaMetadata?: {
    filename?: string;
    size?: number;
    mimetype?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  whatsappMessageId?: string;
  respondedBy?: number;
  responderType?: 'human' | 'bot';
  contact: ApiContact;
}

/**
 * Sesión de chat tal como viene del backend
 */
export interface ApiChatSession {
  id: string;
  status: 'active' | 'closed' | 'transferred';
  startedAt: string;
  endedAt?: string;
  handledBy?: number;
  tenantId: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  contact: ApiContact;
  messages?: ApiChatMessage[];
  unreadCount?: number;
  lastMessage?: ApiChatMessage;
}

/**
 * Contacto tal como viene del backend
 */
export interface ApiContact {
  id: string;
  name: string;
  phoneNumber: string;
  avatarUrl?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore?: boolean;
}

// ============================================================================
// CHAT API TYPES
// ============================================================================

export interface GetChatSessionsRequest {
  status?: string;
  limit?: number;
  offset?: number;
  search?: string;
  handledBy?: number;
}

export interface GetChatMessagesRequest {
  limit?: number;
  offset?: number;
}

export interface SendMessageRequest {
  content: string;
  messageType?: string;
}

export interface UpdateSessionRequest {
  status?: string;
  handledBy?: number;
  metadata?: Record<string, any>;
}

export interface CreateContactRequest {
  phoneNumber: string;
  name?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// WEBSOCKET EVENT TYPES
// ============================================================================

export interface WebSocketMessageEvent {
  type: 'message';
  data: ApiChatMessage;
  session: ApiChatSession;
}

export interface WebSocketSessionUpdateEvent {
  type: 'session_update';
  data: {
    sessionId: string;
    updates: Partial<ApiChatSession>;
  };
}

export interface WebSocketMessageStatusEvent {
  type: 'message_status';
  data: {
    messageId: string;
    status: number;
  };
}

export type WebSocketEvent = 
  | WebSocketMessageEvent 
  | WebSocketSessionUpdateEvent 
  | WebSocketMessageStatusEvent;


export const isWebSocketMessageEvent = (event: WebSocketEvent): event is WebSocketMessageEvent => {
  return event.type === 'message';
};

export const isWebSocketSessionUpdateEvent = (event: WebSocketEvent): event is WebSocketSessionUpdateEvent => {
  return event.type === 'session_update';
};

export const isWebSocketMessageStatusEvent = (event: WebSocketEvent): event is WebSocketMessageStatusEvent => {
  return event.type === 'message_status';
};
