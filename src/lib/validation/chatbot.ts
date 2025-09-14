import { z } from 'zod';

// Chatbot validation schemas
export const triggerConditionSchema = z.object({
  type: z.enum(['keyword', 'pattern', 'intent', 'exact_match']),
  value: z.string().min(1, 'Trigger value is required'),
  caseSensitive: z.boolean().default(false),
  matchType: z.enum(['contains', 'starts_with', 'ends_with', 'exact']).default('contains'),
});

export const menuOptionSchema = z.object({
  id: z.string().min(1, 'Menu option ID is required'),
  text: z.string().min(1, 'Menu option text is required'),
  value: z.string().min(1, 'Menu option value is required'),
  action: z.enum(['reply', 'transfer', 'trigger_rule']),
  actionValue: z.string().optional(),
});

export const botResponseSchema = z.object({
  type: z.enum(['text', 'template', 'transfer', 'menu']),
  content: z.string().min(1, 'Response content is required'),
  transferToDepartment: z.string().optional(),
  transferToAgent: z.string().optional(),
  menuOptions: z.array(menuOptionSchema).optional(),
  delay: z.number().min(0).max(10000).default(0), // max 10 seconds
});

export const dayScheduleSchema = z.object({
  day: z.number().min(0).max(6), // 0-6 (Sunday-Saturday)
  isActive: z.boolean().default(true),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
});

export const workingHoursSchema = z.object({
  enabled: z.boolean().default(false),
  timezone: z.string().default('America/Mexico_City'),
  schedule: z.array(dayScheduleSchema).length(7, 'Schedule must include all 7 days'),
  outsideHoursMessage: z.string().min(1, 'Outside hours message is required'),
  outsideHoursAction: z.enum(['message_only', 'transfer', 'queue']).default('message_only'),
});

export const chatbotSettingsSchema = z.object({
  responseDelay: z.number().min(0).max(5000).default(1000), // max 5 seconds
  maxRetries: z.number().min(1).max(10).default(3),
  escalationKeywords: z.array(z.string()).default(['agent', 'human', 'help', 'support']),
  collectUserInfo: z.boolean().default(true),
  enableTypingIndicator: z.boolean().default(true),
  enableReadReceipts: z.boolean().default(true),
  sessionTimeout: z.number().min(5).max(1440).default(30), // 5 minutes to 24 hours
});

export const createChatbotRuleSchema = z.object({
  chatbotConfigId: z.string().min(1, 'Chatbot config ID is required'),
  name: z.string()
    .min(1, 'Rule name is required')
    .max(100, 'Rule name must be less than 100 characters'),
  trigger: triggerConditionSchema,
  response: botResponseSchema,
  channels: z.array(z.enum(['whatsapp', 'facebook', 'instagram', 'telegram', 'whatsapp_api', 'chatweb'] as const))
    .min(1, 'At least one channel must be selected'),
  priority: z.number().min(1).max(100).default(50),
});

export const updateChatbotRuleSchema = createChatbotRuleSchema.extend({
  id: z.string().min(1, 'Rule ID is required'),
}).partial().required({ id: true });

export const createChatbotConfigSchema = z.object({
  connectionId: z.string().min(1, 'Connection ID is required'),
  isEnabled: z.boolean().default(true),
  fallbackMessage: z.string()
    .min(1, 'Fallback message is required')
    .max(500, 'Fallback message must be less than 500 characters'),
  transferToDepartment: z.string().optional(),
  workingHours: workingHoursSchema.optional(),
  settings: chatbotSettingsSchema.default({
    responseDelay: 1000,
    maxRetries: 3,
    escalationKeywords: ['agent', 'human', 'help', 'support'],
    collectUserInfo: true,
    enableTypingIndicator: true,
    enableReadReceipts: true,
    sessionTimeout: 30,
  }),
});

export const updateChatbotConfigSchema = createChatbotConfigSchema.extend({
  id: z.string().min(1, 'Config ID is required'),
}).partial().required({ id: true });

export const chatbotTestSchema = z.object({
  configId: z.string().min(1, 'Config ID is required'),
  message: z.string()
    .min(1, 'Test message is required')
    .max(1000, 'Test message must be less than 1000 characters'),
  channel: z.enum(['whatsapp', 'facebook', 'instagram', 'telegram', 'whatsapp_api', 'chatweb'] as const),
  contactId: z.string().optional(),
});

// Validation for rule conflicts
export const validateRuleConflicts = (rules: Array<{ trigger: { type: string; value: string; matchType: string; caseSensitive: boolean }; priority: number }>) => {
  const conflicts: Array<{ rule1: number; rule2: number; reason: string }> = [];
  
  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      const rule1 = rules[i];
      const rule2 = rules[j];
      
      // Check for exact trigger matches
      if (rule1.trigger.type === rule2.trigger.type && 
          rule1.trigger.value === rule2.trigger.value &&
          rule1.trigger.matchType === rule2.trigger.matchType) {
        conflicts.push({
          rule1: i,
          rule2: j,
          reason: 'Identical trigger conditions'
        });
      }
      
      // Check for overlapping keyword triggers
      if (rule1.trigger.type === 'keyword' && rule2.trigger.type === 'keyword') {
        const value1 = rule1.trigger.caseSensitive ? rule1.trigger.value : rule1.trigger.value.toLowerCase();
        const value2 = rule2.trigger.caseSensitive ? rule2.trigger.value : rule2.trigger.value.toLowerCase();
        
        if (value1.includes(value2) || value2.includes(value1)) {
          conflicts.push({
            rule1: i,
            rule2: j,
            reason: 'Overlapping keyword triggers'
          });
        }
      }
    }
  }
  
  return conflicts;
};

// Type inference from schemas
export type CreateChatbotRuleInput = z.infer<typeof createChatbotRuleSchema>;
export type UpdateChatbotRuleInput = z.infer<typeof updateChatbotRuleSchema>;
export type CreateChatbotConfigInput = z.infer<typeof createChatbotConfigSchema>;
export type UpdateChatbotConfigInput = z.infer<typeof updateChatbotConfigSchema>;
export type ChatbotTestInput = z.infer<typeof chatbotTestSchema>;