'use client';

import { authService } from '@/lib/api/auth';
import type { User } from '@/lib/api/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User) => void;
}

// Usuarios demo para el login
const demoUsers: Record<string, { password: string; user: User }> = {
  'admin@inbox.com': {
    password: 'admin123',
    user: {
      id: 'admin-001',
      email: 'admin@inbox.com',
      name: 'Admin Usuario',
      role: 'admin',
      department: 'Administración',
      isActive: true,
      permissions: ['all'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }
  },
  'agente@inbox.com': {
    password: 'agente123',
    user: {
      id: 'agent-001',
      email: 'agente@inbox.com',
      name: 'Juan Pérez',
      role: 'agent',
      department: 'Ventas',
      isActive: true,
      permissions: ['chat', 'view_stats'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }
  },
  'supervisor@inbox.com': {
    password: 'supervisor123',
    user: {
      id: 'supervisor-001',
      email: 'supervisor@inbox.com',
      name: 'Ana López',
      role: 'supervisor',
      department: 'Supervisión',
      isActive: true,
      permissions: ['chat', 'manage_users', 'view_reports'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }
  }
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Login function
            login: async (email: string, password: string): Promise<boolean> => {
                set({ isLoading: true, error: null });

                try {
                    // Llamar al servicio de autenticación que conecta con el backend
                    const response = await authService.login({ email, password });

                    // Actualizar estado con la respuesta del backend
                    set({
                        user: response.user,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });

                    return true;
                } catch (error: any) {
                    set({
                        error: error.message || 'Error al iniciar sesión',
                        isLoading: false,
                        user: null,
                        isAuthenticated: false
                    });
                    return false;
                }
            },

            // Logout function
            logout: () => {
                // Llamar al servicio para limpiar localStorage
                authService.logout();

                // Limpiar estado de Zustand
                set({
                user: null,
                isAuthenticated: false,
                error: null
                });
                
                // Limpiar storage persistente adicional
                if (typeof window !== 'undefined') {
                localStorage.removeItem('auth-storage');
                localStorage.removeItem('sessionExpiry');
                localStorage.removeItem('rememberMe');
                }
            },

            // Clear error
            clearError: () => set({ error: null }),

            // Set user (para persistencia)
            setUser: (user: User) => set({ 
                user, 
                isAuthenticated: true 
            })
        }),
        {
            name: 'auth-storage', // nombre único para el storage
            partialize: (state) => ({ 
                user: state.user, 
                isAuthenticated: state.isAuthenticated 
            }), // solo persistir user e isAuthenticated
        }
    )
);