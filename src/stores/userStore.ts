'use client';

import { create } from 'zustand';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'supervisor' | 'agent';
  status: 'active' | 'inactive';
  avatar?: string;
  phone?: string;
  department?: string;
  hireDate: string;
  lastLogin?: string;
  permissions: string[];
  stats: {
    totalChats: number;
    activeChats: number;
    avgResponseTime: number;
    satisfaction: number;
  };
}

interface UserState {
  // State
  users: UserProfile[];
  selectedUser: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  
  // Filters
  filters: {
    search: string;
    role: 'all' | 'admin' | 'supervisor' | 'agent';
    status: 'all' | 'active' | 'inactive';
    department: 'all' | string;
  };
  
  // Actions
  fetchUsers: () => Promise<void>;
  createUser: (userData: Omit<UserProfile, 'id' | 'stats'>) => Promise<boolean>;
  updateUser: (id: string, updates: Partial<UserProfile>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  toggleUserStatus: (id: string) => Promise<boolean>;
  setSelectedUser: (user: UserProfile | null) => void;
  setFilters: (filters: Partial<UserState['filters']>) => void;
  clearError: () => void;
  
  // Utilities
  getFilteredUsers: () => UserProfile[];
  getUserById: (id: string) => UserProfile | undefined;
  getUserStats: () => {
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
  };
}

// Datos iniciales de usuarios
const initialUsers: UserProfile[] = [
  {
    id: '1',
    email: 'admin@inbox.com',
    name: 'Admin Usuario',
    firstName: 'Admin',
    lastName: 'Usuario',
    role: 'admin',
    status: 'active',
    phone: '+51 999888777',
    department: 'Administración',
    hireDate: '2023-01-15',
    lastLogin: '2024-08-24 14:30',
    permissions: ['all'],
    stats: {
      totalChats: 0,
      activeChats: 0,
      avgResponseTime: 0,
      satisfaction: 0
    }
  },
  {
    id: '2',
    email: 'supervisor@inbox.com',
    name: 'Ana López',
    firstName: 'Ana',
    lastName: 'López',
    role: 'supervisor',
    status: 'active',
    phone: '+51 987654321',
    department: 'Ventas',
    hireDate: '2023-03-10',
    lastLogin: '2024-08-24 13:45',
    permissions: ['manage_agents', 'view_reports', 'assign_chats'],
    stats: {
      totalChats: 245,
      activeChats: 12,
      avgResponseTime: 2.3,
      satisfaction: 4.7
    }
  },
  {
    id: '3',
    email: 'agente@inbox.com',
    name: 'Juan Pérez',
    firstName: 'Juan',
    lastName: 'Pérez',
    role: 'agent',
    status: 'active',
    phone: '+51 912345678',
    department: 'Ventas',
    hireDate: '2023-06-20',
    lastLogin: '2024-08-24 15:20',
    permissions: ['handle_chats', 'edit_profile'],
    stats: {
      totalChats: 189,
      activeChats: 8,
      avgResponseTime: 3.1,
      satisfaction: 4.5
    }
  },
  {
    id: '4',
    email: 'pedro.silva@inbox.com',
    name: 'Pedro Silva',
    firstName: 'Pedro',
    lastName: 'Silva',
    role: 'agent',
    status: 'active',
    phone: '+51 998877665',
    department: 'Ventas',
    hireDate: '2023-08-15',
    lastLogin: '2024-08-24 12:10',
    permissions: ['handle_chats', 'edit_profile'],
    stats: {
      totalChats: 156,
      activeChats: 6,
      avgResponseTime: 2.8,
      satisfaction: 4.6
    }
  },
  {
    id: '5',
    email: 'carmen.torres@inbox.com',
    name: 'Carmen Torres',
    firstName: 'Carmen',
    lastName: 'Torres',
    role: 'agent',
    status: 'inactive',
    phone: '+51 987123456',
    department: 'Ventas',
    hireDate: '2023-05-01',
    lastLogin: '2024-08-20 16:45',
    permissions: ['handle_chats', 'edit_profile'],
    stats: {
      totalChats: 201,
      activeChats: 0,
      avgResponseTime: 4.2,
      satisfaction: 4.1
    }
  }
];

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  users: initialUsers,
  selectedUser: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    role: 'all',
    status: 'all',
    department: 'all'
  },

  // Fetch users (simulated)
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Error al cargar usuarios', isLoading: false });
    }
  },

  // Create user
  createUser: async (userData) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if email already exists
      const existingUser = get().users.find(u => u.email === userData.email);
      if (existingUser) {
        set({ error: 'Ya existe un usuario con este email', isLoading: false });
        return false;
      }

      const newUser: UserProfile = {
        ...userData,
        id: Date.now().toString(),
        stats: {
          totalChats: 0,
          activeChats: 0,
          avgResponseTime: 0,
          satisfaction: 0
        }
      };

      set(state => ({
        users: [...state.users, newUser],
        isLoading: false,
        error: null
      }));

      return true;
    } catch (error) {
      set({ error: 'Error al crear usuario', isLoading: false });
      return false;
    }
  },

  // Update user
  updateUser: async (id, updates) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));

      set(state => ({
        users: state.users.map(user => 
          user.id === id 
            ? { 
                ...user, 
                ...updates, 
                name: updates.firstName && updates.lastName 
                  ? `${updates.firstName} ${updates.lastName}` 
                  : user.name 
              } 
            : user
        ),
        selectedUser: state.selectedUser?.id === id 
          ? { ...state.selectedUser, ...updates } 
          : state.selectedUser,
        isLoading: false
      }));

      return true;
    } catch (error) {
      set({ error: 'Error al actualizar usuario', isLoading: false });
      return false;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      set(state => ({
        users: state.users.filter(user => user.id !== id),
        selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
        isLoading: false
      }));

      return true;
    } catch (error) {
      set({ error: 'Error al eliminar usuario', isLoading: false });
      return false;
    }
  },

  // Toggle user status
  toggleUserStatus: async (id) => {
    const user = get().users.find(u => u.id === id);
    if (!user) return false;

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    return get().updateUser(id, { status: newStatus });
  },

  // Set selected user
  setSelectedUser: (user) => set({ selectedUser: user }),

  // Set filters
  setFilters: (newFilters) => set(state => ({
    filters: { ...state.filters, ...newFilters }
  })),

  // Clear error
  clearError: () => set({ error: null }),

  // Get filtered users
  getFilteredUsers: () => {
    const { users, filters } = get();
    return users.filter(user => {
      const matchesSearch = filters.search === '' ||
        user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.phone?.includes(filters.search);

      const matchesRole = filters.role === 'all' || user.role === filters.role;
      const matchesStatus = filters.status === 'all' || user.status === filters.status;
      const matchesDepartment = filters.department === 'all' || user.department === filters.department;

      return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
    });
  },

  // Get user by ID
  getUserById: (id) => {
    return get().users.find(user => user.id === id);
  },

  // Get user statistics
  getUserStats: () => {
    const users = get().users;
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const inactive = total - active;
    
    const byRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, active, inactive, byRole };
  }
}));