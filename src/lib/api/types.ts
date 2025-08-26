// Tipos base
export interface BaseEntity {
    id: string;
    createdAt: string;
    updatedAt: string;
}

// Tipos de respuesta paginada
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Parámetros de paginación
export interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Tipos de Usuario
export interface User extends BaseEntity {
    name: string;
    email: string;
    role: 'admin' | 'supervisor' | 'agent';
    department?: string;
    isActive: boolean;
    lastLogin?: string;
    permissions: string[];
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'supervisor' | 'agent';
    department?: string;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    role?: 'admin' | 'supervisor' | 'agent';
    department?: string;
    isActive?: boolean;
}

// Tipos de Departamento
export interface Department extends BaseEntity {
    name: string;
    description?: string;
    manager?: User;
    isActive: boolean;
    usersCount: number;
}

export interface CreateDepartmentRequest {
    name: string;
    description?: string;
    managerId?: string;
}

export interface UpdateDepartmentRequest {
    name?: string;
    description?: string;
    managerId?: string;
    isActive?: boolean;
}

// Tipos de Chat/Mensaje
export interface Message extends BaseEntity {
    content: string;
    senderId: string;
    receiverId: string;
    conversationId: string;
    type: 'text' | 'image' | 'file' | 'audio';
    isRead: boolean;
    metadata?: Record<string, any>;
}

export interface Conversation extends BaseEntity {
    participantIds: string[];
    lastMessage?: Message;
    isActive: boolean;
    metadata?: Record<string, any>;
}

export interface SendMessageRequest {
    content: string;
    receiverId: string;
    conversationId?: string;
    type?: 'text' | 'image' | 'file' | 'audio';
    metadata?: Record<string, any>;
}

// Tipos de Autenticación
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    token: string;
    refreshToken?: string;
    expiresIn: number;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

// Tipos de configuración
export interface SystemConfig {
    maxFileSize: number;
    allowedFileTypes: string[];
    sessionTimeout: number;
    maintenanceMode: boolean;
}

// Tipos de estadísticas/dashboard
export interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    totalConversations: number;
    messagesThisWeek: number;
    departmentStats: Array<{
        departmentName: string;
        userCount: number;
        messageCount: number;
    }>;
}

// Tipos de filtros y búsquedas
export interface UserFilters extends PaginationParams {
    role?: 'admin' | 'supervisor' | 'agent';
    department?: string;
    isActive?: boolean;
}

export interface DepartmentFilters extends PaginationParams {
    isActive?: boolean;
}

export interface MessageFilters extends PaginationParams {
    conversationId?: string;
    senderId?: string;
    type?: 'text' | 'image' | 'file' | 'audio';
    dateFrom?: string;
    dateTo?: string;
}