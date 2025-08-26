// Cliente principal
export { apiClient, ApiClient } from './client';

// Tipos
export type * from './types';

// Servicios
export { authService, AuthService } from './services/auth';
export { departmentsService, DepartmentsService } from './services/departments';
export { usersService, UsersService } from './services/users';

// Re-exportar todo para conveniencia
export * from './client';
export * from './services/auth';
export * from './services/departments';
export * from './services/users';
export * from './types';

