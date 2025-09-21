import { apiClient } from '@/lib/api/client';
import type {
    ApiChatMessage,
    ApiChatSession,
    ApiContact,
    ApiListResponse,
    ApiResponse,
    CreateContactRequest,
    GetChatMessagesRequest,
    GetChatSessionsRequest,
    SendMessageRequest,
    UpdateSessionRequest
} from '@/types/api';

class ChatService {
  private readonly basePath = '/chat';
  private tenantId: string = '1';

  constructor(tenantId?: string) {
    if (tenantId) {
      this.tenantId = tenantId;
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      'X-Tenant-Id': this.tenantId
    };
  }

  // Obtener sesiones de chat
  async getChatSessions(filters?: GetChatSessionsRequest): Promise<ApiChatSession[]> {
    try {
      const params: Record<string, string> = {};
      
      if (filters?.status) params.status = filters.status;
      if (filters?.limit) params.limit = filters.limit.toString();
      if (filters?.offset) params.offset = filters.offset.toString();
      if (filters?.search) params.search = filters.search;
      if (filters?.handledBy) params.handledBy = filters.handledBy.toString();

      const response = await apiClient.get<ApiListResponse<ApiChatSession>>(
        `${this.basePath}/sessions`, 
        params, 
        this.getHeaders()
      );

      if (!response.data.success) {
        throw new Error('Error al obtener sesiones de chat');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      throw new Error('No se pudieron cargar las sesiones de chat');
    }
  }

  // Obtener mensajes de una sesión
  async getChatMessages(sessionId: string, filters?: GetChatMessagesRequest): Promise<ApiChatMessage[]> {
    try {
      const params: Record<string, string> = {};
      
      if (filters?.limit) params.limit = filters.limit.toString();
      if (filters?.offset) params.offset = filters.offset.toString();

      const response = await apiClient.get<ApiListResponse<ApiChatMessage>>(
        `${this.basePath}/sessions/${sessionId}/messages`, 
        params, 
        this.getHeaders()
      );

      if (!response.data.success) {
        throw new Error('Error al obtener mensajes');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw new Error('No se pudieron cargar los mensajes');
    }
  }

  // Enviar mensaje
  async sendMessage(sessionId: string, content: string, messageType: string = 'text'): Promise<ApiChatMessage> {
    try {
      const requestData: SendMessageRequest = {
        content,
        messageType
      };

      const response = await apiClient.post<ApiResponse<ApiChatMessage>>(
        `${this.basePath}/sessions/${sessionId}/messages`, 
        requestData, 
        this.getHeaders()
      );

      if (!response.data.success) {
        throw new Error('Error al enviar mensaje');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('No se pudo enviar el mensaje');
    }
  }

  // Actualizar sesión
  async updateSession(sessionId: string, updates: UpdateSessionRequest): Promise<ApiChatSession> {
    try {
      const response = await apiClient.patch<ApiResponse<ApiChatSession>>(
        `${this.basePath}/sessions/${sessionId}`, 
        updates, 
        this.getHeaders()
      );

      if (!response.data.success) {
        throw new Error('Error al actualizar sesión');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error updating session:', error);
      throw new Error('No se pudo actualizar la sesión');
    }
  }

  // Obtener contactos
  async getContacts(filters?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiContact[]> {
    try {
      const params: Record<string, string> = {};
      
      if (filters?.search) params.search = filters.search;
      if (filters?.limit) params.limit = filters.limit.toString();
      if (filters?.offset) params.offset = filters.offset.toString();

      const response = await apiClient.get<ApiListResponse<ApiContact>>(
        `${this.basePath}/contacts`, 
        params, 
        this.getHeaders()
      );

      if (!response.data.success) {
        throw new Error('Error al obtener contactos');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw new Error('No se pudieron cargar los contactos');
    }
  }

  // Crear contacto
  async createContact(contactData: CreateContactRequest): Promise<ApiContact> {
    try {
      const response = await apiClient.post<ApiResponse<ApiContact>>(
        `${this.basePath}/contacts`, 
        contactData, 
        this.getHeaders()
      );

      if (!response.data.success) {
        throw new Error('Error al crear contacto');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw new Error('No se pudo crear el contacto');
    }
  }

  // Marcar mensajes como leídos
  async markAsRead(sessionId: string): Promise<void> {
    try {
      await apiClient.patch<ApiResponse<void>>(
        `${this.basePath}/sessions/${sessionId}/read`, 
        {}, 
        this.getHeaders()
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }

  setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
  }
}

export const chatService = new ChatService();