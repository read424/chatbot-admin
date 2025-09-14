'use client';

import { useUserStore, type UserProfile } from '@/stores/userStore';
import {
  Download,
  Filter,
  Plus,
  Search,
  Users,
  UserCheck,
  UserX,
  Trash2,
  Activity,
  Clock,
  CheckSquare,
  Square,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { UserModal } from './UserModal';
import { UserStats } from './UserStats';
import { UserTable } from './UserTable';
import { UserActivityDashboard } from './UserActivityDashboard';

export const UserManagement: React.FC = () => {
  const {
    users,
    isLoading,
    error,
    filters,
    fetchUsers,
    setFilters,
    clearError,
    getUserStats,
    getFilteredUsers,
    bulkUpdateUsers,
    bulkDeleteUsers,
    toggleUserStatus
  } = useUserStore();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showActivityPanel, setShowActivityPanel] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showActivityDashboard, setShowActivityDashboard] = useState(false);


  const stats = getUserStats();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = () => {
    setModalMode('create');
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user: UserProfile) => {
    setModalMode('edit');
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
  };

  const handleExportUsers = () => {
    // Simular descarga de CSV
    const csvContent = [
      ['Nombre', 'Email', 'Rol', 'Estado', 'Departamento', 'Fecha de Ingreso', 'Último Acceso', 'Chats Totales', 'Chats Activos'].join(','),
      ...users.map(user => [
        user.name,
        user.email,
        user.role,
        user.status,
        user.department || '',
        user.hireDate,
        user.lastLogin || 'Nunca',
        user.stats.totalChats,
        user.stats.activeChats
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'usuarios.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSelectUser = (userId: string, selected: boolean) => {
    if (selected) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = () => {
    const filteredUsers = getFilteredUsers();
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
    setBulkActionLoading(true);
    try {
      await bulkUpdateUsers(selectedUsers, { status });
      setSelectedUsers([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error updating users:', error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`¿Estás seguro de eliminar ${selectedUsers.length} usuarios? Esta acción no se puede deshacer.`)) {
      setBulkActionLoading(true);
      try {
        await bulkDeleteUsers(selectedUsers);
        setSelectedUsers([]);
        setShowBulkActions(false);
      } catch (error) {
        console.error('Error deleting users:', error);
      } finally {
        setBulkActionLoading(false);
      }
    }
  };

  const handleBulkDepartmentChange = async (department: string) => {
    setBulkActionLoading(true);
    try {
      await bulkUpdateUsers(selectedUsers, { department });
      setSelectedUsers([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error updating departments:', error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600 mt-1">
              Administra vendedores, supervisores y configuraciones de acceso
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowActivityPanel(!showActivityPanel)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${showActivityPanel
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-gray-300 hover:bg-gray-50'
                }`}
            >
              <Activity className="w-4 h-4" />
              <span>Actividad</span>
            </button>

            <button
              onClick={() => setShowActivityDashboard(!showActivityDashboard)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${showActivityDashboard
                ? 'bg-purple-50 border-purple-300 text-purple-700'
                : 'border-gray-300 hover:bg-gray-50'
                }`}
            >
              <Clock className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={handleExportUsers}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>

            <button
              onClick={handleCreateUser}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Usuario</span>
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

      {/* Stats Cards */}
      <UserStats stats={stats} />

      {/* Filters and Search */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${showFilters
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'border-gray-300 hover:bg-gray-50'
              }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                >
                  <option value="all">Todos los roles</option>
                  <option value="admin">Administrador</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="agent">Agente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento
                </label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                >
                  <option value="all">Todos los departamentos</option>
                  <option value="Ventas">Ventas</option>
                  <option value="Administración">Administración</option>
                  <option value="Soporte">Soporte</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedUsers.length} usuario{selectedUsers.length !== 1 ? 's' : ''} seleccionado{selectedUsers.length !== 1 ? 's' : ''}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkStatusChange('active')}
                  disabled={bulkActionLoading}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Activar</span>
                </button>

                <button
                  onClick={() => handleBulkStatusChange('inactive')}
                  disabled={bulkActionLoading}
                  className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors disabled:opacity-50"
                >
                  <UserX className="w-4 h-4" />
                  <span>Desactivar</span>
                </button>

                <select
                  onChange={(e) => e.target.value && handleBulkDepartmentChange(e.target.value)}
                  disabled={bulkActionLoading}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  defaultValue=""
                >
                  <option value="">Cambiar Departamento</option>
                  <option value="Ventas">Ventas</option>
                  <option value="Administración">Administración</option>
                  <option value="Soporte">Soporte</option>
                  <option value="Marketing">Marketing</option>
                </select>

                <button
                  onClick={handleBulkDelete}
                  disabled={bulkActionLoading}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setSelectedUsers([])}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Cancelar selección
            </button>
          </div>
        </div>
      )}

      {/* Activity Panel */}
      {showActivityPanel && (
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                Actividad Reciente
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {users.slice(0, 5).map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-xs">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">
                          {user.lastLogin ? `Último acceso: ${user.lastLogin}` : 'Sin accesos recientes'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{user.stats.activeChats} chats</p>
                      <p className="text-xs text-gray-500">activos</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-500" />
                Métricas de Rendimiento
              </h3>
              <div className="space-y-4">
                {/* Top Performers */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Mejores Agentes (por satisfacción)</h4>
                  <div className="space-y-2">
                    {users
                      .filter(user => user.role === 'agent' && user.stats.satisfaction > 0)
                      .sort((a, b) => b.stats.satisfaction - a.stats.satisfaction)
                      .slice(0, 3)
                      .map((user, index) => (
                        <div key={user.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-green-700">#{index + 1}</span>
                            <span className="text-sm text-gray-900">{user.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-green-700">
                              ★ {user.stats.satisfaction.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({user.stats.totalChats} chats)
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Response Time Leaders */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Mejor Tiempo de Respuesta</h4>
                  <div className="space-y-2">
                    {users
                      .filter(user => user.role === 'agent' && user.stats.avgResponseTime > 0)
                      .sort((a, b) => a.stats.avgResponseTime - b.stats.avgResponseTime)
                      .slice(0, 3)
                      .map((user, index) => (
                        <div key={user.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-blue-700">#{index + 1}</span>
                            <span className="text-sm text-gray-900">{user.name}</span>
                          </div>
                          <span className="text-sm font-medium text-blue-700">
                            {user.stats.avgResponseTime.toFixed(1)}min
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="flex-1 overflow-hidden">
        <UserTable
          isLoading={isLoading}
          onEditUser={handleEditUser}
          selectedUsers={selectedUsers}
          onSelectUser={handleSelectUser}
          onSelectAll={handleSelectAll}
        />
      </div>

      {/* User Modal */}
      {showModal && (
        <UserModal
          mode={modalMode}
          user={selectedUser}
          onClose={handleCloseModal}
        />
      )}

      {/* Activity Dashboard Modal */}
      {showActivityDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Dashboard de Actividad</h2>
              <button
                onClick={() => setShowActivityDashboard(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="h-[calc(90vh-80px)] overflow-y-auto">
              <UserActivityDashboard />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};