import type { Message, MessageStatus, MessageSenderType } from '@/types/inbox';
import type { BackendChatMessage } from '@/types/inbox';

/**
 * Convierte el estado numérico del backend a MessageStatus del frontend
 */
export function mapBackendStatusToMessageStatus(status: number): MessageStatus {
  switch (status) {
    case 0:
      return 'sending';
    case 1:
      return 'sent';
    case 2:
      return 'delivered';
    case 3:
      return 'read';
    case 4:
      return 'failed';
    default:
      return 'sent';
  }
}

/**
 * Determina el tipo de remitente basado en la dirección y responderType
 */
export function mapBackendSenderType(
  direction: 'incoming' | 'outgoing',
  responderType?: 'agent' | 'bot'
): MessageSenderType {
  if (direction === 'incoming') {
    return 'contact';
  }

  // Para mensajes outgoing
  if (responderType === 'bot') {
    return 'bot';
  }

  if (responderType === 'agent') {
    return 'agent';
  }

  // Default para mensajes salientes
  return 'agent';
}

/**
 * Transforma un mensaje del backend al formato del frontend
 *
 * @param backendMessage - Mensaje en formato del backend (ChatMessage entity)
 * @param conversationId - ID de la conversación (puede venir del payload o ser proporcionado)
 * @returns Mensaje en formato del frontend
 */
export function transformBackendMessageToFrontend(
  backendMessage: BackendChatMessage,
  conversationId: string
): Message {
  const senderType = mapBackendSenderType(
    backendMessage.direction,
    backendMessage.responderType
  );

  const message: Message = {
    id: backendMessage.id.toString(),
    content: backendMessage.content,
    senderId: backendMessage.direction === 'incoming'
      ? backendMessage.contactId.toString()
      : (backendMessage.respondedBy?.toString() || 'system'),
    receiverId: backendMessage.direction === 'incoming'
      ? (backendMessage.respondedBy?.toString() || 'system')
      : backendMessage.contactId.toString(),
    senderName: backendMessage.responderType === 'bot' ? 'Bot' : undefined,
    senderType,
    conversationId,
    timestamp: backendMessage.createdAt,
    type: backendMessage.messageType,
    channel: 'whatsapp', // TODO: Obtener del contexto de la conversación si está disponible
    status: mapBackendStatusToMessageStatus(backendMessage.status),
    metadata: backendMessage.metadata ? {
      ...backendMessage.metadata,
      originalChannel: 'whatsapp' // Agregar el campo requerido
    } : undefined,
    isEdited: false,
    createdAt: backendMessage.createdAt,
    updatedAt: backendMessage.updatedAt,
    isRead: backendMessage.status >= 3 // Status 3 = read
  };

  return message;
}

/**
 * Verifica si un mensaje es del usuario actual (agente)
 */
export function isOwnMessage(message: Message, currentUserId?: string): boolean {
  if (!currentUserId) return false;

  return (
    message.senderType === 'agent' &&
    message.senderId === currentUserId
  );
}

/**
 * Obtiene el nombre a mostrar para el remitente del mensaje
 */
export function getMessageSenderDisplayName(message: Message): string {
  if (message.senderName) {
    return message.senderName;
  }

  switch (message.senderType) {
    case 'bot':
    case 'system':
      return 'Bot';
    case 'agent':
      return 'Agente';
    case 'contact':
      return 'Cliente';
    default:
      return 'Usuario';
  }
}
