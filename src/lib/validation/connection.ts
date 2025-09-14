import { z } from 'zod';

// Provider credentials validation schemas
export const whatsappBusinessCredentialsSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
  phoneNumberId: z.string().min(1, 'Phone number ID is required'),
  businessAccountId: z.string().min(1, 'Business account ID is required'),
  webhookVerifyToken: z.string().min(1, 'Webhook verify token is required'),
});

export const facebookCredentialsSchema = z.object({
  pageAccessToken: z.string().min(1, 'Page access token is required'),
  pageId: z.string().min(1, 'Page ID is required'),
  appId: z.string().min(1, 'App ID is required'),
  appSecret: z.string().min(1, 'App secret is required'),
});

export const telegramCredentialsSchema = z.object({
  botToken: z.string()
    .min(1, 'Bot token is required')
    .regex(/^\d+:[A-Za-z0-9_-]+$/, 'Invalid Telegram bot token format'),
  webhookUrl: z.string().url({ message: 'Invalid webhook URL' }).optional(),
});

export const instagramCredentialsSchema = z.object({
  pageAccessToken: z.string().min(1, 'Page access token is required'),
  pageId: z.string().min(1, 'Page ID is required'),
  appId: z.string().min(1, 'App ID is required'),
  appSecret: z.string().min(1, 'App secret is required'),
});

export const whatsappWebCredentialsSchema = z.object({
  sessionData: z.string().optional(),
});

export const chatwebCredentialsSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  apiSecret: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});

// Provider settings validation
export const providerSettingsSchema = z.object({
  maxRetries: z.number().min(1).max(10).default(3),
  retryDelay: z.number().min(100).max(30000).default(1000), // 100ms to 30s
  timeout: z.number().min(1000).max(60000).default(30000), // 1s to 60s
  rateLimit: z.object({
    requests: z.number().min(1).max(1000).default(100),
    window: z.number().min(1000).max(3600000).default(60000), // 1s to 1h
  }).optional(),
  features: z.object({
    supportsFiles: z.boolean().default(true),
    supportsImages: z.boolean().default(true),
    supportsAudio: z.boolean().default(true),
    supportsVideo: z.boolean().default(true),
    supportsLocation: z.boolean().default(true),
    supportsTemplates: z.boolean().default(false),
    supportsReadReceipts: z.boolean().default(true),
    supportsTypingIndicators: z.boolean().default(true),
  }).default({
    supportsFiles: true,
    supportsImages: true,
    supportsAudio: true,
    supportsVideo: true,
    supportsLocation: true,
    supportsTemplates: false,
    supportsReadReceipts: true,
    supportsTypingIndicators: true,
  }),
});

// Webhook configuration validation
export const webhookConfigSchema = z.object({
  url: z.string().url({ message: 'Invalid webhook URL' }),
  secret: z.string().min(8, 'Webhook secret must be at least 8 characters').optional(),
  events: z.array(z.string()).min(1, 'At least one event must be selected'),
  isActive: z.boolean().default(true),
});

// Connection configuration validation
export const connectionConfigSchema = z.object({
  credentials: z.union([
    whatsappBusinessCredentialsSchema,
    facebookCredentialsSchema,
    telegramCredentialsSchema,
    instagramCredentialsSchema,
    whatsappWebCredentialsSchema,
    chatwebCredentialsSchema,
  ]),
  settings: providerSettingsSchema.default({
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000,
    features: {
      supportsFiles: true,
      supportsImages: true,
      supportsAudio: true,
      supportsVideo: true,
      supportsLocation: true,
      supportsTemplates: false,
      supportsReadReceipts: true,
      supportsTypingIndicators: true,
    },
  }),
  webhook: webhookConfigSchema.optional(),
  chatbotEnabled: z.boolean().default(false),
  greetingMessage: z.string()
    .max(500, 'Greeting message must be less than 500 characters')
    .optional(),
  farewellMessage: z.string()
    .max(500, 'Farewell message must be less than 500 characters')
    .optional(),
  botResetMinutes: z.number().min(1).max(1440).default(30), // 1 minute to 24 hours
});

// Main connection validation schemas
export const createConnectionSchema = z.object({
  providerType: z.enum(['whatsapp', 'facebook', 'instagram', 'telegram', 'whatsapp_api', 'chatweb'] as const),
  name: z.string()
    .min(1, 'Connection name is required')
    .max(100, 'Connection name must be less than 100 characters'),
  department: z.string().min(1, 'Department is required'),
  config: connectionConfigSchema,
});

