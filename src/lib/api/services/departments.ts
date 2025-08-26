// lib/api/services/departments.ts
import { apiClient } from '../client';
import type {
    CreateDepartmentRequest,
    Department,
    DepartmentFilters,
    PaginatedResponse,
    UpdateDepartmentRequest,
} from '../types';

export class DepartmentsService {
  private readonly basePath = '/departments';

  // Obtener todos los departamentos con filtros y paginación
  async getDepartments(filters: DepartmentFilters = {}): Promise<PaginatedResponse<Department>> {
    const response = await apiClient.get<PaginatedResponse<Department>>(
      this.basePath,
      filters as Record<string, string | number>
    );
    return response.data;
  }

  // Obtener departamento por ID
  async getDepartmentById(id: string): Promise<Department> {
    const response = await apiClient.get<Department>(`${this.basePath}/${id}`);
    return response.data;
  }

  // Crear nuevo departamento
  async createDepartment(departmentData: CreateDepartmentRequest): Promise<Department> {
    const response = await apiClient.post<Department>(this.basePath, departmentData);
    return response.data;
  }

  // Actualizar departamento existente
  async updateDepartment(id: string, departmentData: UpdateDepartmentRequest): Promise<Department> {
    const response = await apiClient.patch<Department>(`${this.basePath}/${id}`, departmentData);
    return response.data;
  }

  // Eliminar departamento
  async deleteDepartment(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  // Activar/desactivar departamento
  async toggleDepartmentStatus(id: string, isActive: boolean): Promise<Department> {
    const response = await apiClient.patch<Department>(`${this.basePath}/${id}/status`, {
      isActive,
    });
    return response.data;
  }

  // Obtener todos los departamentos activos (para selects)
  async getActiveDepartments(): Promise<Department[]> {
    const response = await apiClient.get<Department[]>(`${this.basePath}/active`);
    return response.data;
  }

  // Obtener estadísticas del departamento
  async getDepartmentStats(id: string): Promise<{
    userCount: number;
    activeUsers: number;
    messageCount: number;
    avgResponseTime: number;
  }> {
    const response = await apiClient.get<{
      userCount: number;
      activeUsers: number;
      messageCount: number;
      avgResponseTime: number;
    }>(`${this.basePath}/${id}/stats`);
    return response.data;
  }
}

// Instancia singleton del servicio
export const departmentsService = new DepartmentsService();