'use client';

import { useState, useEffect } from 'react';
import { X, Save, User, Phone, Mail, Building, Tag, Plus, Trash2, MessageCircle } from 'lucide-react';
import { useContactStore } from '@/stores/contactStore';
import { useDepartmentStore } from '@/stores/departmentStore';
import { useUserStore } from '@/stores/userStore';
import { createContactSchema, updateContactSchema } from '@/lib/validation/contact';
import type { Contact, CreateContactRequest, UpdateContactRequest, ContactChannel, ProviderType } from '@/lib/api/types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: Contact | null;
}

const CHANNEL_OPTIONS: { value: ProviderType; label: string; placeholder: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp', placeholder: '+52 55 1234 5678' },
  { value: 'facebook', label: 'Facebook', placeholder: 'facebook.username' },
  { value: 'instagram', label: 'Instagram', placeholder: '@instagram_handle' },
  { value: 'telegram', label: 'Telegram', placeholder: '@telegram_user' },
  { value: 'whatsapp_api', label: 'WhatsApp API', placeholder: '+52 55 1234 5678' },
  { value: 'chatweb', label: 'Chat Web', placeholder: 'user@example.com' },
];

export function ContactModal({ isOpen, onClose, contact }: ContactModalProps) {
  const { createContact, updateContact, loading } = useContactStore();
  const { departments, fetchDepartments } = useDepartmentStore();
  const { users, fetchUsers } = useUserStore();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    department: '',
    assignedAgent: '',
    tags: [] as string[],
    channels: [] as Omit<ContactChannel, 'isVerified'>[],
    customFields: {} as Record<string, string>,
  });
  const [tagInput, setTagInput] = useState('');
  const [customFieldKey, setCustomFieldKey] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchDepartments();
    fetchUsers();
  }, [fetchDepartments, fetchUsers]);

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        phone: contact.phone || '',
        email: contact.email || '',
        department: contact.department,
        assignedAgent: contact.assignedAgent || '',
        tags: contact.tags,
        channels: contact.channels.map(ch => ({
          type: ch.type,
          identifier: ch.identifier,
          isPrimary: ch.isPrimary,
        })),
        customFields: Object.fromEntries(
          Object.entries(contact.metadata?.customFields || {}).map(([k, v]) => [k, String(v)])
        ),
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        department: '',
        assignedAgent: '',
        tags: [],
        channels: [],
        customFields: {},
      });
    }
    setErrors({});
  }, [contact, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleAddChannel = () => {
    setFormData(prev => ({
      ...prev,
      channels: [...prev.channels, { type: 'whatsapp', identifier: '', isPrimary: false }]
    }));
  };

  const handleUpdateChannel = (index: number, field: keyof Omit<ContactChannel, 'isVerified'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.map((channel, i) => 
        i === index ? { ...channel, [field]: value } : channel
      )
    }));
  };

  const handleRemoveChannel = (index: number) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.filter((_, i) => i !== index)
    }));
  };

  const handleSetPrimaryChannel = (index: number) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.map((channel, i) => ({
        ...channel,
        isPrimary: i === index
      }))
    }));
  };

  const handleAddCustomField = () => {
    if (customFieldKey.trim() && customFieldValue.trim()) {
      setFormData(prev => ({
        ...prev,
        customFields: {
          ...prev.customFields,
          [customFieldKey.trim()]: customFieldValue.trim()
        }
      }));
      setCustomFieldKey('');
      setCustomFieldValue('');
    }
  };

  const handleRemoveCustomField = (key: string) => {
    setFormData(prev => ({
      ...prev,
      customFields: Object.fromEntries(
        Object.entries(prev.customFields).filter(([k]) => k !== key)
      )
    }));
  };

  const handleCustomFieldKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomField();
    }
  };

  const validateForm = () => {
    try {
      if (contact) {
        updateContactSchema.parse({ ...formData, id: contact.id });
      } else {
        createContactSchema.parse(formData);
      }
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      error.errors?.forEach((err: any) => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const baseData = {
        name: formData.name,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        department: formData.department,
        assignedAgent: formData.assignedAgent || undefined,
        tags: formData.tags,
        channels: formData.channels,
        metadata: {
          source: 'manual',
          customFields: formData.customFields,
          preferences: {
            language: 'es',
            timezone: 'America/Mexico_City',
            notifications: true,
          },
        },
      };

      if (contact) {
        const updateData: UpdateContactRequest = {
          id: contact.id,
          ...baseData,
        };
        await updateContact(contact.id, updateData);
      } else {
        const createData: CreateContactRequest = baseData;
        await createContact(createData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {contact ? 'Editar Contacto' : 'Nuevo Contacto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Nombre *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nombre completo del contacto"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="+52 55 1234 5678"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="contacto@ejemplo.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-1" />
                Departamento *
              </label>
              <select
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.department ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar departamento</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department}</p>
              )}
            </div>

            {/* Assigned Agent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Agente Asignado
              </label>
              <select
                value={formData.assignedAgent}
                onChange={(e) => handleInputChange('assignedAgent', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sin asignar</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Etiquetas
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Agregar etiqueta"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 transition-colors"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Communication Channels */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                <MessageCircle className="w-4 h-4 inline mr-1" />
                Canales de Comunicación
              </label>
              <button
                type="button"
                onClick={handleAddChannel}
                className="flex items-center px-3 py-1.5 text-xs text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-3 h-3 mr-1" />
                Agregar Canal
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.channels.map((channel, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                  <select
                    value={channel.type}
                    onChange={(e) => handleUpdateChannel(index, 'type', e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {CHANNEL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  <input
                    type="text"
                    value={channel.identifier}
                    onChange={(e) => handleUpdateChannel(index, 'identifier', e.target.value)}
                    placeholder={CHANNEL_OPTIONS.find(opt => opt.value === channel.type)?.placeholder}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <label className="flex items-center text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={channel.isPrimary}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleSetPrimaryChannel(index);
                        }
                      }}
                      className="mr-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Principal
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => handleRemoveChannel(index)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {formData.channels.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay canales de comunicación configurados
                </p>
              )}
            </div>
          </div>

          {/* Custom Fields */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Campos Personalizados
              </label>
            </div>
            
            {/* Existing Custom Fields */}
            <div className="space-y-2 mb-3">
              {Object.entries(formData.customFields).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                  <span className="text-sm font-medium text-gray-700 min-w-0 flex-1">
                    {key}:
                  </span>
                  <span className="text-sm text-gray-900 flex-1">
                    {value}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomField(key)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Add New Custom Field */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={customFieldKey}
                onChange={(e) => setCustomFieldKey(e.target.value)}
                onKeyPress={handleCustomFieldKeyPress}
                placeholder="Nombre del campo"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={customFieldValue}
                onChange={(e) => setCustomFieldValue(e.target.value)}
                onKeyPress={handleCustomFieldKeyPress}
                placeholder="Valor"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddCustomField}
                className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {contact ? 'Actualizar' : 'Crear'} Contacto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}