import { ProviderType } from './connections';

// Chatbot configuration interfaces
export interface ChatbotConfig {
  id: string;
  connectionId: string;
  isEnabled: boolean;
  rules: ChatbotRule[];
  fallbackMessage: string;
  transferToDepartment?: string;
  workingHours?: WorkingHours;
  settings: ChatbotSettings;
  createdAt: string;
  updatedAt: string;
}

export interface ChatbotRule {
  id: string;
  name: string;
  trigger: TriggerCondition;
  response: BotResponse;
  isActive: boolean;
  channels: ProviderType[];
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface TriggerCondition {
  type: 'keyword' | 'pattern' | 'intent' | 'exact_match';
  value: string;
  caseSensitive: boolean;
  matchType: 'contains' | 'starts_with' | 'ends_with' | 'exact';
}

export interface BotResponse {
  type: 'text' | 'template' | 'transfer' | 'menu';
  content: string;
  transferToDepartment?: string;
  transferToAgent?: string;
  menuOptions?: MenuOption[];
  delay?: number; // milliseconds
}

export interface MenuOption {
  id: string;
  text: string;
  value: string;
  action: 'reply' | 'transfer' | 'trigger_rule';
  actionValue?: string;
}

export interface WorkingHours {
  enabled: boolean;
  timezone: string;
  schedule: DaySchedule[];
  outsideHoursMessage: string;
  outsideHoursAction: 'message_only' | 'transfer' | 'queue';
}

export interface DaySchedule {
  day: number; // 0-6 (Sunday-Saturday)
  isActive: boolean;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface ChatbotSettings {
  responseDelay: number; // milliseconds
  maxRetries: number;
  escalationKeywords: string[];
  collectUserInfo: boolean;
  enableTypingIndicator: boolean;
  enableReadReceipts: boolean;
  sessionTimeout: number; // minutes
}

// Chatbot request types
export interface CreateChatbotConfigRequest {
  connectionId: string;
  isEnabled?: boolean;
  fallbackMessage: string;
  transferToDepartment?: string;
  workingHours?: Omit<WorkingHours, 'timezone'> & { timezone?: string };
  settings?: Partial<ChatbotSettings>;
}

export interface UpdateChatbotConfigRequest extends Partial<CreateChatbotConfigRequest> {
  id: string;
}

export interface CreateChatbotRuleRequest {
  chatbotConfigId: string;
  name: string;
  trigger: TriggerCondition;
  response: BotResponse;
  channels: ProviderType[];
  priority?: number;
}

export interface UpdateChatbotRuleRequest extends Partial<CreateChatbotRuleRequest> {
  id: string;
}

// Chatbot testing and analytics
export interface ChatbotTestRequest {
  configId: string;
  message: string;
  channel: ProviderType;
  contactId?: string;
}

export interface ChatbotTestResponse {
  success: boolean;
  matchedRule?: ChatbotRule;
  response?: BotResponse;
  shouldTransfer: boolean;
  transferTarget?: string;
  processingTime: number;
}

export interface ChatbotAnalytics {
  configId: string;
  period: {
    from: string;
    to: string;
  };
  totalInteractions: number;
  resolvedByBot: number;
  transferredToAgent: number;
  rulePerformance: Array<{
    ruleId: string;
    ruleName: string;
    triggers: number;
    successRate: number;
  }>;
  channelBreakdown: Array<{
    channel: ProviderType;
    interactions: number;
    resolution_rate: number;
  }>;
}

// Chatbot API responses
export interface ChatbotConfigResponse {
  success: boolean;
  data: ChatbotConfig;
}

export interface ChatbotConfigsListResponse {
  success: boolean;
  data: ChatbotConfig[];
  total: number;
}

export interface ChatbotRuleResponse {
  success: boolean;
  data: ChatbotRule;
}

export interface ChatbotRulesListResponse {
  success: boolean;
  data: ChatbotRule[];
  total: number;
}