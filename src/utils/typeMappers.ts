import type { ApiChatMessage, ApiChatSession, ApiContact } from '@/types/api';
import type { Conversation, Message, MessageStatus, MessageType } from '@/types/chat';
import type { ProviderType } from '@/types/connections';
import type { Contact } from '@/types/contact';

/**
 * Convierte un ApiChatMessage a Message para la UI
 */
export const mapApiMessageToMessage = (apiMessage: ApiChatMessage): Message => ({
  id: apiMessage.id,
  content: apiMessage.content,
  senderId: apiMessage.direction === 'outgoing' ? 'agent' : apiMessage.contact.id,
  receiverId: apiMessage.direction === 'outgoing' ? apiMessage.contact.id : 'agent',
  senderName: apiMessage.direction === 'outgoing' ? 'Agente' : apiMessage.contact.name,
  senderType: apiMessage.direction === 'outgoing' ? 'agent' : 'contact',
  conversationId: apiMessage.chatSessionId,
  timestamp: apiMessage.createdAt,
  type: mapApiMessageTypeToMessageType(apiMessage.messageType),
  channel: 'whatsapp' as ProviderType,
  status: mapApiMessageStatusToMessageStatus(apiMessage.status),
  metadata: apiMessage.mediaUrl ? {
    originalChannel: 'whatsapp' as ProviderType,
    channelMessageId: apiMessage.whatsappMessageId,
    attachments: [{
      id: apiMessage.id,
      type: mapApiMessageTypeToAttachmentType(apiMessage.messageType),
      url: apiMessage.mediaUrl,
      filename: apiMessage.mediaMetadata?.filename || 'file',
      size: apiMessage.mediaMetadata?.size || 0,
      mimeType: apiMessage.mediaMetadata?.mimetype || 'text/plain'
    }],
    location: apiMessage.messageType === 'location' ? {
      latitude: apiMessage.mediaMetadata?.latitude || 0,
      longitude: apiMessage.mediaMetadata?.longitude || 0,
      address: apiMessage.mediaMetadata?.address
    } : undefined
  } : undefined,
  isEdited: false,
  createdAt: apiMessage.createdAt,
  isRead: apiMessage.status >= 2, // delivered or read
  updatedAt: apiMessage.updatedAt
});

/**
 * Convierte un ApiContact a Contact para la UI
 */
export const mapApiContactToContact = (apiContact: ApiContact): Contact => ({
  id: apiContact.id,
  name: apiContact.name || 'Sin nombre',
  phone: apiContact.phoneNumber,
  email: '',
  avatar: apiContact.avatarUrl,
  department: 'General',
  status: 'active',
  tags: [],
  notes: [],
  channels: [{
    type: 'whatsapp' as ProviderType,
    identifier: apiContact.phoneNumber,
    isPrimary: true,
    isVerified: true
  }],
  metadata: {
    source: 'whatsapp',
    customFields: apiContact.metadata || {},
    preferences: {
      language: 'es',
      timezone: 'America/Mexico_City',
      notifications: true
    }
  },
  createdAt: apiContact.createdAt || new Date().toISOString(),
  updatedAt: apiContact.updatedAt || new Date().toISOString()
});

/**
 * Convierte un ApiChatSession a Conversation para la UI
 */
export const mapApiSessionToConversation = (apiSession: ApiChatSession): Conversation => ({
  id: apiSession.id,
  contactId: apiSession.contact.id,
  contact: mapApiContactToContact(apiSession.contact),
  channel: 'whatsapp' as ProviderType,
  status: mapApiSessionStatusToConversationStatus(apiSession.status),
  assignedAgentId: apiSession.handledBy?.toString(),
  assignedAgent: apiSession.handledBy ? {
    id: apiSession.handledBy.toString(),
    name: 'Agente ' + apiSession.handledBy,
    email: '',
    role: 'agent' as const,
    department: 'General',
    avatar: '',
    status: 'online' as const,
    permissions: [],
    isActive: true,
    createdAt: apiSession.createdAt,
    updatedAt: apiSession.updatedAt
  } : undefined,
  department: 'General',
  lastMessage: apiSession.lastMessage ? mapApiMessageToMessage(apiSession.lastMessage) : undefined,
  unreadCount: apiSession.unreadCount || 0,
  tags: [],
  priority: 'normal' as const,
  notes: [],
  createdAt: apiSession.createdAt,
  updatedAt: apiSession.updatedAt
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convierte el tipo de mensaje de API a tipo de mensaje de UI
 */
const mapApiMessageTypeToMessageType = (apiType: string): MessageType => {
  switch (apiType) {
    case 'image':
      return 'image';
    case 'audio':
      return 'audio';
    case 'video':
      return 'video';
    case 'document':
      return 'file';
    case 'location':
      return 'location';
    case 'contact':
      return 'contact';
    default:
      return 'text';
  }
};

/**
 * Convierte el tipo de mensaje de API a tipo de attachment
 */
const mapApiMessageTypeToAttachmentType = (apiType: string): 'image' | 'file' | 'audio' | 'video' => {
  switch (apiType) {
    case 'image':
      return 'image';
    case 'audio':
      return 'audio';
    case 'video':
      return 'video';
    default:
      return 'file';
  }
};

/**
 * Convierte el status de mensaje de API a status de mensaje de UI
 */
const mapApiMessageStatusToMessageStatus = (apiStatus: number): MessageStatus => {
  switch (apiStatus) {
    case -1:
      return 'failed';
    case 0:
      return 'sending';
    case 1:
      return 'sent';
    case 2:
      return 'delivered';
    case 3:
      return 'read';
    default:
      return 'sending';
  }
};

/**
 * Convierte el status de sesión de API a status de conversación de UI
 */
const mapApiSessionStatusToConversationStatus = (apiStatus: string): 'active' | 'pending' | 'closed' | 'archived' => {
  switch (apiStatus) {
    case 'active':
      return 'active';
    case 'closed':
      return 'closed';
    case 'transferred':
      return 'pending';
    default:
      return 'active';
  }
};

// ============================================================================
// REVERSE MAPPERS (UI to API)
// ============================================================================

/**
 * Convierte un Message de UI a ApiChatMessage para enviar al backend
 */
export const mapMessageToApiMessage = (message: Partial<Message>): Partial<ApiChatMessage> => ({
  content: message.content,
  messageType: message.type === 'file' ? 'document' : message.type as any,
  direction: message.senderType === 'agent' ? 'outgoing' : 'incoming',
  status: 0, // sending
  chatSessionId: message.conversationId,
  contactId: message.senderType === 'contact' ? message.senderId : message.receiverId
});

/**
 * Convierte un Contact de UI a ApiContact para enviar al backend
 */
export const mapContactToApiContact = (contact: Partial<Contact>): Partial<ApiContact> => ({
  name: contact.name,
  phoneNumber: contact.phone,
  avatarUrl: contact.avatar,
  metadata: contact.metadata?.customFields
});

/**
 * Convierte una Conversation de UI a ApiChatSession para enviar al backend
 */
export const mapConversationToApiSession = (conversation: Partial<Conversation>): Partial<ApiChatSession> => ({
  status: conversation.status === 'closed' ? 'closed' : 'active',
  handledBy: conversation.assignedAgentId ? parseInt(conversation.assignedAgentId) : undefined,
  metadata: conversation.assignedAgent ? {
    assignedAgent: conversation.assignedAgent.name
  } : undefined
});
