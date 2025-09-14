import { z } from 'zod';

// Contact validation schemas
export const contactChannelSchema = z.object({
  type: z.enum(['whatsapp', 'facebook', 'instagram', 'telegram', 'whatsapp_api', 'chatweb'] as const),
  identifier: z.string().min(1, 'Identifier is required'),
  isPrimary: z.boolean().default(false),
});

export const contactMetadataSchema = z.object({
  source: z.string().default('manual'),
  customFields: z.record(z.string(), z.unknown()).default({}),
  preferences: z.object({
    language: z.string().default('es'),
    timezone: z.string().default('America/Mexico_City'),
    notifications: z.boolean().default(true),
  }).default({
    language: 'es',
    timezone: 'America/Mexico_City',
    notifications: true,
  }),
});

export const createContactSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  email: z.string()
    .email({ message: 'Invalid email format' })
    .optional(),
  department: z.string()
    .min(1, 'Department is required'),
  assignedAgent: z.string().optional(),
  tags: z.array(z.string()).default([]),
  channels: z.array(contactChannelSchema).default([]),
  metadata: contactMetadataSchema.optional(),
});

export const updateContactSchema = createContactSchema.extend({
  id: z.string().min(1, 'Contact ID is required'),
  status: z.enum(['active', 'inactive', 'blocked']).optional(),
}).partial().required({ id: true });

export const contactFiltersSchema = z.object({
  search: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(['active', 'inactive', 'blocked']).optional(),
  assignedAgent: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }).optional(),
  channel: z.enum(['whatsapp', 'facebook', 'instagram', 'telegram', 'whatsapp_api', 'chatweb'] as const).optional(),
});

export const contactNoteSchema = z.object({
  content: z.string()
    .min(1, 'Note content is required')
    .max(1000, 'Note must be less than 1000 characters'),
  contactId: z.string().min(1, 'Contact ID is required'),
});

// Type inference from schemas
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ContactFiltersInput = z.infer<typeof contactFiltersSchema>;
export type ContactNoteInput = z.infer<typeof contactNoteSchema>;