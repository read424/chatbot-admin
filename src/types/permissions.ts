// Tipos de permisos del sistema
export type Permission = 
  // Gestión de usuarios
  | 'users.create'
  | 'users.read'
  | 'users.update'
  | 'users.delete'
  | 'users.manage_roles'
  
  // Gestión de departamentos
  | 'departments.create'
  | 'departments.read'
  | 'departments.update'
  | 'departments.delete'
  
  // Gestión de contactos
  | 'contacts.create'
  | 'contacts.read'
  | 'contacts.update'
  | 'contacts.delete'
  | 'contacts.export'
  
  // Gestión de conexiones
  | 'connections.create'
  | 'connections.read'
  | 'connections.update'
  | 'connections.delete'
  | 'connections.test'
  | 'connections.manage_webhooks'
  
  // Gestión de chatbots
  | 'chatbots.create'
  | 'chatbots.read'
  | 'chatbots.update'
  | 'chatbots.delete'
  | 'chatbots.test'
  | 'chatbots.manage_rules'
  
  // Chat y mensajería
  | 'chat.read'
  | 'chat.send'
  | 'chat.manage_conversations'
  | 'chat.assign_agents'
  | 'chat.transfer_conversations'
  
  // Reportes y analytics
  | 'reports.view'
  | 'reports.export'
  | 'reports.manage_dashboards'
  
  // Configuración del sistema
  | 'settings.read'
  | 'settings.update'
  | 'settings.manage_integrations'
  
  // Administración
  | 'admin.all'
  | 'admin.manage_system'
  | 'admin.view_logs'
  | 'admin.manage_backups';

// Roles del sistema
export type UserRole = 'admin' | 'supervisor' | 'agent';

// Configuración de permisos por rol
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Todos los permisos
    'admin.all',
    'admin.manage_system',
    'admin.view_logs',
    'admin.manage_backups',
    
    // Gestión completa de usuarios
    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'users.manage_roles',
    
    // Gestión completa de departamentos
    'departments.create',
    'departments.read',
    'departments.update',
    'departments.delete',
    
    // Gestión completa de contactos
    'contacts.create',
    'contacts.read',
    'contacts.update',
    'contacts.delete',
    'contacts.export',
    
    // Gestión completa de conexiones
    'connections.create',
    'connections.read',
    'connections.update',
    'connections.delete',
    'connections.test',
    'connections.manage_webhooks',
    
    // Gestión completa de chatbots
    'chatbots.create',
    'chatbots.read',
    'chatbots.update',
    'chatbots.delete',
    'chatbots.test',
    'chatbots.manage_rules',
    
    // Chat completo
    'chat.read',
    'chat.send',
    'chat.manage_conversations',
    'chat.assign_agents',
    'chat.transfer_conversations',
    
    // Reportes completos
    'reports.view',
    'reports.export',
    'reports.manage_dashboards',
    
    // Configuración completa
    'settings.read',
    'settings.update',
    'settings.manage_integrations'
  ],
  
  supervisor: [
    // Gestión de usuarios (limitada)
    'users.read',
    'users.update',
    
    // Gestión de departamentos (limitada)
    'departments.read',
    'departments.update',
    
    // Gestión completa de contactos
    'contacts.create',
    'contacts.read',
    'contacts.update',
    'contacts.delete',
    'contacts.export',
    
    // Gestión de conexiones (limitada)
    'connections.read',
    'connections.test',
    
    // Gestión de chatbots (limitada)
    'chatbots.read',
    'chatbots.test',
    
    // Chat completo
    'chat.read',
    'chat.send',
    'chat.manage_conversations',
    'chat.assign_agents',
    'chat.transfer_conversations',
    
    // Reportes (limitados)
    'reports.view',
    'reports.export',
    
    // Configuración (solo lectura)
    'settings.read'
  ],
  
  agent: [
    // Solo lectura de usuarios
    'users.read',
    
    // Solo lectura de departamentos
    'departments.read',
    
    // Gestión básica de contactos
    'contacts.create',
    'contacts.read',
    'contacts.update',
    
    // Solo lectura de conexiones
    'connections.read',
    
    // Solo lectura de chatbots
    'chatbots.read',
    
    // Chat básico
    'chat.read',
    'chat.send',
    
    // Solo reportes básicos
    'reports.view',
    
    // Solo configuración básica
    'settings.read'
  ]
};

// Jerarquía de roles (mayor número = mayor privilegio)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  supervisor: 2,
  agent: 1
};

// Verificar si un rol tiene un permiso específico
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role];
  
  // Si tiene admin.all, tiene todos los permisos
  if (rolePermissions.includes('admin.all')) {
    return true;
  }
  
  return rolePermissions.includes(permission);
}

// Verificar si un rol puede realizar una acción sobre otro rol
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
}

// Obtener permisos faltantes para un rol
export function getMissingPermissions(role: UserRole, requiredPermissions: Permission[]): Permission[] {
  return requiredPermissions.filter(permission => !hasPermission(role, permission));
}