export const updateConnectionSchema = createConnectionSchema.extend({
  id: z.string().min(1, 'Connection ID is required'),
  status: z.enum(['active', 'inactive', 'error', 'connecting', 'disconnected', 'pending']).optional(),
}).partial().required({ id: true });

export const testConnectionSchema = z.object({
  id: z.string().min(1, 'Connection ID is required'),
  testMessage: z.string()
    .max(1000, 'Test message must be less than 1000 characters')
    .default('Test message from connection'),
});

// Connection filters validation
export const connectionFiltersSchema = z.object({
  provider: z.enum(['whatsapp', 'facebook', 'instagram', 'telegram', 'whatsapp_api', 'chatweb'] as const).optional(),
  status: z.enum(['active', 'inactive', 'error', 'connecting', 'disconnected', 'pending']).optional(),
  department: z.string().optional(),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Department validation schemas
export const createDepartmentSchema = z.object({
  name: z.string()
    .min(1, 'Department name is required')
    .max(100, 'Department name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  managerId: z.string().optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.extend({
  id: z.string().min(1, 'Department ID is required'),
  isActive: z.boolean().optional(),
}).partial().required({ id: true });

// Provider-specific validation functions
export const validateProviderCredentials = (providerType: string, credentials: unknown) => {
  switch (providerType) {
    case 'whatsapp_api':
      return whatsappBusinessCredentialsSchema.parse(credentials);
    case 'facebook':
      return facebookCredentialsSchema.parse(credentials);
    case 'telegram':
      return telegramCredentialsSchema.parse(credentials);
    case 'instagram':
      return instagramCredentialsSchema.parse(credentials);
    case 'whatsapp':
      return whatsappWebCredentialsSchema.parse(credentials);
    case 'chatweb':
      return chatwebCredentialsSchema.parse(credentials);
    default:
      throw new Error(`Unsupported provider type: ${providerType}`);
  }
};

// Webhook URL validation for different providers
export const validateWebhookUrl = (providerType: string, url: string) => {
  const urlSchema = z.string().url({ message: 'Invalid webhook URL' });
  const parsedUrl = urlSchema.parse(url);
  
  // Additional provider-specific validations
  switch (providerType) {
    case 'whatsapp_api':
      // WhatsApp requires HTTPS
      if (!parsedUrl.startsWith('https://')) {
        throw new Error('WhatsApp webhook URL must use HTTPS');
      }
      break;
    case 'telegram':
      // Telegram requires HTTPS for webhooks
      if (!parsedUrl.startsWith('https://')) {
        throw new Error('Telegram webhook URL must use HTTPS');
      }
      break;
  }
  
  return parsedUrl;
};

// Connection health validation
export const connectionHealthSchema = z.object({
  isHealthy: z.boolean(),
  lastCheck: z.string().datetime({ message: 'Invalid datetime format' }),
  uptime: z.number().min(0).max(100), // percentage
  responseTime: z.number().min(0), // milliseconds
  errorRate: z.number().min(0).max(100), // percentage
  lastError: z.object({
    message: z.string(),
    timestamp: z.string().datetime({ message: 'Invalid timestamp format' }),
    code: z.string().optional(),
  }).optional(),
  metrics: z.object({
    messagesSent: z.number().min(0),
    messagesReceived: z.number().min(0),
    errors: z.number().min(0),
    period: z.string(), // e.g., "24h", "7d"
  }),
});

// Type inference from schemas
export type CreateConnectionInput = z.infer<typeof createConnectionSchema>;
export type UpdateConnectionInput = z.infer<typeof updateConnectionSchema>;
export type TestConnectionInput = z.infer<typeof testConnectionSchema>;
export type ConnectionFiltersInput = z.infer<typeof connectionFiltersSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type ConnectionHealthInput = z.infer<typeof connectionHealthSchema>;

// Provider-specific credential types
export type WhatsAppBusinessCredentials = z.infer<typeof whatsappBusinessCredentialsSchema>;
export type FacebookCredentials = z.infer<typeof facebookCredentialsSchema>;
export type TelegramCredentials = z.infer<typeof telegramCredentialsSchema>;
export type InstagramCredentials = z.infer<typeof instagramCredentialsSchema>;
export type WhatsAppWebCredentials = z.infer<typeof whatsappWebCredentialsSchema>;
export type ChatWebCredentials = z.infer<typeof chatwebCredentialsSchema>;