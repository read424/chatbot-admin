import { apiClient } from '../client';
import type {
    CreateUserRequest,
    PaginatedResponse,
    UpdateUserRequest,
    User,
    UserFilters
} from '../types';

export class UsersService {
  private readonly basePath = '/users';

  // Obtener todos los usuarios con filtros y paginación
  async getUsers(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>(
      this.basePath,
      filters as Record<string, string | number>
    );
    return response.data;
  }

  // Obtener usuario por ID
  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`${this.basePath}/${id}`);
    return response.data;
  }

  // Crear nuevo usuario
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<User>(this.basePath, userData);
    return response.data;
  }

  // Actualizar usuario existente
  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const response = await apiClient.patch<User>(`${this.basePath}/${id}`, userData);
    return response.data;
  }

  // Eliminar usuario
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  // Activar/desactivar usuario
  async toggleUserStatus(id: string, isActive: boolean): Promise<User> {
    const response = await apiClient.patch<User>(`${this.basePath}/${id}/status`, {
      isActive,
    });
    return response.data;
  }

  // Cambiar contraseña del usuario
  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
    await apiClient.post(`${this.basePath}/${id}/change-password`, {
      oldPassword,
      newPassword,
    });
  }

  // Resetear contraseña del usuario (solo admin)
  async resetPassword(id: string): Promise<{ temporaryPassword: string }> {
    const response = await apiClient.post<{ temporaryPassword: string }>(
      `${this.basePath}/${id}/reset-password`
    );
    return response.data;
  }

  // Obtener usuarios por departamento
  async getUsersByDepartment(departmentId: string): Promise<User[]> {
    const response = await apiClient.get<User[]>(
      `${this.basePath}/by-department/${departmentId}`
    );
    return response.data;
  }

  // Buscar usuarios por término
  async searchUsers(query: string, limit = 10): Promise<User[]> {
    const response = await apiClient.get<User[]>(`${this.basePath}/search`, {
      q: query,
      limit,
    });
    return response.data;
  }
}

// Instancia singleton del servicio
export const usersService = new UsersService();