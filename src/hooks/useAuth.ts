'use client';

import type { User } from '@/lib/api/types';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

    const checkAuth = () => {
      // Verificar que estamos en el cliente
      if (typeof window === 'undefined') return;
      
      try {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');

        // Verificar si hay usuario y token (del authService o del store)
        if (savedUser && (savedToken || localStorage.getItem('isAuthenticated') === 'true')) {
          const userData: User = JSON.parse(savedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        // Si hay error, limpiar storage corrupto
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('token');
        }
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
    // También limpiar token del authService (solo en el cliente)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
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
    mounted,

    // Actions
    login: handleLogin,
    logout: handleLogout,
    clearError,

    // Utilities
    hasPermission: mounted ? hasPermission : () => false,
    requireAuth,
    
    // User info
    userName: user?.name || 'Usuario',
    userRole: user?.role || 'agent',
    userEmail: user?.email || ''
  };
};