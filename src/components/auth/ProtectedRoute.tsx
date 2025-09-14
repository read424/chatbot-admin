'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission, UserRole } from '@/types/permissions';
import { AlertTriangle, ArrowLeft, Lock, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermissions?: Permission[];
  requireAllPermissions?: boolean; // true = todos los permisos, false = al menos uno
  fallback?: React.ReactNode;
  redirectTo?: string;
  showAccessDenied?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermissions = [],
  requireAllPermissions = true,
  fallback,
  redirectTo = '/login',
  showAccessDenied = true
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { hasRole, hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  const router = useRouter();

  // Verificar autenticación
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Mostrar loading mientras verifica
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // No mostrar nada si no está autenticado
  if (!isAuthenticated) {
    return fallback || null;
  }

  // Verificar rol requerido
  if (requiredRole && !hasRole(requiredRole)) {
    if (showAccessDenied) {
      return <AccessDeniedScreen reason="role" requiredRole={requiredRole} userRole={user?.role} />;
    }
    return fallback || null;
  }

  // Verificar permisos requeridos
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAllPermissions 
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasRequiredPermissions) {
      if (showAccessDenied) {
        return <AccessDeniedScreen reason="permissions" requiredPermissions={requiredPermissions} />;
      }
      return fallback || null;
    }
  }

  return <>{children}</>;
};

interface AccessDeniedScreenProps {
  reason: 'role' | 'permissions';
  requiredRole?: UserRole;
  userRole?: string;
  requiredPermissions?: Permission[];
}

const AccessDeniedScreen: React.FC<AccessDeniedScreenProps> = ({
  reason,
  requiredRole,
  userRole,
  requiredPermissions = []
}) => {
  const router = useRouter();

  const getReasonMessage = () => {
    if (reason === 'role') {
      return {
        title: 'Rol Insuficiente',
        message: `Necesitas el rol de "${requiredRole}" para acceder a esta página.`,
        details: `Tu rol actual es "${userRole}".`
      };
    } else {
      return {
        title: 'Permisos Insuficientes',
        message: 'No tienes los permisos necesarios para acceder a esta página.',
        details: `Se requieren los siguientes permisos: ${requiredPermissions.join(', ')}`
      };
    }
  };

  const reasonInfo = getReasonMessage();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icono */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          {reason === 'role' ? (
            <Shield className="h-8 w-8 text-red-600" />
          ) : (
            <Lock className="h-8 w-8 text-red-600" />
          )}
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {reasonInfo.title}
        </h2>

        {/* Mensaje principal */}
        <p className="text-gray-600 mb-4">
          {reasonInfo.message}
        </p>

        {/* Detalles */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm text-gray-700">
                {reasonInfo.details}
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="text-sm text-gray-500 mb-6">
          <p>
            Si crees que esto es un error, contacta al administrador del sistema.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook para verificar permisos en componentes
export const useRequirePermission = (permission: Permission) => {
  const { hasPermission } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!hasPermission(permission)) {
      router.push('/dashboard');
    }
  }, [hasPermission, permission, router]);

  return hasPermission(permission);
};

// Hook para verificar roles en componentes
export const useRequireRole = (role: UserRole) => {
  const { hasRole } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!hasRole(role)) {
      router.push('/dashboard');
    }
  }, [hasRole, role, router]);

  return hasRole(role);
};