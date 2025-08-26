import { apiClient } from './client';
import type { LoginRequest, LoginResponse, User } from './types';

export class AuthService {
  // Iniciar sesión
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Verificar credenciales hardcodeadas para admin
    if (credentials.email === 'admin@inbox.com' && credentials.password === 'admin123') {
      const mockResponse: LoginResponse = {
        user: {
          id: 'admin-001',
          name: 'Administrador',
          email: 'admin@inbox.com',
          role: 'admin',
          department: 'Administración',
          isActive: true,
          permissions: ['all'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        },
        token: 'mock-jwt-token-admin-' + Date.now(),
        expiresIn: 3600 // 1 hora
      };

      // Guardar token en localStorage (solo en el cliente)
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', mockResponse.token);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
      }
      
      return mockResponse;
    }

    // Para otras credenciales, hacer petición al backend
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    // Guardar token en localStorage (solo en el cliente)
    if (response.data.token && typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  // Cerrar sesión
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // Obtener token
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Instancia del servicio
export const authService = new AuthService();