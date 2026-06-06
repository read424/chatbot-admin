/**
 * Types for Channel Connections API V2
 * Based on: /api/v2/connections
 *
 * API Documentation: documentation/API_V2_CHANNEL_CONNECTIONS.md
 */

// ==================== Channel Types ====================

export type ChannelType =
  | 'whatsapp_web'
  | 'whatsapp_api'
  | 'instagram_direct'
  | 'facebook_messenger'
  | 'telegram'
  | 'webchat';

export type ConnectionStatus =
  | 'inactive'        // Conexión creada pero no activada
  | 'connecting'      // Intentando establecer conexión (WhatsApp Web)
  | 'authenticated'   // Autenticado exitosamente - QR escaneado (WhatsApp Web)
  | 'active'          // Conexión activa y funcionando (Meta, Telegram, WebChat)
  | 'disconnected'    // Conexión perdida o desconectada
  | 'error';          // Error en la conexión

// ==================== Connection Entities ====================

export interface ConnectionV2 {
  id: number;
  connectionName: string;
  channelType: ChannelType;
  tenantId: number;
  status: ConnectionStatus;
  isActive: boolean;
  departmentId: number | null;
  welcomeMessage: string | null;
  goodbyeMessage: string | null;
  chatbotTimeout: number;
  channelConfig: ChannelConfig;
  connectionMetadata: ConnectionMetadata;
  lastSeen: string | null;
  lastError: string | null;
  connectionAttempts: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ChannelConfig {
  // WhatsApp Web
  clientId?: string;
  phoneNumber?: string;
  sessionPath?: string;

  // Meta (Instagram/Facebook)
  accessToken?: string;
  verifyToken?: string;
  pageId?: string;
  pageAccessToken?: string;
  instagramAccountId?: string;

  // Telegram
  botToken?: string;
  botUsername?: string;

  [key: string]: any;
}

export interface ConnectionMetadata {
  lastActivity?: string;
  messagesCount?: number;
  activeConversations?: number;
  deviceInfo?: {
    platform?: string;
    manufacturer?: string;
    model?: string;
  };
  [key: string]: any;
}

// ==================== Credentials ====================

export interface ChannelCredentials {
  // Instagram Direct
  accessToken?: string;
  verifyToken?: string;
  pageId?: string;
  instagramAccountId?: string;

  // Facebook Messenger
  pageAccessToken?: string;

  // Telegram
  botToken?: string;
  botUsername?: string;
}

// ==================== Request Bodies ====================

export interface CreateConnectionRequest {
  connectionName: string;
  channelType: ChannelType;
  departmentId?: number;
  welcomeMessage?: string;
  goodbyeMessage?: string;
  chatbotTimeout?: number; // default: 30, min: 1, max: 1440
  channelCredentials?: ChannelCredentials; // Requerido para Meta y Telegram
}

export interface UpdateConnectionRequest {
  connectionName?: string;
  departmentId?: number;
  welcomeMessage?: string;
  goodbyeMessage?: string;
  chatbotTimeout?: number;
  channelCredentials?: ChannelCredentials;
}

export interface TestConnectionRequest {
  testPhoneNumber: string;
  testMessage?: string;
}

export interface DeactivateConnectionRequest {
  reason?: string;
}

// ==================== Response Bodies ====================

export interface ConnectionV2Response {
  success: boolean;
  message?: string;
  data: ConnectionV2;
  whatsappInfo?: {
    clientId: string;
    instructions: string;
  };
  webhookInfo?: {
    webhookUrl: string;
    verifyToken: string;
    instructions: string;
  };
}

export interface ConnectionsListResponse {
  success: boolean;
  data: {
    connections: ConnectionV2[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  };
}

export interface ConnectionDetailResponse {
  success: boolean;
  data: ConnectionV2;
}

export interface QRCodeResponse {
  success: boolean;
  data: {
    connectionId: number;
    connectionName: string;
    status: ConnectionStatus;
    qrCode?: string; // Base64 data URL
    qrCodeText?: string;
    expiresAt?: string;
    instructions?: string[];
    // Si ya está autenticado:
    message?: string;
    phoneNumber?: string;
    lastSeen?: string;
    deviceInfo?: {
      platform: string;
      manufacturer: string;
      model: string;
    };
  };
}

export interface ActivateConnectionResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    connectionName: string;
    status: ConnectionStatus;
    isActive: boolean;
    nextStep?: {
      action: string;
      endpoint: string;
      instructions: string;
    };
    webhookStatus?: string;
    webhookUrl?: string;
  };
}

