
export interface QRCodeEventData {
    qr: string;
    clientId: string;
    attempt: number;
    maxAttempts: number;
    timeoutSeconds?: number;
}

export interface QRTimeoutEventData {
    clientId: string;
    tenantId: string;
    attempts: number;
    maxAttempts: number;
    message: string;
    timestamp: string;
}

export interface WhatsAppReadyEventData {
    clientId: string;
    tenantId: string;
    phoneNumber: string | null;
    timestamp: string;
}

export interface ConnectionReadyEventData {
    clientId: string;
    tenantId: string;
    timestamp: string;
}

export interface WhatsAppDisconnectedEventData {
    clientId: string;
    tenantId: string;
    reason: string;
    timestamp: string;
}

export interface LoadingScreenEventData {
    clientId: string;
    tenantId: string;
    percent: number;
    message: string;
}

export interface AuthenticatedEventData {
    clientId: string;
    tenantId: string;
    timestamp: string;
}

// Union type para todos los eventos de WhatsApp
export type WhatsAppEventData = 
    | QRCodeEventData
    | QRTimeoutEventData
    | WhatsAppReadyEventData
    | WhatsAppDisconnectedEventData
    | LoadingScreenEventData
    | AuthenticatedEventData;