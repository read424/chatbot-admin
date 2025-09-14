import { apiClient } from '@/lib/api/client';
import type {
    Connection,
    ConnectionFilters,
    ConnectionResponse,
    ConnectionsListResponse,
    CreateConnectionRequest,
    CreateConnectionResponse,
    TenantContext,
    UpdateConnectionRequest
} from '@/types/connections';

export interface IConnectionsService {
    getConnections(filters?: ConnectionFilters): Promise<Connection[]>;
    getConnectionById(id: number): Promise<Connection>;
    createConnection(data: CreateConnectionRequest): Promise<CreateConnectionResponse>;
    updateConnection(data: UpdateConnectionRequest): Promise<Connection>;
    updateConnectionStatus(id: string, status: string): Promise<{ success: boolean}>;
    createWhatsAppConnection(data: any): Promise<any>;
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

            return response.data.data;

        }catch (error){
            console.error('Error fetching connections:', error);
            throw new Error('No se pudieron cargar las conexiones');
        }
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

    async createWhatsAppConnection(data: any): Promise<any> {
        try {
            const response = await apiClient.post<any>(`/whatsapp/connect`, data, this.getHeaders());
            return response.data;
        } catch (error) {
            console.error('Error creating WhatsApp connection:', error);
            throw new Error('No se pudo crear la conexión de WhatsApp');
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
