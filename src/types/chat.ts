import { ProviderType } from './connections';
import { Contact } from './contact';

// Enhanced Message interface for multi-channel support
export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  senderName?: string;
  senderType: 'contact' | 'agent' | 'system' | 'bot';
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
  isRead: boolean;
  updatedAt: string;
}

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'contact' | 'sticker' | 'template';

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
  type: 'image' | 'file' | 'audio' | 'video';
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
}

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

// Enhanced Conversation interface
export interface Conversation {
  id: string;
  contactId: string;
  contact: Contact;
  channel: ProviderType;
  status: ConversationStatus;
  assignedAgentId?: string;
  assignedAgent?: User;
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
}

// Legacy Chat interface for backward compatibility
export interface Chat {
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  status: UserStatus;
  permissions: string[];
  isActive: boolean;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'supervisor' | 'agent';

export type UserStatus = 'online' | 'away' | 'busy' | 'offline';

// Enhanced filters and search
export interface ChatFilters {
  searchTerm: string;
  assignedTo?: string;
  status?: 'online' | 'offline' | 'all';
}

export interface ConversationFilters {
  search?: string;
  channel?: ProviderType;
  status?: ConversationStatus;
  assignedTo?: string;
  department?: string;
  priority?: ConversationPriority;
  tags?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  hasUnread?: boolean;
}

// Message request types
export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type?: MessageType;
  replyTo?: string;
  metadata?: Partial<MessageMetadata>;
}

export interface UpdateMessageRequest {
  id: string;
  content: string;
}

// Typing indicators
export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: string;
}

// Real-time events
export interface ChatEvent {
  type: 'message' | 'typing' | 'read' | 'delivered' | 'user_status' | 'conversation_assigned';
  data: unknown;
  timestamp: string;
}

// API Response types
export interface ConversationResponse {
  success: boolean;
  data: Conversation;
}

export interface ConversationsListResponse {
  success: boolean;
  data: Conversation[];
  total: number;
  page: number;
  limit: number;
}

export interface MessagesListResponse {
  success: boolean;
  data: Message[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface MessageResponse {
  success: boolean;
  data: Message;
}