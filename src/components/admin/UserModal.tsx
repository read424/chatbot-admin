'use client';

import { useUserStore, type UserProfile } from '@/stores/userStore';
import { Building, Eye, EyeOff, Mail, Phone, Save, Shield, User, X, Upload, Camera, Check, AlertCircle } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';

interface UserModalProps {
  mode: 'create' | 'edit';
  user: UserProfile | null;
  onClose: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'supervisor' | 'agent';
  status: 'active' | 'inactive';
  department: string;
  password: string;
  confirmPassword: string;
  permissions: string[];
  avatar?: string;
}

interface Department {
  id: string;
  name: string;
  description?: string;
  manager?: string;
  userCount: number;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'system' | 'chat' | 'user' | 'report';
}

interface FormErrors {
  [key: string]: string;
}

export const UserModal: React.FC<UserModalProps> = ({
  mode,
  user,
  onClose
}) => {
  const { createUser, updateUser, isLoading, error, clearError } = useUserStore();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'agent',
    status: 'active',
    department: 'Ventas',
    password: '',
    confirmPassword: '',
    permissions: []
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        status: user.status,
        department: user.department || 'Ventas',
        password: '',
        confirmPassword: '',
        permissions: user.permissions,
        avatar: user.avatar
      });
      setAvatarPreview(user.avatar || null);
    }
    clearError();
  }, [mode, user, clearError]);

  const departments: Department[] = [
    { id: '1', name: 'Ventas', description: 'Equipo de ventas y atención al cliente', manager: 'Ana López', userCount: 12 },
    { id: '2', name: 'Administración', description: 'Gestión administrativa y recursos humanos', manager: 'Admin Usuario', userCount: 3 },
    { id: '3', name: 'Soporte', description: 'Soporte técnico y atención post-venta', manager: 'Carlos Mendoza', userCount: 8 },
    { id: '4', name: 'Marketing', description: 'Marketing digital y comunicaciones', manager: 'María García', userCount: 5 },
    { id: '5', name: 'Recursos Humanos', description: 'Gestión de personal y desarrollo organizacional', manager: 'Luis Rodríguez', userCount: 2 }
  ];

  const availablePermissions: Permission[] = [
    // System permissions
    { id: 'system_admin', name: 'Administrador del Sistema', description: 'Acceso completo a todas las funciones', category: 'system' },
    { id: 'manage_users', name: 'Gestionar Usuarios', description: 'Crear, editar y eliminar usuarios', category: 'system' },
    { id: 'manage_departments', name: 'Gestionar Departamentos', description: 'Administrar departamentos y asignaciones', category: 'system' },
    { id: 'system_settings', name: 'Configuración del Sistema', description: 'Modificar configuraciones globales', category: 'system' },
    
    // Chat permissions
    { id: 'handle_chats', name: 'Manejar Conversaciones', description: 'Responder y gestionar chats de clientes', category: 'chat' },
    { id: 'assign_chats', name: 'Asignar Conversaciones', description: 'Asignar chats a otros agentes', category: 'chat' },
    { id: 'transfer_chats', name: 'Transferir Conversaciones', description: 'Transferir chats entre agentes/departamentos', category: 'chat' },
    { id: 'close_chats', name: 'Cerrar Conversaciones', description: 'Finalizar conversaciones con clientes', category: 'chat' },
    { id: 'view_chat_history', name: 'Ver Historial de Chats', description: 'Acceder al historial completo de conversaciones', category: 'chat' },
    
    // User permissions
    { id: 'edit_profile', name: 'Editar Perfil', description: 'Modificar información personal', category: 'user' },
    { id: 'change_password', name: 'Cambiar Contraseña', description: 'Actualizar contraseña personal', category: 'user' },
    { id: 'manage_availability', name: 'Gestionar Disponibilidad', description: 'Cambiar estado de disponibilidad', category: 'user' },
    
    // Report permissions
    { id: 'view_reports', name: 'Ver Reportes', description: 'Acceder a reportes y estadísticas', category: 'report' },
    { id: 'export_reports', name: 'Exportar Reportes', description: 'Descargar reportes en diferentes formatos', category: 'report' },
    { id: 'advanced_analytics', name: 'Análisis Avanzado', description: 'Acceder a métricas y análisis detallados', category: 'report' }
  ];

  const rolePermissions = {
    admin: ['system_admin'],
    supervisor: ['manage_users', 'assign_chats', 'transfer_chats', 'close_chats', 'view_chat_history', 'view_reports', 'export_reports', 'handle_chats', 'edit_profile', 'change_password', 'manage_availability'],
    agent: ['handle_chats', 'edit_profile', 'change_password', 'manage_availability']
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Formato de teléfono inválido';
    }

    if (mode === 'create') {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      status: formData.status,
      department: formData.department,
      hireDate: user?.hireDate || new Date().toISOString().split('T')[0],
      permissions: rolePermissions[formData.role]
    };

    let success = false;
    
    if (mode === 'create') {
      success = await createUser(userData);
    } else if (user) {
      success = await updateUser(user.id, userData);
    }

    if (success) {
      onClose();
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRoleChange = (role: 'admin' | 'supervisor' | 'agent') => {
    setFormData(prev => ({
      ...prev,
      role,
      permissions: rolePermissions[role]
    }));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, avatar: 'Solo se permiten archivos de imagen' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, avatar: 'El archivo debe ser menor a 5MB' }));
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        setFormData(prev => ({ ...prev, avatar: result }));
        setErrors(prev => ({ ...prev, avatar: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const getPermissionsByCategory = (category: string) => {
    return availablePermissions.filter(p => p.category === category);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system': return <Shield className="w-4 h-4" />;
      case 'chat': return <Mail className="w-4 h-4" />;
      case 'user': return <User className="w-4 h-4" />;
      case 'report': return <Building className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'system': return 'Sistema';
      case 'chat': return 'Conversaciones';
      case 'user': return 'Usuario';
      case 'report': return 'Reportes';
      default: return category;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
              </h2>
              <p className="text-sm text-gray-600">
                {mode === 'create' 
                  ? 'Completa la información para crear un nuevo usuario'
                  : 'Modifica la información del usuario'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
            
            {/* Avatar Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto de Perfil
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {avatarPreview || (user && user.avatar) ? (
                    <img
                      src={avatarPreview || user?.avatar}
                      alt="Avatar preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-lg">
                        {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Subir Foto</span>
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG o GIF. Máximo 5MB.
                  </p>
                  {errors.avatar && (
                    <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombres *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${
                    errors.firstName 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                  }`}
                  placeholder="Nombres del usuario"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellidos *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${
                    errors.lastName 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                  }`}
                  placeholder="Apellidos del usuario"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="inline w-4 h-4 mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${
                    errors.email 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                  }`}
                  placeholder="usuario@empresa.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="inline w-4 h-4 mr-1" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${
                    errors.phone 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                  }`}
                  placeholder="+51 987654321"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Cuenta</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Shield className="inline w-4 h-4 mr-1" />
                  Rol *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                >
                  <option value="agent">Agente</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Building className="inline w-4 h-4 mr-1" />
                  Departamento
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                >
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
                {formData.department && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    {departments.find(d => d.name === formData.department)?.description}
                    <br />
                    <span className="font-medium">
                      Manager: {departments.find(d => d.name === formData.department)?.manager} • 
                      {departments.find(d => d.name === formData.department)?.userCount} usuarios
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Password (solo para crear) */}
          {mode === 'create' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Acceso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${
                        errors.password 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                      }`}
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${
                        errors.confirmPassword 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
                      }`}
                      placeholder="Repetir contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Permissions Management */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Gestión de Permisos</h3>
              <button
                type="button"
                onClick={() => setShowPermissions(!showPermissions)}
                className="text-sm text-green-600 hover:text-green-800 font-medium"
              >
                {showPermissions ? 'Ocultar detalles' : 'Personalizar permisos'}
              </button>
            </div>

            {/* Role-based permissions summary */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Permisos base del rol <strong>{formData.role}</strong>:
              </p>
              <div className="flex flex-wrap gap-2">
                {rolePermissions[formData.role].map(permissionId => {
                  const permission = availablePermissions.find(p => p.id === permissionId);
                  return permission ? (
                    <span
                      key={permissionId}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center space-x-1"
                    >
                      {getCategoryIcon(permission.category)}
                      <span>{permission.name}</span>
                    </span>
                  ) : null;
                })}
              </div>
            </div>

            {/* Detailed permissions */}
            {showPermissions && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Personalización de Permisos</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Puedes personalizar los permisos específicos para este usuario. Los cambios sobrescribirán los permisos base del rol.
                  </p>
                </div>

                {['system', 'chat', 'user', 'report'].map(category => (
                  <div key={category} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                      {getCategoryIcon(category)}
                      <span>{getCategoryName(category)}</span>
                    </h4>
                    <div className="space-y-2">
                      {getPermissionsByCategory(category).map(permission => (
                        <label key={permission.id} className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">{permission.name}</span>
                              {formData.permissions.includes(permission.id) && (
                                <Check className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{permission.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Permission Summary */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Resumen de Permisos Activos</h4>
                  <div className="flex flex-wrap gap-1">
                    {formData.permissions.map(permissionId => {
                      const permission = availablePermissions.find(p => p.id === permissionId);
                      return permission ? (
                        <span
                          key={permissionId}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {permission.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    Total: {formData.permissions.length} permisos activos
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};