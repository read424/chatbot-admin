export type ProviderType = 'whatsapp' | 'facebook' | 'instagram' | 'telegram' | 'whatsapp_api' | 'chatweb';

export interface Connection {
    id: string;
    name: string;
    providerType: ProviderType;
    department: string;
    status: ConnectionStatus;
    isActive: boolean;
    config: ConnectionConfig;
    health: ConnectionHealth;
    lastMessage?: string;
    createdAt: string;
    updatedAt: string;
    lastConnectedAt?: string;
}

export type ConnectionStatus = 'active' | 'inactive' | 'error' | 'connecting' | 'disconnected' | 'pending';

export interface ConnectionConfig {
    credentials: ProviderCredentials;
    settings: ProviderSettings;
    webhook?: WebhookConfig;
    chatbotEnabled: boolean;
    greetingMessage?: string;
    farewellMessage?: string;
    botResetMinutes: number;
}

export interface ProviderCredentials {
    // WhatsApp Business API
    accessToken?: string;
    phoneNumberId?: string;
    businessAccountId?: string;
    webhookVerifyToken?: string;
    
    // Facebook/Instagram
    pageAccessToken?: string;
    pageId?: string;
    appId?: string;
    appSecret?: string;
    
    // Telegram
    botToken?: string;
    webhookUrl?: string;
    
    // WhatsApp Web (for web-based connections)
    sessionData?: string;
    
    // Generic fields
    apiKey?: string;
    apiSecret?: string;
    username?: string;
    password?: string;
}

export interface ProviderSettings {
    maxRetries: number;
    retryDelay: number; // milliseconds
    timeout: number; // milliseconds
    rateLimit?: {
        requests: number;
        window: number; // milliseconds
    };
    features: {
        supportsFiles: boolean;
        supportsImages: boolean;
        supportsAudio: boolean;
        supportsVideo: boolean;
        supportsLocation: boolean;
        supportsTemplates: boolean;
        supportsReadReceipts: boolean;
        supportsTypingIndicators: boolean;
    };
}

export interface WebhookConfig {
    url: string;
    secret?: string;
    events: string[];
    isActive: boolean;
    lastTriggered?: string;
    failureCount: number;
}

export interface ConnectionHealth {
    isHealthy: boolean;
    lastCheck: string;
    uptime: number; // percentage
    responseTime: number; // milliseconds
    errorRate: number; // percentage
    lastError?: {
        message: string;
        timestamp: string;
        code?: string;
    };
    metrics: {
        messagesSent: number;
        messagesReceived: number;
        errors: number;
        period: string; // e.g., "24h", "7d"
    };
}

export interface CreateConnectionRequest {
    providerType: ProviderType;
    name: string;
    greetingMessage: string;
    farewellMessage: string;
    department: string;
    botResetMinutes: number;
    config: Omit<ConnectionConfig, 'chatbotEnabled'> & {
        chatbotEnabled?: boolean;
    };
}

export interface UpdateConnectionRequest extends Partial<CreateConnectionRequest> {
    id: string;
    status?: ConnectionStatus;
}

export interface TestConnectionRequest {
    id: string;
    testMessage?: string;
}

export interface TestConnectionResponse {
    success: boolean;
    responseTime: number;
    error?: string;
    details?: Record<string, unknown>;
}

export interface ConnectionsListResponse {
    success: boolean;
    data: Connection[];
    total: number;
    page: number;
    limit: number;
}

export interface ConnectionResponse {
    success: boolean;
    data: Connection;
}

export interface CreateConnectionResponse {
    success: boolean;
    message: string;
    data: Connection;
}

export interface ConnectionFilters {
    provider?: ProviderType;
    status?: ConnectionStatus;
    department?: string;
    search?: string;
    isActive?: boolean;
}

export interface Department {
    id: string;
    name: string;
    description?: string;
    manager?: {
        id: string;
        name: string;
    };
    isActive: boolean;
    usersCount: number;
    connectionsCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface TenantContext {
    tenantId: string;
    tenantName?: string;
    settings?: Record<string, unknown>;
}

// Provider-specific types
export interface WhatsAppBusinessConfig extends ProviderCredentials {
    accessToken: string;
    phoneNumberId: string;
    businessAccountId: string;
    webhookVerifyToken: string;
}

export interface FacebookConfig extends ProviderCredentials {
    pageAccessToken: string;
    pageId: string;
    appId: string;
    appSecret: string;
}

export interface TelegramConfig extends ProviderCredentials {
    botToken: string;
    webhookUrl?: string;
}

export interface InstagramConfig extends ProviderCredentials {
    pageAccessToken: string;
    pageId: string;
    appId: string;
    appSecret: string;
}

// Connection statistics
export interface ConnectionStats {
    totalConnections: number;
    activeConnections: number;
    errorConnections: number;
    byProvider: Array<{
        provider: ProviderType;
        count: number;
        activeCount: number;
    }>;
    byDepartment: Array<{
        department: string;
        count: number;
        activeCount: number;
    }>;
    healthOverview: {
        healthy: number;
        degraded: number;
        unhealthy: number;
    };
}