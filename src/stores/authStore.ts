'use client';

import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent' | 'supervisor';
  avatar?: string;
}

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
      id: '1',
      email: 'admin@inbox.com',
      name: 'Admin Usuario',
      role: 'admin'
    }
  },
  'agente@inbox.com': {
    password: 'agente123',
    user: {
      id: '2',
      email: 'agente@inbox.com',
      name: 'Juan Pérez',
      role: 'agent'
    }
  },
  'supervisor@inbox.com': {
    password: 'supervisor123',
    user: {
      id: '3',
      email: 'supervisor@inbox.com',
      name: 'Ana López',
      role: 'supervisor'
    }
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
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

      // Guardar en localStorage para persistencia
      localStorage.setItem('user', JSON.stringify(demoUser.user));
      localStorage.setItem('isAuthenticated', 'true');

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

    // Limpiar localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Set user (para persistencia)
  setUser: (user: User) => set({ 
    user, 
    isAuthenticated: true 
  })
}));