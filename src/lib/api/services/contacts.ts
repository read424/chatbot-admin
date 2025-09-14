import { apiClient } from '../client';
import type {
  Contact,
  ContactFilters,
  ContactResponse,
  ContactsListResponse,
  ContactStats,
  CreateContactRequest,
  UpdateContactRequest,
  PaginatedResponse
} from '../types';

export class ContactsService {
  private readonly basePath = '/contacts';

  // Obtener todos los contactos con filtros y paginación
  async getContacts(filters: ContactFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Contact>> {
    const response = await apiClient.get<PaginatedResponse<Contact>>(
      this.basePath,
      filters as Record<string, string | number>
    );
    return response.data;
  }

  // Obtener contacto por ID
  async getContactById(id: string): Promise<Contact> {
    const response = await apiClient.get<Contact>(`${this.basePath}/${id}`);
    return response.data;
  }

  // Crear nuevo contacto
  async createContact(contactData: CreateContactRequest): Promise<Contact> {
    const response = await apiClient.post<Contact>(this.basePath, contactData);
    return response.data;
  }

  // Actualizar contacto existente
  async updateContact(id: string, contactData: UpdateContactRequest): Promise<Contact> {
    const response = await apiClient.patch<Contact>(`${this.basePath}/${id}`, contactData);
    return response.data;
  }

  // Eliminar contacto
  async deleteContact(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  // Eliminar múltiples contactos
  async deleteContacts(ids: string[]): Promise<void> {
    await apiClient.post(`${this.basePath}/bulk-delete`, { ids });
  }

  // Cambiar estado del contacto
  async updateContactStatus(id: string, status: 'active' | 'inactive' | 'blocked'): Promise<Contact> {
    const response = await apiClient.patch<Contact>(`${this.basePath}/${id}/status`, {
      status,
    });
    return response.data;
  }

  // Actualizar múltiples contactos (operaciones en lote)
  async bulkUpdateContacts(
    ids: string[], 
    updates: Partial<Pick<Contact, 'status' | 'department' | 'assignedAgent' | 'tags'>>
  ): Promise<Contact[]> {
    const response = await apiClient.patch<Contact[]>(`${this.basePath}/bulk-update`, {
      ids,
      updates,
    });
    return response.data;
  }

  // Buscar contactos por término
  async searchContacts(query: string, limit = 10): Promise<Contact[]> {
    const response = await apiClient.get<Contact[]>(`${this.basePath}/search`, {
      q: query,
      limit,
    });
    return response.data;
  }

  // Obtener contactos por departamento
  async getContactsByDepartment(departmentId: string): Promise<Contact[]> {
    const response = await apiClient.get<Contact[]>(
      `${this.basePath}/by-department/${departmentId}`
    );
    return response.data;
  }

  // Obtener contactos asignados a un agente
  async getContactsByAgent(agentId: string): Promise<Contact[]> {
    const response = await apiClient.get<Contact[]>(
      `${this.basePath}/by-agent/${agentId}`
    );
    return response.data;
  }

  // Agregar nota a un contacto
  async addContactNote(contactId: string, content: string): Promise<Contact> {
    const response = await apiClient.post<Contact>(
      `${this.basePath}/${contactId}/notes`,
      { content }
    );
    return response.data;
  }

  // Actualizar nota de un contacto
  async updateContactNote(contactId: string, noteId: string, content: string): Promise<Contact> {
    const response = await apiClient.patch<Contact>(
      `${this.basePath}/${contactId}/notes/${noteId}`,
      { content }
    );
    return response.data;
  }

  // Eliminar nota de un contacto
  async deleteContactNote(contactId: string, noteId: string): Promise<Contact> {
    const response = await apiClient.delete<Contact>(
      `${this.basePath}/${contactId}/notes/${noteId}`
    );
    return response.data;
  }

  // Agregar canal de comunicación a un contacto
  async addContactChannel(
    contactId: string, 
    channel: { type: string; identifier: string; isPrimary?: boolean }
  ): Promise<Contact> {
    const response = await apiClient.post<Contact>(
      `${this.basePath}/${contactId}/channels`,
      channel
    );
    return response.data;
  }

  // Actualizar canal de comunicación
  async updateContactChannel(
    contactId: string, 
    channelId: string, 
    updates: { identifier?: string; isPrimary?: boolean; isVerified?: boolean }
  ): Promise<Contact> {
    const response = await apiClient.patch<Contact>(
      `${this.basePath}/${contactId}/channels/${channelId}`,
      updates
    );
    return response.data;
  }

  // Eliminar canal de comunicación
  async deleteContactChannel(contactId: string, channelId: string): Promise<Contact> {
    const response = await apiClient.delete<Contact>(
      `${this.basePath}/${contactId}/channels/${channelId}`
    );
    return response.data;
  }

  // Obtener estadísticas de contactos
  async getContactStats(): Promise<ContactStats> {
    const response = await apiClient.get<ContactStats>(`${this.basePath}/stats`);
    return response.data;
  }

  // Exportar contactos (CSV/Excel)
  async exportContacts(filters: ContactFilters = {}, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    // Para descargas de archivos, necesitamos usar el método request directamente
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://api-tlm.localhost/api';
    const params = new URLSearchParams();
    
    // Agregar filtros como parámetros de query
    Object.entries({ ...filters, format }).forEach(([key, value]) => {
      if (value != null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, String(v)));
        } else if (typeof value === 'object' && value.from && value.to) {
          // Para dateRange
          params.append(`${key}[from]`, value.from.toISOString());
          params.append(`${key}[to]`, value.to.toISOString());
        } else {
          params.append(key, String(value));
        }
      }
    });
    
    const url = `${baseURL}${this.basePath}/export?${params.toString()}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    
    return response.blob();
  }

  // Importar contactos desde archivo
  async importContacts(file: File): Promise<{ success: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Para file uploads, necesitamos usar fetch directamente ya que el apiClient 
    // siempre hace JSON.stringify del data
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://api-tlm.localhost/api';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const response = await fetch(`${baseURL}${this.basePath}/import`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        // No establecer Content-Type para FormData, el browser lo hará automáticamente
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Import failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Verificar si un contacto existe por canal
  async findContactByChannel(type: string, identifier: string): Promise<Contact | null> {
    try {
      const response = await apiClient.get<Contact>(
        `${this.basePath}/by-channel`,
        { type, identifier }
      );
      return response.data;
    } catch (error) {
      // Si no se encuentra, retornar null en lugar de lanzar error
      if ((error as any)?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // Obtener historial de interacciones de un contacto
  async getContactInteractionHistory(contactId: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(
      `${this.basePath}/${contactId}/interactions`
    );
    return response.data;
  }
}

// Instancia singleton del servicio
export const contactsService = new ContactsService();