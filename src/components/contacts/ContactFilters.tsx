'use client';

import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { useDepartmentStore } from '@/stores/departmentStore';
import { useUserStore } from '@/stores/userStore';
import type { ContactFilters as ContactFiltersType, ProviderType } from '@/lib/api/types';

interface ContactFiltersProps {
  filters: ContactFiltersType;
  onFiltersChange: (filters: Partial<ContactFiltersType>) => void;
  onClose: () => void;
}

const CHANNEL_OPTIONS: { value: ProviderType; label: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'whatsapp_api', label: 'WhatsApp API' },
  { value: 'chatweb', label: 'Chat Web' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activo', color: 'text-green-600' },
  { value: 'inactive', label: 'Inactivo', color: 'text-yellow-600' },
  { value: 'blocked', label: 'Bloqueado', color: 'text-red-600' },
];

export function ContactFilters({ filters, onFiltersChange, onClose }: ContactFiltersProps) {
  const { departments, fetchDepartments } = useDepartmentStore();
  const { users, fetchUsers } = useUserStore();
  
  const [localFilters, setLocalFilters] = useState<ContactFiltersType>(filters);
  const [dateFrom, setDateFrom] = useState(
    filters.dateRange?.from ? filters.dateRange.from.toISOString().split('T')[0] : ''
  );
  const [dateTo, setDateTo] = useState(
    filters.dateRange?.to ? filters.dateRange.to.toISOString().split('T')[0] : ''
  );

  useEffect(() => {
    fetchDepartments();
    fetchUsers();
  }, [fetchDepartments, fetchUsers]);

  const handleFilterChange = (key: keyof ContactFiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleDateRangeChange = () => {
    const dateRange = dateFrom && dateTo ? {
      from: new Date(dateFrom),
      to: new Date(dateTo),
    } : undefined;
    
    const newFilters = { ...localFilters, dateRange };
    setLocalFilters(newFilters);
  };

  useEffect(() => {
    handleDateRangeChange();
  }, [dateFrom, dateTo]);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    setDateFrom('');
    setDateTo('');
    onFiltersChange(clearedFilters);
  };

  const activeFiltersCount = Object.keys(localFilters).filter(key => {
    const value = localFilters[key as keyof ContactFiltersType];
    return value !== undefined && value !== null && value !== '';
  }).length;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Department Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Departamento
          </label>
          <select
            value={localFilters.department || ''}
            onChange={(e) => handleFilterChange('department', e.target.value || undefined)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los departamentos</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned Agent Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Agente Asignado
          </label>
          <select
            value={localFilters.assignedAgent || ''}
            onChange={(e) => handleFilterChange('assignedAgent', e.target.value || undefined)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los agentes</option>
            <option value="unassigned">Sin asignar</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {/* Channel Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Canal
          </label>
          <select
            value={localFilters.channel || ''}
            onChange={(e) => handleFilterChange('channel', e.target.value || undefined)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los canales</option>
            {CHANNEL_OPTIONS.map((channel) => (
              <option key={channel.value} value={channel.value}>
                {channel.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Rango de Fechas
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Desde"
              />
            </div>
            <span className="text-gray-500 text-sm">hasta</span>
            <div className="flex-1 relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Hasta"
              />
            </div>
          </div>
        </div>

        {/* Tags Filter */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Etiquetas
          </label>
          <input
            type="text"
            value={localFilters.tags?.join(', ') || ''}
            onChange={(e) => {
              const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
              handleFilterChange('tags', tags.length > 0 ? tags : undefined);
            }}
            placeholder="Separar con comas: vip, cliente, prospecto"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          {activeFiltersCount > 0 && `${activeFiltersCount} filtro${activeFiltersCount !== 1 ? 's' : ''} activo${activeFiltersCount !== 1 ? 's' : ''}`}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleClearFilters}
            className="px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Limpiar
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}