import { Permission, UserRole, canManageRole, getMissingPermissions, hasPermission, validatePermissions } from '@/types/permissions';
import { useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';

interface UsePermissionsReturn {
  // Verificación de permisos
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  
  // Verificación de roles
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  canManageUser: (targetRole: UserRole) => boolean;
  
  // Información del usuario
  userRole: UserRole | null;
  userPermissions: Permission[];
  
  // Utilidades
  getMissingPermissions: (requiredPermissions: Permission[]) => Permission[];
  validateUserPermissions: (permissions: Permission[]) => {
    isValid: boolean;
    invalidPermissions: Permission[];
    missingPermissions: Permission[];
  };
}

export const usePermissions = (): UsePermissionsReturn => {
  const { user, isAuthenticated } = useAuth();

  // Obtener rol del usuario
  const userRole = useMemo((): UserRole | null => {
    if (!isAuthenticated || !user) return null;
    return user.role as UserRole;
  }, [isAuthenticated, user]);

  // Obtener permisos del usuario
  const userPermissions = useMemo((): Permission[] => {
    if (!userRole) return [];
    
    // Importar dinámicamente para evitar dependencias circulares
    const { ROLE_PERMISSIONS } = require('@/types/permissions');
    return ROLE_PERMISSIONS[userRole] || [];
  }, [userRole]);

  // Verificar si el usuario tiene un permiso específico
  const checkPermission = useCallback((permission: Permission): boolean => {
    if (!userRole) return false;
    return hasPermission(userRole, permission);
  }, [userRole]);

  // Verificar si el usuario tiene al menos uno de los permisos
  const checkAnyPermission = useCallback((permissions: Permission[]): boolean => {
    if (!userRole || permissions.length === 0) return false;
    return permissions.some(permission => hasPermission(userRole, permission));
  }, [userRole]);

  // Verificar si el usuario tiene todos los permisos
  const checkAllPermissions = useCallback((permissions: Permission[]): boolean => {
    if (!userRole || permissions.length === 0) return false;
    return permissions.every(permission => hasPermission(userRole, permission));
  }, [userRole]);

  // Verificar si el usuario tiene un rol específico
  const checkRole = useCallback((role: UserRole): boolean => {
    return userRole === role;
  }, [userRole]);

  // Verificar si el usuario tiene al menos uno de los roles
  const checkAnyRole = useCallback((roles: UserRole[]): boolean => {
    if (!userRole || roles.length === 0) return false;
    return roles.includes(userRole);
  }, [userRole]);

  // Verificar si el usuario puede gestionar otro usuario con el rol especificado
  const checkCanManageUser = useCallback((targetRole: UserRole): boolean => {
    if (!userRole) return false;
    return canManageRole(userRole, targetRole);
  }, [userRole]);

  // Obtener permisos faltantes para un conjunto de permisos requeridos
  const getMissingUserPermissions = useCallback((requiredPermissions: Permission[]): Permission[] => {
    if (!userRole) return requiredPermissions;
    return getMissingPermissions(userRole, requiredPermissions);
  }, [userRole]);

  // Validar permisos del usuario
  const validateUserPermissions = useCallback((permissions: Permission[]) => {
    if (!userRole) {
      return {
        isValid: false,
        invalidPermissions: permissions,
        missingPermissions: []
      };
    }
    return validatePermissions(userRole, permissions);
  }, [userRole]);

  return {
    // Verificación de permisos
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    
    // Verificación de roles
    hasRole: checkRole,
    hasAnyRole: checkAnyRole,
    canManageUser: checkCanManageUser,
    
    // Información del usuario
    userRole,
    userPermissions,
    
    // Utilidades
    getMissingPermissions: getMissingUserPermissions,
    validateUserPermissions
  };
};
