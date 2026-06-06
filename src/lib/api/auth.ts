import { apiClient } from './client';
import type { LoginRequest, LoginResponse, User } from './types';

// Tipo para la respuesta del backend (estructura real)
interface BackendLoginResponse {
    success: boolean;
    message: string;
    data: {
        user: {
            id: number;
            username: string;
            id_user_type: number;
            role: 'admin' | 'supervisor' | 'agent';
            status: string;
            last_login: string;
            code_referial: string;
            auth_two_factor: string;
            tenantId?: number | string; // ID del tenant, puede ser número o string
        };
        token: string;
        expiresIn: number;
        permissions: string[];
        tenantId?: number | string; // ID del tenant, si viene en el nivel superior
    };
}

export class AuthService {
    /**
     * Mapear usuario del backend al formato del frontend
     */
    private mapBackendUserToFrontend(backendUser: BackendLoginResponse['data']['user'], permissions: string[]): User {
        return {
            id: backendUser.id.toString(),
            email: backendUser.username,
            name: backendUser.username.split('@')[0] || 'Usuario', // Extraer nombre del email
            role: backendUser.role,
            department: this.getDepartmentByRole(backendUser.role),
            isActive: backendUser.status === '1',
            permissions: permissions.length > 0 ? permissions : this.getDefaultPermissionsByRole(backendUser.role),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: backendUser.last_login
        };
    }

    /**
     * Obtener departamento por defecto según el rol
     */
    private getDepartmentByRole(role: string): string {
        const departmentMap: Record<string, string> = {
            'admin': 'Administración',
            'supervisor': 'Supervisión',
            'agent': 'Ventas'
        };
        return departmentMap[role] || 'General';
    }

    /**
     * Obtener permisos por defecto según el rol
     */
    private getDefaultPermissionsByRole(role: string): string[] {
        const permissionsMap: Record<string, string[]> = {
            'admin': ['all'],
            'supervisor': ['chat', 'manage_users', 'view_reports'],
            'agent': ['chat', 'view_stats']
        };
        return permissionsMap[role] || ['chat'];
    }

    /**
    * Iniciar sesión
    * @param credentials - Email y contraseña del usuario
    * @returns Respuesta con datos del usuario y token JWT
    */
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await apiClient.post<BackendLoginResponse>('/auth/login', credentials);

        // Extraer data del wrapper del backend
        const backendData = response.data.data;

        // Mapear el usuario del backend al formato del frontend
        const mappedUser = this.mapBackendUserToFrontend(backendData.user, backendData.permissions);

        // Crear respuesta en el formato esperado por el frontend
        const loginResponse: LoginResponse = {
            user: mappedUser,
            token: backendData.token,
            expiresIn: backendData.expiresIn
        };

        // Guardar token, usuario y tenantId en localStorage
        if (loginResponse.token && typeof window !== 'undefined') {
          localStorage.setItem('token', loginResponse.token);
          localStorage.setItem('user', JSON.stringify(loginResponse.user));

          // Guardar tenantId - ajustar según lo que devuelva el backend
          // Prioridad: 1) tenantId en data, 2) tenantId en user, 3) id del usuario como fallback
          const tenantId = backendData.tenantId ||
                          backendData.user.tenantId ||
                          backendData.user.id;
          // Convertir a string para guardarlo en localStorage
          localStorage.setItem('tenantId', String(tenantId));
        }

        return loginResponse;
    }

    // Cerrar sesión
    logout(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('tenantId');
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