'use client';

import { useDepartmentStore, type Department, type DepartmentOption } from '@/stores/departmentStore';
import {
    Building,
    Eye,
    GripVertical,
    List,
    MessageSquare,
    Palette,
    Plus,
    Save,
    Trash2,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface DepartmentModalProps {
  mode: 'create' | 'edit';
  department: Department | null;
  onClose: () => void;
}

interface FormData {
  name: string;
  color: string;
  status: 'active' | 'inactive';
  description: string;
  welcomeMessage: string;
  options: DepartmentOption[];
}

const predefinedColors = [
  '#10b981', // Green
  '#3b82f6', // Blue  
  '#f59e0b', // Yellow
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#84cc16', // Lime
  '#ec4899', // Pink
  '#6b7280', // Gray
  '#14b8a6', // Teal
  '#a855f7'  // Violet
];

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  mode,
  department,
  onClose
}) => {
  const { 
    createDepartment, 
    updateDepartment, 
    isLoading, 
    error, 
    clearError,
    availableVariables,
    previewMessage 
  } = useDepartmentStore();

  const [activeTab, setActiveTab] = useState<'info' | 'message' | 'options'>('info');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    color: predefinedColors[0],
    status: 'active',
    description: '',
    welcomeMessage: '¡Hola {{nombre}}! 👋\n\nBienvenido al departamento de {{departamento}}.\n\n¿En qué podemos ayudarte hoy?',
    options: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newOption, setNewOption] = useState({ icon: '💬', label: '', response: '' });

  useEffect(() => {
    if (mode === 'edit' && department) {
      setFormData({
        name: department.name,
        color: department.color,
        status: department.status,
        description: department.description,
        welcomeMessage: department.welcomeMessage,
        options: [...department.options]
      });
    }
    clearError();
  }, [mode, department, clearError]);

  // Preview variables for message
  const sampleVariables = {
    nombre: 'Juan Pérez',
    telefono: '+51 987654321',
    email: 'juan@email.com',
    fecha: '24 de Agosto, 2024',
    hora: '14:30',
    departamento: formData.name || 'Departamento'
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.welcomeMessage.trim()) {
      newErrors.welcomeMessage = 'El mensaje de bienvenida es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setActiveTab('info');
      return;
    }

    const departmentData = {
      name: formData.name.trim(),
      color: formData.color,
      status: formData.status,
      description: formData.description.trim(),
      welcomeMessage: formData.welcomeMessage.trim(),
      options: formData.options
    };

    let success = false;
    
    if (mode === 'create') {
      success = await createDepartment(departmentData);
    } else if (department) {
      success = await updateDepartment(department.id, departmentData);
    }

    if (success) {
      onClose();
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('welcomeMessage') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.welcomeMessage;
      const newText = text.substring(0, start) + `{{${variable}}}` + text.substring(end);
      
      setFormData(prev => ({ ...prev, welcomeMessage: newText }));
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  };

  const addOption = () => {
    if (!newOption.label.trim() || !newOption.response.trim()) return;

    const option: DepartmentOption = {
      id: Date.now().toString(),
      icon: newOption.icon,
      label: newOption.label.trim(),
      response: newOption.response.trim(),
      order: formData.options.length + 1,
      isActive: true
    };

    setFormData(prev => ({ ...prev, options: [...prev.options, option] }));
    setNewOption({ icon: '💬', label: '', response: '' });
  };

  const updateOption = (index: number, updates: Partial<DepartmentOption>) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? { ...opt, ...updates } : opt)
    }));
  };

  const deleteOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const moveOption = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formData.options.length - 1)
    ) return;

    const newOptions = [...formData.options];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newOptions[index], newOptions[targetIndex]] = [newOptions[targetIndex], newOptions[index]];
    
    // Update order
    newOptions.forEach((opt, i) => {
      opt.order = i + 1;
    });

    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: formData.color }}
            >
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? 'Crear Departamento' : 'Editar Departamento'}
              </h2>
              <p className="text-sm text-gray-600">
                {mode === 'create' 
                  ? 'Configure un nuevo departamento con mensajes y opciones personalizadas'
                  : `Modificando: ${department?.name}`
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

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          {[
            { key: 'info', label: 'Información', icon: Building },
            { key: 'message', label: 'Mensaje', icon: MessageSquare },
            { key: 'options', label: 'Opciones', icon: List }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab 1: Información Básica */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Departamento *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.name 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-green-500'
                    }`}
                    placeholder="Ej: Ventas, Soporte, Marketing"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Palette className="inline w-4 h-4 mr-1" />
                  Color del Departamento
                </label>
                
                <div className="flex items-center space-x-4">
                  {/* Current Color Display */}
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                    style={{ backgroundColor: formData.color }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  />
                  
                  {/* Color Input */}
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="#10b981"
                  />
                  
                  {/* Color Picker Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Elegir Color
                  </button>
                </div>

                {/* Predefined Colors */}
                {showColorPicker && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-3">Colores predefinidos:</p>
                    <div className="grid grid-cols-6 gap-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, color }));
                            setShowColorPicker(false);
                          }}
                          className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-105 ${
                            formData.color === color ? 'border-gray-600 ring-2 ring-gray-400' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none transition-colors ${
                    errors.description 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-green-500'
                  }`}
                  placeholder="Describe el propósito y función de este departamento..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Mensaje de Bienvenida */}
          {activeTab === 'message' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Variables Disponibles:
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {availableVariables.map((variable) => (
                    <button
                      key={variable.key}
                      type="button"
                      onClick={() => insertVariable(variable.key)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
                      title={variable.description}
                    >
                      {`{{${variable.key}}}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje de Bienvenida *
                  </label>
                  <textarea
                    id="welcomeMessage"
                    value={formData.welcomeMessage}
                    onChange={(e) => setFormData(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                    rows={10}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none transition-colors ${
                      errors.welcomeMessage 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-green-500'
                    }`}
                    placeholder="Escribe tu mensaje de bienvenida aquí..."
                  />
                  {errors.welcomeMessage && (
                    <p className="text-red-500 text-sm mt-1">{errors.welcomeMessage}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Eye className="inline w-4 h-4 mr-1" />
                    Vista Previa:
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-center space-x-2 mb-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: formData.color }}
                      >
                        {formData.name.charAt(0) || 'D'}
                      </div>
                      <span className="font-medium text-gray-900">{formData.name || 'Departamento'}</span>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-sm text-gray-900 whitespace-pre-wrap">
                        {previewMessage(formData.welcomeMessage, sampleVariables)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Opciones de Respuesta */}
          {activeTab === 'options' && (
            <div className="space-y-6">
              {/* Add New Option */}
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Nueva Opción</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ícono
                    </label>
                    <input
                      type="text"
                      value={newOption.icon}
                      onChange={(e) => setNewOption(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="💬"
                    />
                  </div>
                  
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Etiqueta de la Opción
                    </label>
                    <input
                      type="text"
                      value={newOption.label}
                      onChange={(e) => setNewOption(prev => ({ ...prev, label: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Ej: Ver productos, Contactar vendedor"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Respuesta Automática
                  </label>
                  <textarea
                    value={newOption.response}
                    onChange={(e) => setNewOption(prev => ({ ...prev, response: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="Mensaje que se enviará cuando el usuario seleccione esta opción"
                  />
                </div>

                <button
                  type="button"
                  onClick={addOption}
                  disabled={!newOption.label.trim() || !newOption.response.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Opción</span>
                </button>
              </div>

              {/* Existing Options */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Opciones Configuradas ({formData.options.length})
                  </h3>
                </div>

                {formData.options.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <List className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No hay opciones configuradas</p>
                    <p className="text-sm">Agrega la primera opción usando el formulario de arriba</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.options.map((option, index) => (
                      <div key={option.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex flex-col space-y-1">
                            <button
                              type="button"
                              onClick={() => moveOption(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              ▲
                            </button>
                            <GripVertical className="w-4 h-4 text-gray-400" />
                            <button
                              type="button"
                              onClick={() => moveOption(index, 'down')}
                              disabled={index === formData.options.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              ▼
                            </button>
                          </div>

                          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
                            <div>
                              <input
                                type="text"
                                value={option.icon}
                                onChange={(e) => updateOption(index, { icon: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-lg"
                              />
                            </div>
                            
                            <div>
                              <input
                                type="text"
                                value={option.label}
                                onChange={(e) => updateOption(index, { label: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Etiqueta"
                              />
                            </div>
                            
                            <div className="lg:col-span-2">
                              <textarea
                                value={option.response}
                                onChange={(e) => updateOption(index, { response: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                placeholder="Respuesta automática"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col space-y-2">
                            <button
                              type="button"
                              onClick={() => updateOption(index, { isActive: !option.isActive })}
                              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                option.isActive 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {option.isActive ? 'Activa' : 'Inactiva'}
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => deleteOption(index)}
                              className="p-1 text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{mode === 'create' ? 'Crear Departamento' : 'Guardar Cambios'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};