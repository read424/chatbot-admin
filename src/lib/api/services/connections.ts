import { apiClient } from '@/lib/api/client';
import type {
    Connection,
    ConnectionFilters,
    ConnectionHealth,
    ConnectionResponse,
    ConnectionsListResponse,
    CreateConnectionRequest,
    CreateConnectionResponse,
    ProviderType,
    TenantContext,
    UpdateConnectionRequest
} from '@/types/connections';
import { CreateWhatsAppConnectionRequest, RestartWhatsAppConnectionRequest, RestartWhatsAppConnectionResponse, WhatsAppConnectionResponse } from '@/types/whatsapp-api';

export interface IConnectionsService {
    getConnections(filters?: ConnectionFilters): Promise<Connection[]>;
    getConnectionById(id: number): Promise<Connection>;
    createConnection(data: CreateConnectionRequest): Promise<CreateConnectionResponse>;
    updateConnection(data: UpdateConnectionRequest): Promise<Connection>;
    updateConnectionStatus(id: string, status: string): Promise<{ success: boolean}>;
    createWhatsAppConnection(data: any): Promise<any>;
    restartWhatsAppConnection(data: any): Promise<any>;
    testConnection(connectionData: CreateConnectionRequest): Promise<{ success: boolean; message: string; details?: any }>;
    testWebhook(connectionId: string, webhookUrl: string, payload: any, secret?: string): Promise<{ success: boolean; message: string; details?: any }>;
    updateWebhookConfig(connectionId: string, webhookConfig: any): Promise<{ success: boolean; data?: any }>;
}


export class ConnectionsService implements IConnectionsService {
    private readonly basePath = '/connections';
    private tenantId: string = '1';

    constructor(tenantContext?: TenantContext) {
        if (tenantContext?.tenantId) {
            this.tenantId = tenantContext.tenantId;
        }
    }

    private getHeaders(): Record<string, string> {
        return {
            'X-Tenant-Id': this.tenantId
        }
    }

    async getConnections(filters?: ConnectionFilters): Promise<Connection[]> {
        try {
            const params: Record<string, string> =  {};

            if (filters?.provider) {
                params.provider = filters.provider;
            }

            if (filters?.status) {
                params.status = filters.status;
            }

            const response = await apiClient.get<ConnectionsListResponse>(this.basePath, params);

            if (!response.data.success) {
                throw new Error('Failed to fetch connections');
            }

            // Add mock health data for demonstration
            const connectionsWithHealth = response.data.data.map(connection => ({
                ...connection,
                health: this.generateMockHealthData(connection)
            }));

            return connectionsWithHealth;

        }catch (error){
            console.error('Error fetching connections:', error);
            throw new Error('No se pudieron cargar las conexiones');
        }
    }

    private generateMockHealthData(connection: Connection): ConnectionHealth {
        const isHealthy = connection.status === 'active';
        const baseResponseTime = Math.floor(Math.random() * 200) + 50; // 50-250ms
        const errorRate = isHealthy ? Math.random() * 5 : Math.random() * 20 + 10; // 0-5% for healthy, 10-30% for unhealthy
        const messagesSent = Math.floor(Math.random() * 1000) + 100;
        const messagesReceived = Math.floor(Math.random() * 800) + 80;
        const errors = Math.floor((messagesSent + messagesReceived) * (errorRate / 100));

        return {
            isHealthy: isHealthy && errorRate < 10,
            lastCheck: new Date().toISOString(),
            uptime: isHealthy ? 95 + Math.random() * 5 : 60 + Math.random() * 30, // 95-100% for healthy, 60-90% for unhealthy
            responseTime: baseResponseTime,
            errorRate: errorRate,
            lastError: !isHealthy ? {
                message: this.getRandomErrorMessage(connection.providerType),
                timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Random time in last hour
                code: 'ERR_' + Math.floor(Math.random() * 1000)
            } : undefined,
            metrics: {
                messagesSent,
                messagesReceived,
                errors,
                period: '24h'
            }
        };
    }