// Verificar si un conjunto de permisos es válido para un rol
export function validatePermissions(role: UserRole, permissions: Permission[]): {
  isValid: boolean;
  invalidPermissions: Permission[];
  missingPermissions: Permission[];
} {
  const rolePermissions = ROLE_PERMISSIONS[role];
  const invalidPermissions = permissions.filter(p => !rolePermissions.includes(p) && p !== 'admin.all');
  const missingPermissions = rolePermissions.filter(p => !permissions.includes(p));
  
  return {
    isValid: invalidPermissions.length === 0,
    invalidPermissions,
    missingPermissions
  };
}

// Obtener descripción legible de un permiso
export function getPermissionDescription(permission: Permission): string {
  const descriptions: Record<Permission, string> = {
    // Usuarios
    'users.create': 'Crear nuevos usuarios',
    'users.read': 'Ver información de usuarios',
    'users.update': 'Modificar usuarios existentes',
    'users.delete': 'Eliminar usuarios',
    'users.manage_roles': 'Gestionar roles y permisos de usuarios',
    
    // Departamentos
    'departments.create': 'Crear nuevos departamentos',
    'departments.read': 'Ver departamentos',
    'departments.update': 'Modificar departamentos',
    'departments.delete': 'Eliminar departamentos',
    
    // Contactos
    'contacts.create': 'Crear nuevos contactos',
    'contacts.read': 'Ver información de contactos',
    'contacts.update': 'Modificar contactos existentes',
    'contacts.delete': 'Eliminar contactos',
    'contacts.export': 'Exportar datos de contactos',
    
    // Conexiones
    'connections.create': 'Crear nuevas conexiones',
    'connections.read': 'Ver conexiones existentes',
    'connections.update': 'Modificar conexiones',
    'connections.delete': 'Eliminar conexiones',
    'connections.test': 'Probar conexiones',
    'connections.manage_webhooks': 'Gestionar webhooks de conexiones',
    
    // Chatbots
    'chatbots.create': 'Crear configuraciones de chatbot',
    'chatbots.read': 'Ver configuraciones de chatbot',
    'chatbots.update': 'Modificar configuraciones de chatbot',
    'chatbots.delete': 'Eliminar configuraciones de chatbot',
    'chatbots.test': 'Probar configuraciones de chatbot',
    'chatbots.manage_rules': 'Gestionar reglas de chatbot',
    
    // Chat
    'chat.read': 'Leer conversaciones',
    'chat.send': 'Enviar mensajes',
    'chat.manage_conversations': 'Gestionar conversaciones',
    'chat.assign_agents': 'Asignar agentes a conversaciones',
    'chat.transfer_conversations': 'Transferir conversaciones',
    
    // Reportes
    'reports.view': 'Ver reportes',
    'reports.export': 'Exportar reportes',
    'reports.manage_dashboards': 'Gestionar dashboards de reportes',
    
    // Configuración
    'settings.read': 'Ver configuración del sistema',
    'settings.update': 'Modificar configuración del sistema',
    'settings.manage_integrations': 'Gestionar integraciones',
    
    // Administración
    'admin.all': 'Acceso completo al sistema',
    'admin.manage_system': 'Gestionar configuración del sistema',
    'admin.view_logs': 'Ver logs del sistema',
    'admin.manage_backups': 'Gestionar respaldos del sistema'
  };
  
  return descriptions[permission] || 'Permiso desconocido';
}

// Obtener categorías de permisos
export function getPermissionCategories(): Record<string, Permission[]> {
  return {
    'Usuarios': [
      'users.create',
      'users.read',
      'users.update',
      'users.delete',
      'users.manage_roles'
    ],
    'Departamentos': [
      'departments.create',
      'departments.read',
      'departments.update',
      'departments.delete'
    ],
    'Contactos': [
      'contacts.create',
      'contacts.read',
      'contacts.update',
      'contacts.delete',
      'contacts.export'
    ],
    'Conexiones': [
      'connections.create',
      'connections.read',
      'connections.update',
      'connections.delete',
      'connections.test',
      'connections.manage_webhooks'
    ],
    'Chatbots': [
      'chatbots.create',
      'chatbots.read',
      'chatbots.update',
      'chatbots.delete',
      'chatbots.test',
      'chatbots.manage_rules'
    ],
    'Chat': [
      'chat.read',
      'chat.send',
      'chat.manage_conversations',
      'chat.assign_agents',
      'chat.transfer_conversations'
    ],
    'Reportes': [
      'reports.view',
      'reports.export',
      'reports.manage_dashboards'
    ],
    'Configuración': [
      'settings.read',
      'settings.update',
      'settings.manage_integrations'
    ],
    'Administración': [
      'admin.all',
      'admin.manage_system',
      'admin.view_logs',
      'admin.manage_backups'
    ]
  };
}
