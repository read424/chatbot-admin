'use client';

import type { User } from '@/lib/api/types';
import { create } from 'zustand';

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

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state - Asegurar consistencia entre servidor y cliente
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Login function
  login: async (email: string, password: string): Promise<boolean> => {
    set({ isLoading: true, error: null });

    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const demoUser = demoUsers[email.toLowerCase()];
      
      if (!demoUser || demoUser.password !== password) {
        set({ 
          error: 'Credenciales inválidas. Intenta con admin@inbox.com / admin123',
          isLoading: false 
        });
        return false;
      }

      // Login exitoso
      set({
        user: demoUser.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      // Guardar en localStorage para persistencia (solo en el cliente)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(demoUser.user));
        localStorage.setItem('isAuthenticated', 'true');
      }

      return true;
    } catch (error) {
      set({
        error: 'Error de conexión. Intenta nuevamente.',
        isLoading: false
      });
      return false;
    }
  },

  // Logout function
  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      error: null
    });

    // Limpiar localStorage (solo en el cliente)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Set user (para persistencia)
  setUser: (user: User) => set({ 
    user, 
    isAuthenticated: true 
  })
}));