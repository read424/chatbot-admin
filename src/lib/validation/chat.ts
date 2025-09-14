import { z } from 'zod';

// Message validation schemas
export const attachmentSchema = z.object({
  id: z.string().min(1, 'Attachment ID is required'),
  type: z.enum(['image', 'file', 'audio', 'video']),
  url: z.string().url({ message: 'Invalid attachment URL' }),
  filename: z.string().min(1, 'Filename is required'),
  size: z.number().min(1, 'File size must be greater than 0'),
  mimeType: z.string().min(1, 'MIME type is required'),
  thumbnail: z.string().url({ message: 'Invalid thumbnail URL' }).optional(),
});

export const locationDataSchema = z.object({
  latitude: z.number().min(-90).max(90, 'Invalid latitude'),
  longitude: z.number().min(-180).max(180, 'Invalid longitude'),
  address: z.string().optional(),
  name: z.string().optional(),
});

export const contactDataSchema = z.object({
  name: z.string().min(1, 'Contact name is required'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  email: z.string().email({ message: 'Invalid email' }).optional(),
  organization: z.string().optional(),
});

export const templateDataSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  templateName: z.string().min(1, 'Template name is required'),
  parameters: z.record(z.string(), z.string()).default({}),
});

export const messageReactionSchema = z.object({
  emoji: z.string().min(1, 'Emoji is required'),
  userId: z.string().min(1, 'User ID is required'),
  userName: z.string().min(1, 'User name is required'),
  timestamp: z.string().datetime({ message: 'Invalid timestamp' }),
});

export const messageMetadataSchema = z.object({
  originalChannel: z.enum(['whatsapp', 'facebook', 'instagram', 'telegram', 'whatsapp_api', 'chatweb'] as const),
  channelMessageId: z.string().optional(),
  attachments: z.array(attachmentSchema).optional(),
  location: locationDataSchema.optional(),
  contact: contactDataSchema.optional(),
  template: templateDataSchema.optional(),
  reactions: z.array(messageReactionSchema).optional(),
  mentions: z.array(z.string()).optional(),
});

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  content: z.string()
    .min(1, 'Message content is required')
    .max(4096, 'Message content must be less than 4096 characters'),
  type: z.enum(['text', 'image', 'file', 'audio', 'video', 'location', 'contact', 'sticker', 'template']).default('text'),
  replyTo: z.string().optional(),
  metadata: messageMetadataSchema.optional(),
});

export const updateMessageSchema = z.object({
  id: z.string().min(1, 'Message ID is required'),
  content: z.string()
    .min(1, 'Message content is required')
    .max(4096, 'Message content must be less than 4096 characters'),
});

// Conversation validation schemas
export const conversationNoteSchema = z.object({
  content: z.string()
    .min(1, 'Note content is required')
    .max(1000, 'Note must be less than 1000 characters'),
  isInternal: z.boolean().default(false),
  conversationId: z.string().min(1, 'Conversation ID is required'),
});

export const assignConversationSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  agentId: z.string().min(1, 'Agent ID is required'),
});

export const updateConversationSchema = z.object({
  id: z.string().min(1, 'Conversation ID is required'),
  status: z.enum(['active', 'pending', 'closed', 'archived']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  tags: z.array(z.string()).optional(),
  assignedAgentId: z.string().optional(),
});

export const conversationFiltersSchema = z.object({
  search: z.string().optional(),
  channel: z.enum(['whatsapp', 'facebook', 'instagram', 'telegram', 'whatsapp_api', 'chatweb'] as const).optional(),
  status: z.enum(['active', 'pending', 'closed', 'archived']).optional(),
  assignedTo: z.string().optional(),
  department: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  tags: z.array(z.string()).optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }).optional(),
  hasUnread: z.boolean().optional(),
});

// User validation schemas
export const updateUserStatusSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  status: z.enum(['online', 'away', 'busy', 'offline']),
});

export const createUserSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  role: z.enum(['admin', 'supervisor', 'agent']),
  department: z.string().optional(),
});

export const updateUserSchema = createUserSchema.extend({
  id: z.string().min(1, 'User ID is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
    .optional(),
  isActive: z.boolean().optional(),
}).partial().required({ id: true });

// Typing indicator validation
export const typingIndicatorSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  isTyping: z.boolean(),
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'File is required' }),
  conversationId: z.string().min(1, 'Conversation ID is required'),
  type: z.enum(['image', 'file', 'audio', 'video']).optional(),
}).refine((data) => {
  // Max file size: 50MB
  return data.file.size <= 50 * 1024 * 1024;
}, {
  message: 'File size must be less than 50MB',
}).refine((data) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'audio/mpeg', 'audio/wav', 'audio/ogg',
    'video/mp4', 'video/webm', 'video/ogg',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv'
  ];
  return allowedTypes.includes(data.file.type);
}, {
  message: 'File type not supported',
});

// Pagination validation
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Type inference from schemas
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
export type ConversationNoteInput = z.infer<typeof conversationNoteSchema>;
export type AssignConversationInput = z.infer<typeof assignConversationSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
export type ConversationFiltersInput = z.infer<typeof conversationFiltersSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type TypingIndicatorInput = z.infer<typeof typingIndicatorSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;