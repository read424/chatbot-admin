'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
    setUser
  } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const router = useRouter();


  // Verificar persistencia al cargar (solo en el cliente)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Limpiar sesión expirada
  const clearExpiredSession = useCallback(() => {
    logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sessionExpiry');
      localStorage.removeItem('rememberMe');
    }
  }, [logout]);

  // Login con redirección y gestión de sesión
  const handleLogin = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    const success = await login(email, password);
    if (success) {
      // Establecer expiración de sesión
      const sessionDuration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000; // 30 días o 8 horas
      const expiry = new Date(Date.now() + sessionDuration);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('sessionExpiry', expiry.toISOString());
      }
      
      router.push('/dashboard');
    }
    return success;
  };

  // Logout con redirección
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Extender sesión
  const extendSession = useCallback((rememberMe: boolean = false) => {
    if (typeof window !== 'undefined') {
      const sessionDuration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000;
      const expiry = new Date(Date.now() + sessionDuration);
      localStorage.setItem('sessionExpiry', expiry.toISOString());
    }
  }, []);

  // Verificar si la sesión está próxima a expirar
  const isSessionExpiring = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    if (!sessionExpiry) return false;
    
    const expiry = new Date(sessionExpiry);
    const now = new Date();
    const timeUntilExpiry = expiry.getTime() - now.getTime();
    
    // Considerar que está expirando si quedan menos de 5 minutos
    return timeUntilExpiry < 5 * 60 * 1000;
  }, []);

  // Obtener tiempo restante de sesión
  const getSessionTimeRemaining = useCallback((): number => {
    if (typeof window === 'undefined') return 0;
    
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    if (!sessionExpiry) return 0;
    
    const expiry = new Date(sessionExpiry);
    const now = new Date();
    const timeUntilExpiry = expiry.getTime() - now.getTime();
    
    return Math.max(0, timeUntilExpiry / (1000 * 60)); // en minutos
  }, []);

  // Verificar si el usuario tiene permisos
  const hasPermission = (requiredRole?: 'admin' | 'agent' | 'supervisor'): boolean => {
    if (!isAuthenticated || !user) return false;
    if (!requiredRole) return true;

    const roleHierarchy = {
      'admin': 3,
      'supervisor': 2,
      'agent': 1
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  // Redirigir si no está autenticado
  const requireAuth = (redirectTo: string = '/login') => {
    useEffect(() => {
      if (!isAuthenticated && !isLoading) {
        router.push(redirectTo);
      }
    }, [isAuthenticated, isLoading, router, redirectTo]);
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    mounted,

    // Actions
    login: handleLogin,
    logout: handleLogout,
    clearError,
    extendSession,

    // Utilities
    hasPermission: mounted ? hasPermission : () => false,
    requireAuth,
    isSessionExpiring: mounted ? isSessionExpiring : () => false,
    getSessionTimeRemaining: mounted ? getSessionTimeRemaining : () => 0,
    
    // User info
    userName: user?.name || 'Usuario',
    userRole: user?.role || 'agent',
    userEmail: user?.email || ''
  };
};