    private getRandomErrorMessage(providerType: ProviderType): string {
        const errorMessages: Record<ProviderType, string[]> = {
            whatsapp: [
                'Conexión perdida con WhatsApp Web',
                'Teléfono desconectado',
                'Sesión expirada'
            ],
            whatsapp_api: [
                'Token de acceso expirado',
                'Límite de rate exceeded',
                'Webhook no responde'
            ],
            facebook: [
                'Permisos de página insuficientes',
                'Token de página expirado',
                'API rate limit exceeded'
            ],
            instagram: [
                'Cuenta no verificada',
                'Token de acceso inválido',
                'Webhook configuration error'
            ],
            telegram: [
                'Bot token inválido',
                'Webhook URL no accesible',
                'Message delivery failed'
            ],
            chatweb: [
                'Servidor no disponible',
                'Conexión timeout',
                'Authentication failed'
            ]
        };

        const messages = errorMessages[providerType] || ['Error desconocido'];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    async getConnectionById(id: number): Promise<Connection> {
        try {
            const response = await apiClient.get<ConnectionResponse>(`${this.basePath}/${id}`);

            if (!response.data.success) {
                throw new Error('Connection not found');
            }

            return response.data.data;
        } catch (error) {
            console.error(`Error fetching connection ${id}:`, error);
            throw new Error('No se pudo cargar la conexión');
        }
    }

    async createConnection(data: CreateConnectionRequest): Promise<CreateConnectionResponse> {
        try {
            // Validación básica en el cliente
            if (!data.name?.trim()) {
                throw new Error('El nombre de la conexión es requerido');
            }

            if (!data.department) {
                throw new Error('El departamento es requerido');
            }

            const response = await apiClient.request<CreateConnectionResponse>({
                method: 'POST',
                url: this.basePath,
                data,
                headers: this.getHeaders(),
            });
    
            if (!response.data.success) {
                throw new Error(response.data.message || 'Error al crear la conexión');
            }
    
            return response.data;            
        } catch (error: any) {
            console.error('Error creating connection:', error);
      
            if (error instanceof Error) {
              throw error;
            }
            
            throw new Error('No se pudo crear la conexión');
        }
    }

    async updateConnection(data: UpdateConnectionRequest): Promise<Connection> {
        try {
            if (!data.id) {
                throw new Error('ID de conexión requerido');
            }

            // Crear objeto con solo los campos que se van a actualizar
            const updatePayload = {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.greetingMessage !== undefined && { greetingMessage: data.greetingMessage }),
                ...(data.farewellMessage !== undefined && { farewellMessage: data.farewellMessage }),
                ...(data.department !== undefined && { department: data.department }),
                ...(data.botResetMinutes !== undefined && { botResetMinutes: data.botResetMinutes }),
            };

            const response = await apiClient.put<ConnectionResponse>(
                `${this.basePath}/${data.id}`, 
                updatePayload,
                this.getHeaders()
            );
        
            if (!response.data.success) {
                throw new Error('Error al actualizar la conexión');
            }
        
            return response.data.data;

        }catch (error){
            console.error('Error updating connection:', error);
      
            if (error instanceof Error) {
              throw error;
            }
            
            throw new Error('No se pudo actualizar la conexión');
        }
    }

    async updateConnectionStatus(id: string, status: string): Promise<{ success: boolean }> {
        try {
          const validStatuses = ['active', 'inactive', 'error', 'connecting'];
          if (!validStatuses.includes(status)) {
            throw new Error('Estado inválido');
          }
    
          const response = await apiClient.request<{ success: boolean }>({
            method: 'PATCH',
            url: `${this.basePath}/${id}/status`,
            data: { status },
            headers: this.getHeaders(),
          });
    
          return response.data;
        } catch (error) {
          console.error('Error updating connection status:', error);
          throw new Error('No se pudo actualizar el estado de la conexión');
        }
    }

    async createWhatsAppConnection(data: CreateWhatsAppConnectionRequest): Promise<WhatsAppConnectionResponse> {
        try {
            const response = await apiClient.post<WhatsAppConnectionResponse>(`/whatsapp/connect`, data, this.getHeaders());
            return response.data;
        } catch (error) {
            console.error('Error creating WhatsApp connection:', error);
            throw new Error('No se pudo crear la conexión de WhatsApp');
        }
    }

    async restartWhatsAppConnection(data: RestartWhatsAppConnectionRequest): Promise<RestartWhatsAppConnectionResponse> {
        try {
            const response = await apiClient.post<RestartWhatsAppConnectionResponse>(`/whatsapp/restart-connection`, data, this.getHeaders());
            return response.data;
        }catch (error) {
            console.error('Error restarting WhatsApp connection:', error);
            throw new Error('No se pudo reiniciar la conexion de WhatsApp');
        }
    }

    async testConnection(connectionData: CreateConnectionRequest): Promise<{ success: boolean; message: string; details?: any }> {
        try {
            const response = await apiClient.request<{ success: boolean; message: string; details?: any }>({
                method: 'POST',
                url: `${this.basePath}/test`,
                data: connectionData,
                headers: this.getHeaders(),
            });

            return response.data;
        } catch (error: any) {
            console.error('Error testing connection:', error);
            
            if (error.response?.data?.message) {
                return {
                    success: false,
                    message: error.response.data.message,
                    details: error.response.data.details
                };
            }
            
            return {
                success: false,
                message: 'Error al probar la conexión'
            };
        }
    }

    async testWebhook(connectionId: string, webhookUrl: string, payload: any, secret?: string): Promise<{ success: boolean; message: string; details?: any }> {
        try {
            const response = await apiClient.request<{ success: boolean; message: string; details?: any }>({
                method: 'POST',
                url: `${this.basePath}/${connectionId}/webhook/test`,
                data: {
                    webhookUrl,
                    payload,
                    secret
                },
                headers: this.getHeaders(),
            });

            return response.data;
        } catch (error: any) {
            console.error('Error testing webhook:', error);
            
            if (error.response?.data?.message) {
                return {
                    success: false,
                    message: error.response.data.message,
                    details: error.response.data.details
                };
            }
            
            return {
                success: false,
                message: 'Error al probar el webhook'
            };
        }
    }

    async updateWebhookConfig(connectionId: string, webhookConfig: any): Promise<{ success: boolean; data?: any }> {
        try {
            const response = await apiClient.request<{ success: boolean; data?: any }>({
                method: 'PUT',
                url: `${this.basePath}/${connectionId}/webhook`,
                data: webhookConfig,
                headers: this.getHeaders(),
            });

            return response.data;
        } catch (error: any) {
            console.error('Error updating webhook config:', error);
            
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            
            throw new Error('Error al actualizar la configuración del webhook');
        }
    }

    // Método para cambiar el tenant en runtime si es necesario
    setTenantId(tenantId: string): void {
        this.tenantId = tenantId;
    }

    getTenantId(): string {
        return this.tenantId;
    }
}

// Factory para crear instancias del servicio
export const createConnectionsService = (tenantContext?: TenantContext): IConnectionsService => {
    return new ConnectionsService(tenantContext);
};

export const connectionsService = createConnectionsService();