export interface DeactivateConnectionResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    connectionName: string;
    status: ConnectionStatus;
    isActive: boolean;
    deactivatedAt: string;
  };
}

export interface DeleteConnectionResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    connectionName?: string;
    isActive?: boolean;
    deletedAt?: string;
    recoverable: boolean;
  };
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  data: {
    connectionId: number;
    testPhoneNumber: string;
    messageId: string;
    status: string;
    sentAt: string;
  };
}

export interface ConnectionStatsResponse {
  success: boolean;
  data: {
    connectionId: number;
    connectionName: string;
    period: string;
    stats: ConnectionStats;
    generatedAt: string;
  };
}

export interface ConnectionStats {
  totalMessages: number;
  incomingMessages: number;
  outgoingMessages: number;
  activeConversations: number;
  totalConversations: number;
  averageResponseTime: string; // Format: "HH:MM:SS"
  uptime: string; // Format: "99.8%"
  lastDowntime: string | null;
  messagesPerDay: Array<{
    date: string;
    count: number;
  }>;
  peakHours: Array<{
    hour: string;
    count: number;
  }>;
}

export interface ConnectionsSummaryResponse {
  success: boolean;
  data: {
    tenantId: number;
    summary: {
      totalConnections: number;
      activeConnections: number;
      inactiveConnections: number;
      byChannelType: Array<{
        channelType: ChannelType;
        count: number;
        active: number;
      }>;
      byStatus: Array<{
        status: ConnectionStatus;
        count: number;
      }>;
      totalMessages24h: number;
      activeConversations: number;
      averageResponseTime: string;
    };
    generatedAt: string;
  };
}

// ==================== Query Parameters ====================

export interface ConnectionsQueryParams {
  channelType?: ChannelType;
  status?: ConnectionStatus;
  isActive?: boolean;
  departmentId?: number;
  page?: number;      // default: 1
  limit?: number;     // default: 20, max: 100
}

export interface ConnectionStatsQueryParams {
  period?: 'today' | 'week' | 'month' | 'year'; // default: 'week'
  timezone?: string; // default: 'UTC'
}

// ==================== Error Responses ====================

export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: any;
}

// ==================== Type Guards ====================

export function isWhatsAppWeb(connection: ConnectionV2): boolean {
  return connection.channelType === 'whatsapp_web';
}

export function isMetaChannel(connection: ConnectionV2): boolean {
  return connection.channelType === 'instagram_direct'
    || connection.channelType === 'facebook_messenger';
}

export function isTelegram(connection: ConnectionV2): boolean {
  return connection.channelType === 'telegram';
}

export function isAuthenticated(connection: ConnectionV2): boolean {
  return connection.status === 'authenticated' || connection.status === 'active';
}

export function canActivate(connection: ConnectionV2): boolean {
  return connection.status === 'inactive' || connection.status === 'disconnected';
}

export function canDeactivate(connection: ConnectionV2): boolean {
  return connection.status === 'authenticated'
    || connection.status === 'active'
    || connection.status === 'connecting';
}

export function requiresQR(connection: ConnectionV2): boolean {
  return isWhatsAppWeb(connection)
    && (connection.status === 'connecting' || connection.status === 'inactive');
}

export function requiresCredentials(channelType: ChannelType): boolean {
  return channelType !== 'whatsapp_web' && channelType !== 'webchat';
}
