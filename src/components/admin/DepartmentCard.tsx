'use client';

import { useDepartmentStore, type Department } from '@/stores/departmentStore';
import {
    Clock,
    Edit,
    Eye,
    MessageSquare,
    MoreVertical,
    Power,
    Settings,
    Trash2,
    Users,
    X
} from 'lucide-react';
import React, { useState } from 'react';

interface DepartmentCardProps {
  department: Department;
  onEdit: (department: Department) => void;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  onEdit
}) => {
  const { 
    toggleDepartmentStatus, 
    deleteDepartment,
    previewMessage,
    availableVariables 
  } = useDepartmentStore();

  const [showMenu, setShowMenu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sample variables for preview
  const sampleVariables = {
    nombre: 'Juan Pérez',
    telefono: '+51 987654321',
    email: 'juan@email.com',
    fecha: '24 de Agosto, 2024',
    hora: '14:30'
  };

  const previewWelcomeMessage = previewMessage(department.welcomeMessage, sampleVariables);

  const handleToggleStatus = async () => {
    await toggleDepartmentStatus(department.id);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    await deleteDepartment(department.id);
    setShowDeleteConfirm(false);
    setShowMenu(false);
  };

  const isActive = department.status === 'active';

  return (
    <>
      <div className={`bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
        isActive ? 'border-gray-200' : 'border-gray-300 opacity-75'
      }`}>
        {/* Header with color indicator */}
        <div 
          className="h-2 rounded-t-xl"
          style={{ backgroundColor: department.color }}
        ></div>
        
        <div className="p-6">
          {/* Department info */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {department.name}
                </h3>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: department.color }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {department.description}
              </p>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowPreview(true);
                          setShowMenu(false);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Vista Previa</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          onEdit(department);
                          setShowMenu(false);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={handleToggleStatus}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                      >
                        <Power className="w-4 h-4" />
                        <span>{isActive ? 'Desactivar' : 'Activar'}</span>
                      </button>

                      <hr className="my-1" />
                      
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setShowMenu(false);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Status badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isActive 
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                isActive ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              {isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mb-2 mx-auto">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-lg font-semibold text-gray-900">{department.stats.totalUsers}</div>
              <div className="text-xs text-gray-500">Usuarios</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mb-2 mx-auto">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-lg font-semibold text-gray-900">{department.stats.activeChats}</div>
              <div className="text-xs text-gray-500">Chats</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg mb-2 mx-auto">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-lg font-semibold text-gray-900">{department.stats.avgResponseTime}m</div>
              <div className="text-xs text-gray-500">Respuesta</div>
            </div>
          </div>

          {/* Options count */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span>Opciones configuradas:</span>
            <span className="font-medium">{department.options.filter(opt => opt.isActive).length}</span>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={() => setShowPreview(true)}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Vista Previa</span>
            </button>
            
            <button
              onClick={() => onEdit(department)}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Configurar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Vista Previa</h3>
                <p className="text-sm text-gray-600">Departamento: {department.name}</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Preview */}
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: department.color }}
                  >
                    {department.name.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-900">{department.name}</span>
                </div>
                
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-sm text-gray-900 whitespace-pre-wrap">
                    {previewWelcomeMessage}
                  </div>
                </div>
              </div>

              {/* Options Preview */}
              {department.options.filter(opt => opt.isActive).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Opciones disponibles:</p>
                  <div className="space-y-2">
                    {department.options.filter(opt => opt.isActive).map((option, index) => (
                      <div 
                        key={option.id}
                        className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                      >
                        <span className="text-lg">{option.icon}</span>
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                  ¿Eliminar Departamento?
                </h3>
                <p className="text-sm text-gray-600">
                  Se eliminará "{department.name}" y todas sus configuraciones
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};