'use client';

import { create } from 'zustand';

export interface DepartmentOption {
  id: string;
  icon: string;
  label: string;
  response: string;
  order: number;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  color: string;
  status: 'active' | 'inactive';
  description: string;
  welcomeMessage: string;
  options: DepartmentOption[];
  createdAt: string;
  updatedAt: string;
  stats: {
    totalUsers: number;
    activeChats: number;
    avgResponseTime: number;
  };
}

export interface DepartmentVariable {
  key: string;
  label: string;
  description: string;
  example: string;
}

interface DepartmentState {
  // State
  departments: Department[];
  selectedDepartment: Department | null;
  isLoading: boolean;
  error: string | null;
  
  // Available variables
  availableVariables: DepartmentVariable[];
  
  // Actions
  fetchDepartments: () => Promise<void>;
  createDepartment: (data: Omit<Department, 'id' | 'createdAt' | 'updatedAt' | 'stats'>) => Promise<boolean>;
  updateDepartment: (id: string, updates: Partial<Department>) => Promise<boolean>;
  deleteDepartment: (id: string) => Promise<boolean>;
  toggleDepartmentStatus: (id: string) => Promise<boolean>;
  setSelectedDepartment: (department: Department | null) => void;
  clearError: () => void;
  
  // Option management
  addOption: (departmentId: string, option: Omit<DepartmentOption, 'id' | 'order'>) => Promise<boolean>;
  updateOption: (departmentId: string, optionId: string, updates: Partial<DepartmentOption>) => Promise<boolean>;
  deleteOption: (departmentId: string, optionId: string) => Promise<boolean>;
  reorderOptions: (departmentId: string, options: DepartmentOption[]) => Promise<boolean>;
  
  // Utilities
  getDepartmentById: (id: string) => Department | undefined;
  previewMessage: (message: string, variables: Record<string, string>) => string;
  getDepartmentStats: () => {
    total: number;
    active: number;
    inactive: number;
    totalUsers: number;
  };
}

// Variables disponibles para personalización
const defaultVariables: DepartmentVariable[] = [
  {
    key: 'nombre',
    label: 'Nombre del Cliente',
    description: 'Nombre completo del cliente',
    example: 'Juan Pérez'
  },
  {
    key: 'telefono',
    label: 'Teléfono',
    description: 'Número de teléfono del cliente',
    example: '+51 987654321'
  },
  {
    key: 'email',
    label: 'Email',
    description: 'Correo electrónico del cliente',
    example: 'juan@email.com'
  },
  {
    key: 'fecha',
    label: 'Fecha Actual',
    description: 'Fecha actual del sistema',
    example: '24 de Agosto, 2024'
  },
  {
    key: 'hora',
    label: 'Hora Actual',
    description: 'Hora actual del sistema',
    example: '14:30'
  }
];

// Función para obtener datos iniciales consistentes
const getInitialDepartments = (): Department[] => [
  {
    id: '1',
    name: 'Ventas',
    color: '#10b981',
    status: 'active',
    description: 'Departamento encargado de las ventas y atención comercial',
    welcomeMessage: '¡Hola {{nombre}}! 👋\n\nBienvenido al departamento de Ventas.\nEstamos aquí para ayudarte con todas tus consultas sobre productos y servicios.\n\n¿En qué podemos ayudarte hoy?',
    options: [
      {
        id: '1',
        icon: '💰',
        label: 'Ver productos',
        response: 'Aquí tienes nuestro catálogo completo de productos. ¿Te interesa alguna categoría en particular?',
        order: 1,
        isActive: true
      },
      {
        id: '2',
        icon: '📞',
        label: 'Contactar vendedor',
        response: 'Te conectamos inmediatamente con uno de nuestros asesores especializados.',
        order: 2,
        isActive: true
      },
      {
        id: '3',
        icon: '💬',
        label: 'Hacer consulta',
        response: '¿Qué información específica necesitas? Estoy aquí para ayudarte.',
        order: 3,
        isActive: true
      }
    ],
    createdAt: '2024-01-15',
    updatedAt: '2024-08-20',
    stats: {
      totalUsers: 12,
      activeChats: 8,
      avgResponseTime: 2.3
    }
  },
  {
    id: '2',
    name: 'Soporte Técnico',
    color: '#3b82f6',
    status: 'active',
    description: 'Departamento de soporte y asistencia técnica',
    welcomeMessage: 'Hola {{nombre}}, somos el equipo de Soporte Técnico 🛠️\n\nEstamos aquí para resolver cualquier problema técnico que tengas.\n\n¿Qué tipo de asistencia necesitas?',
    options: [
      {
        id: '1',
        icon: '🔧',
        label: 'Problema técnico',
        response: 'Descríbeme el problema que estás experimentando y te ayudaré a resolverlo.',
        order: 1,
        isActive: true
      },
      {
        id: '2',
        icon: '📱',
        label: 'Configuración',
        response: '¿Necesitas ayuda para configurar algún servicio? Te guío paso a paso.',
        order: 2,
        isActive: true
      }
    ],
    createdAt: '2024-02-10',
    updatedAt: '2024-08-18',
    stats: {
      totalUsers: 8,
      activeChats: 5,
      avgResponseTime: 3.1
    }
  },
  {
    id: '3',
    name: 'Marketing',
    color: '#f59e0b',
    status: 'active',
    description: 'Departamento de marketing y promociones',
    welcomeMessage: '¡Hola {{nombre}}! 🎉\n\nSomos el equipo de Marketing y tenemos ofertas especiales para ti.\n\n¿Te interesa conocer nuestras promociones actuales?',
    options: [
      {
        id: '1',
        icon: '🎁',
        label: 'Ver promociones',
        response: 'Estas son nuestras mejores ofertas disponibles ahora mismo...',
        order: 1,
        isActive: true
      },
      {
        id: '2',
        icon: '📧',
        label: 'Suscribirse a newsletter',
        response: '¡Genial! Te suscribiremos a nuestro newsletter para recibir ofertas exclusivas.',
        order: 2,
        isActive: true
      }
    ],
    createdAt: '2024-03-05',
    updatedAt: '2024-08-15',
    stats: {
      totalUsers: 5,
      activeChats: 3,
      avgResponseTime: 1.8
    }
  }
];

