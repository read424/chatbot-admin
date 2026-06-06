
export interface QRCodeEventData {
    qr: string;
    clientId: string | number;
    attempt: number;
    maxAttempts: number;
    timeoutSeconds?: number;
}

export interface QRTimeoutEventData {
    clientId: string | number;
    tenantId: string | number;
    attempts: number;
    maxAttempts: number;
    message: string;
    timestamp: string;
}

export interface WhatsAppReadyEventData {
    clientId: string | number;
    tenantId: string | number;
    phoneNumber: string | null;
    timestamp: string;
}

export interface ConnectionReadyEventData {
    clientId: string | number;
    tenantId: string | number;
    timestamp: string;
}

export interface WhatsAppDisconnectedEventData {
    clientId: string | number;
    tenantId: string | number;
    reason: string;
    timestamp: string;
}

export interface LoadingScreenEventData {
    clientId: string | number;
    tenantId: string | number;
    percent: number;
    message: string;
}

export interface AuthenticatedEventData {
    clientId: string | number;
    tenantId: string | number;
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