'use client';

import { useDepartmentStore, type Department } from '@/stores/departmentStore';
import {
    Building,
    Download,
    Filter,
    Plus,
    Search
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { DepartmentCard } from './DepartmentCard';
import { DepartmentModal } from './DepartmentModal';
import { DepartmentStats } from './DepartmentStats';

export const DepartmentManagement: React.FC = () => {
  const {
    departments,
    isLoading,
    error,
    fetchDepartments,
    clearError,
    getDepartmentStats
  } = useDepartmentStore();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const stats = getDepartmentStats();

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Filter departments
  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dept.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateDepartment = () => {
    setModalMode('create');
    setSelectedDepartment(null);
    setShowModal(true);
  };

  const handleEditDepartment = (department: Department) => {
    setModalMode('edit');
    setSelectedDepartment(department);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDepartment(null);
  };

  const handleExportDepartments = () => {
    const csvContent = [
      ['Nombre', 'Estado', 'Usuarios', 'Chats Activos', 'Tiempo Respuesta', 'Creado'].join(','),
      ...departments.map(dept => [
        dept.name,
        dept.status,
        dept.stats.totalUsers,
        dept.stats.activeChats,
        dept.stats.avgResponseTime + ' min',
        dept.createdAt
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'departamentos.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Building className="w-8 h-8 text-green-600" />
              <span>Gestión de Departamentos</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Administra departamentos, mensajes de bienvenida y opciones de respuesta
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportDepartments}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
            
            <button
              onClick={handleCreateDepartment}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Departamento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <DepartmentStats stats={stats} />

      {/* Search and Filters */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar departamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-sm"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <span className="ml-2 text-gray-600">Cargando departamentos...</span>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Building className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium">
              {searchTerm || statusFilter !== 'all' 
                ? 'No se encontraron departamentos' 
                : 'No hay departamentos creados'
              }
            </p>
            <p className="text-sm mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Crea tu primer departamento para empezar'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <button
                onClick={handleCreateDepartment}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Departamento</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDepartments.map((department) => (
              <DepartmentCard
                key={department.id}
                department={department}
                onEdit={handleEditDepartment}
              />
            ))}
          </div>
        )}
      </div>

      {/* Department Modal */}
      {showModal && (
        <DepartmentModal
          mode={modalMode}
          department={selectedDepartment}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};