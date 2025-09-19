export interface CreateWhatsAppConnectionRequest {
    connectionId: string;
    tenantId: string;
    connectionName: string;
    departament: string; // Note: typo in backend, should be "department"
}

export interface RestartWhatsAppConnectionRequest {
    connectionId: string;
    tenantId: string;
}

// Response types
export interface WhatsAppConnectionResponse {
    success: boolean;
    clientId: string;
    status: string;
    tenantId: string;
    qr?: string;
    connectionRecord: {
        id: number;
        clientId: string;
        status: string;
        createdAt: string;
        updatedAt: string;
    };
    message: string;
}

export interface RestartWhatsAppConnectionResponse {
    success: boolean;
    clientId: string;
    message: string;
}

// Error response type
export interface WhatsAppConnectionError {
    error?: string;
    success?: false;
    message?: string;
}