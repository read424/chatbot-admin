import { ProviderType } from './connections';
import { Contact } from './contact';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  senderName?: string;
  senderType: MessageSenderType;
  conversationId: string;
  timestamp: string;
  type: MessageType;
  channel: ProviderType;
  status: MessageStatus;
  metadata?: MessageMetadata;
  replyTo?: string; // ID of message being replied to
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
}

export type MessageSenderType = 'contact' | 'agent' | 'system' | 'bot';

export type MessageType = 
  | 'text' 
  | 'image' 
  | 'file' 
  | 'audio' 
  | 'video' 
  | 'location' 
  | 'contact' 
  | 'sticker' 
  | 'template';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageMetadata {
  originalChannel: ProviderType;
  channelMessageId?: string;
  attachments?: Attachment[];
  location?: LocationData;
  contact?: ContactData;
  template?: TemplateData;
  reactions?: MessageReaction[];
  mentions?: string[]; // User IDs mentioned in message
}

export interface Attachment {
  id: string;
  type: AttachmentType;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
}

export type AttachmentType = 'image' | 'file' | 'audio' | 'video';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export interface ContactData {
  name: string;
  phone?: string;
  email?: string;
  organization?: string;
}

export interface TemplateData {
  templateId: string;
  templateName: string;
  parameters: Record<string, string>;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  contactId: string;
  contact: Contact;
  channel: ProviderType;
  status: ConversationStatus;
  assignedAgentId?: string;
  assignedAgent?: ConversationAgent;
  department: string;
  lastMessage?: Message;
  unreadCount: number;
  tags: string[];
  priority: ConversationPriority;
  notes: ConversationNote[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  archivedAt?: string;
}

export type ConversationStatus = 'active' | 'pending' | 'closed' | 'archived';

export type ConversationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface ConversationNote {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  isInternal: boolean; // Internal notes not visible to contact
  createdAt: string;
  updatedAt: string;
}

export interface ConversationAgent {
  id: string;
  name: string;
  email: string;
  role: AgentRole;
  department?: string;
  avatar?: string;
  status: AgentStatus;
}

export type AgentRole = 'admin' | 'supervisor' | 'agent';

export type AgentStatus = 'online' | 'away' | 'busy' | 'offline';

export interface ConversationFilters {
  search?: string;
  channel?: ProviderType | 'all';
  status?: ConversationStatus | 'all';
  assignedTo?: string | 'unassigned' | 'all';
  department?: string | 'all';
  priority?: ConversationPriority | 'all';
  tags?: string[];
  dateRange?: DateRange;
  hasUnread?: boolean;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface ConversationSort {
  field: 'lastMessage' | 'createdAt' | 'priority' | 'unreadCount';
  direction: 'asc' | 'desc';
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type?: MessageType;
  replyTo?: string;
  metadata?: Partial<MessageMetadata>;
}

export interface SendMessageWithAttachmentsRequest extends SendMessageRequest {
  attachments?: File[];
}

export interface UpdateMessageRequest {
  id: string;
  content: string;
}

export interface CreateConversationNoteRequest {
  conversationId: string;
  content: string;
  isInternal: boolean;
}

export interface UpdateConversationRequest {
  assignedAgentId?: string;
  department?: string;
  priority?: ConversationPriority;
  status?: ConversationStatus;
  tags?: string[];
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface MessageListResponse {
  messages: Message[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ===============================
// REAL-TIME TYPES
// ===============================

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: string;
}

export interface InboxEvent {
  type: InboxEventType;
  data: unknown;
  timestamp: string;
  tenantId?: string;
}

export type InboxEventType = 
  | 'message_received'
  | 'message_sent'
  | 'message_read'
  | 'message_delivered'
  | 'typing_start'
  | 'typing_stop'
  | 'conversation_assigned'
  | 'conversation_closed'
  | 'agent_status_changed'
  | 'conversation_updated';

export interface MessageEvent extends InboxEvent {
  type: 'message_received' | 'message_sent' | 'message_read' | 'message_delivered';
  data: {
    message: Message;
    conversationId: string;
  };
}

export interface TypingEvent extends InboxEvent {
  type: 'typing_start' | 'typing_stop';
  data: TypingIndicator;
}

export interface ConversationAssignedEvent extends InboxEvent {
  type: 'conversation_assigned';
  data: {
    conversationId: string;
    agentId: string;
    agentName: string;
  };
}

export interface InboxUIState {
  selectedConversationId?: string;
  filters: ConversationFilters;
  sort: ConversationSort;
  searchTerm: string;
  showFilters: boolean;
  showCustomerInfo: boolean;
  isLoading: boolean;
}

export interface MessageInputState {
  message: string;
  attachments: File[];
  replyTo?: Message;
  isUploading: boolean;
}

export interface CustomerInfoPanelState {
  isEditingContact: boolean;
  isAddingNote: boolean;
  newNote: string;
  selectedNoteType: 'public' | 'internal';
}

/**
 * @deprecated Use Conversation instead
 * Legacy Chat interface for backward compatibility
 */
export interface LegacyChat {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  additionalPhones: string[];
  lastMessage: string;
  timestamp: string;
  unread: number;
  assignedTo?: string;
  status: 'online' | 'offline';
  messages: Message[];
}

export interface MessageValidation {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}


export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export type {
    ProviderType
} from './connections';

export type MessageWithConversation = Message & { conversation: Conversation };
export type ConversationWithMessages = Conversation & { messages: Message[] };
export type ConversationSummary = Pick<Conversation, 'id' | 'contactId' | 'channel' | 'status' | 'unreadCount' | 'lastMessage'>;