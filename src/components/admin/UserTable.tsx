// src/components/admin/UserTable.tsx
'use client';

import { useUserStore, type UserProfile } from '@/stores/userStore';
import {
    Calendar,
    Clock,
    Edit,
    Eye,
    MoreVertical,
    Phone,
    Trash2,
    UserCheck,
    Users,
    UserX
} from 'lucide-react';
import React, { useState } from 'react';

interface UserTableProps {
  isLoading: boolean;
  onEditUser: (user: UserProfile) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  isLoading,
  onEditUser
}) => {
  const {
    getFilteredUsers,
    deleteUser,
    toggleUserStatus,
    setSelectedUser
  } = useUserStore();

  const [actionMenuUser, setActionMenuUser] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const users = getFilteredUsers();

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: 'bg-purple-100 text-purple-800',
      supervisor: 'bg-yellow-100 text-yellow-800',
      agent: 'bg-blue-100 text-blue-800'
    };
    
    const labels = {
      admin: 'Administrador',
      supervisor: 'Supervisor',
      agent: 'Agente'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[role as keyof typeof badges]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <span className="flex items-center space-x-1 text-green-600">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm">Activo</span>
      </span>
    ) : (
      <span className="flex items-center space-x-1 text-red-600">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-sm">Inactivo</span>
      </span>
    );
  };

  const handleToggleStatus = async (user: UserProfile) => {
    await toggleUserStatus(user.id);
    setActionMenuUser(null);
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
    setShowDeleteConfirm(null);
    setActionMenuUser(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        <span className="ml-2 text-gray-600">Cargando usuarios...</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-lg font-medium">No se encontraron usuarios</p>
        <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estadísticas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Último Acceso
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                {/* Usuario */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Rol */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleBadge(user.role)}
                  {user.department && (
                    <div className="text-xs text-gray-500 mt-1">
                      {user.department}
                    </div>
                  )}
                </td>

                {/* Estado */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user.status)}
                </td>

                {/* Contacto */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.phone && (
                    <div className="flex items-center space-x-1 mb-1">
                      <Phone className="w-3 h-3" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Ingreso: {formatDate(user.hireDate)}</span>
                  </div>
                </td>

                {/* Estadísticas */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="space-y-1">
                    <div>Chats: {user.stats.totalChats}</div>
                    <div>Activos: {user.stats.activeChats}</div>
                    {user.stats.satisfaction > 0 && (
                      <div>★ {user.stats.satisfaction.toFixed(1)}</div>
                    )}
                  </div>
                </td>

                {/* Último Acceso */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastLogin ? (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{user.lastLogin}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">Nunca</span>
                  )}
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative">
                    <button
                      onClick={() => setActionMenuUser(actionMenuUser === user.id ? null : user.id)}
                      className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {actionMenuUser === user.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setActionMenuUser(null);
                            }}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Ver Detalles</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              onEditUser(user);
                              setActionMenuUser(null);
                            }}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Editar</span>
                          </button>

                          <button
                            onClick={() => handleToggleStatus(user)}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                          >
                            {user.status === 'active' ? (
                              <>
                                <UserX className="w-4 h-4" />
                                <span>Desactivar</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4" />
                                <span>Activar</span>
                              </>
                            )}
                          </button>

                          <hr className="my-1" />
                          
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(user.id);
                              setActionMenuUser(null);
                            }}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  ¿Eliminar Usuario?
                </h3>
                <p className="text-sm text-gray-600">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};