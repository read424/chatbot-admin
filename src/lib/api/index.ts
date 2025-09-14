// Cliente principal
export { apiClient, ApiClient } from './client';

// Tipos
export type * from './types';

// Servicios
//export { authService, AuthService } from './services/auth';
export { ChatbotService } from './services/chatbot';
export { connectionsService, ConnectionsService } from './services/connections';
export { contactsService, ContactsService } from './services/contacts';
export { departmentsService, DepartmentsService } from './services/departments';
export { usersService, UsersService } from './services/users';

// Re-exportar todo para conveniencia
export * from './client';
//export * from './services/auth';
export * from './services/chatbot';
export * from './services/connections';
export * from './services/contacts';
export * from './services/departments';
export * from './services/users';
export * from './types';

