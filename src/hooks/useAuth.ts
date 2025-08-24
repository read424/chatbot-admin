'use client';

import { useAuthStore, type User } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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

  const router = useRouter();

  // Verificar persistencia al cargar
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const savedAuth = localStorage.getItem('isAuthenticated');

        if (savedUser && savedAuth === 'true') {
          const userData: User = JSON.parse(savedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        // Si hay error, limpiar storage corrupto
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      }
    };

    checkAuth();
  }, [setUser]);

  // Login con redirección
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    const success = await login(email, password);
    if (success) {
      router.push('/dashboard');
    }
    return success;
  };

  // Logout con redirección
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

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

    // Actions
    login: handleLogin,
    logout: handleLogout,
    clearError,

    // Utilities
    hasPermission,
    requireAuth,
    
    // User info
    userName: user?.name || 'Usuario',
    userRole: user?.role || 'agent',
    userEmail: user?.email || ''
  };
};