export const useDepartmentStore = create<DepartmentState>((set, get) => ({
  // Initial state
  departments: getInitialDepartments(),
  selectedDepartment: null,
  isLoading: false,
  error: null,
  availableVariables: defaultVariables,

  // Fetch departments
  fetchDepartments: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Error al cargar departamentos', isLoading: false });
    }
  },

  // Create department
  createDepartment: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newDepartment: Department = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        stats: {
          totalUsers: 0,
          activeChats: 0,
          avgResponseTime: 0
        }
      };

      set(state => ({
        departments: [...state.departments, newDepartment],
        isLoading: false,
        error: null
      }));

      return true;
    } catch (error) {
      set({ error: 'Error al crear departamento', isLoading: false });
      return false;
    }
  },

  // Update department
  updateDepartment: async (id, updates) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      set(state => ({
        departments: state.departments.map(dept => 
          dept.id === id 
            ? { ...dept, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
            : dept
        ),
        selectedDepartment: state.selectedDepartment?.id === id 
          ? { ...state.selectedDepartment, ...updates } 
          : state.selectedDepartment,
        isLoading: false
      }));

      return true;
    } catch (error) {
      set({ error: 'Error al actualizar departamento', isLoading: false });
      return false;
    }
  },

  // Delete department
  deleteDepartment: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));

      set(state => ({
        departments: state.departments.filter(dept => dept.id !== id),
        selectedDepartment: state.selectedDepartment?.id === id ? null : state.selectedDepartment,
        isLoading: false
      }));

      return true;
    } catch (error) {
      set({ error: 'Error al eliminar departamento', isLoading: false });
      return false;
    }
  },

  // Toggle department status
  toggleDepartmentStatus: async (id) => {
    const department = get().departments.find(d => d.id === id);
    if (!department) return false;

    const newStatus = department.status === 'active' ? 'inactive' : 'active';
    return get().updateDepartment(id, { status: newStatus });
  },

  // Set selected department
  setSelectedDepartment: (department) => set({ selectedDepartment: department }),

  // Clear error
  clearError: () => set({ error: null }),

  // Add option
  addOption: async (departmentId, optionData) => {
    const department = get().departments.find(d => d.id === departmentId);
    if (!department) return false;

    const newOption: DepartmentOption = {
      ...optionData,
      id: Date.now().toString(),
      order: department.options.length + 1
    };

    const updatedOptions = [...department.options, newOption];
    return get().updateDepartment(departmentId, { options: updatedOptions });
  },

  // Update option
  updateOption: async (departmentId, optionId, updates) => {
    const department = get().departments.find(d => d.id === departmentId);
    if (!department) return false;

    const updatedOptions = department.options.map(opt =>
      opt.id === optionId ? { ...opt, ...updates } : opt
    );

    return get().updateDepartment(departmentId, { options: updatedOptions });
  },

  // Delete option
  deleteOption: async (departmentId, optionId) => {
    const department = get().departments.find(d => d.id === departmentId);
    if (!department) return false;

    const updatedOptions = department.options.filter(opt => opt.id !== optionId);
    return get().updateDepartment(departmentId, { options: updatedOptions });
  },

  // Reorder options
  reorderOptions: async (departmentId, options) => {
    const reorderedOptions = options.map((opt, index) => ({ ...opt, order: index + 1 }));
    return get().updateDepartment(departmentId, { options: reorderedOptions });
  },

  // Get department by ID
  getDepartmentById: (id) => {
    return get().departments.find(dept => dept.id === id);
  },

  // Preview message with variables
  previewMessage: (message, variables) => {
    let preview = message;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      preview = preview.replace(regex, value);
    });
    return preview;
  },

  // Get department statistics
  getDepartmentStats: () => {
    const departments = get().departments;
    const total = departments.length;
    const active = departments.filter(d => d.status === 'active').length;
    const inactive = total - active;
    const totalUsers = departments.reduce((sum, dept) => sum + dept.stats.totalUsers, 0);

    return { total, active, inactive, totalUsers };
  }
}));