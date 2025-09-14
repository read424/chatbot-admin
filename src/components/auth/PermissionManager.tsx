'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { Permission, UserRole, getPermissionCategories, getPermissionDescription } from '@/types/permissions';
import { AlertTriangle, CheckCircle, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PermissionManagerProps {
  userRole: UserRole;
  onPermissionsChange?: (permissions: Permission[]) => void;
  className?: string;
}

export const PermissionManager: React.FC<PermissionManagerProps> = ({
  userRole,
  onPermissionsChange,
  className = ''
}) => {
  const { userPermissions, validateUserPermissions } = usePermissions();
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const permissionCategories = getPermissionCategories();

  // Inicializar permisos seleccionados
  useEffect(() => {
    setSelectedPermissions(userPermissions);
  }, [userPermissions]);

  // Detectar cambios
  useEffect(() => {
    const hasChanges = JSON.stringify(selectedPermissions.sort()) !== JSON.stringify(userPermissions.sort());
    setHasChanges(hasChanges);
  }, [selectedPermissions, userPermissions]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const togglePermission = (permission: Permission) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const toggleCategoryPermissions = (category: string, permissions: Permission[]) => {
    const categoryPermissions = permissions.filter(p => selectedPermissions.includes(p));
    const allSelected = categoryPermissions.length === permissions.length;
    
    if (allSelected) {
      // Deseleccionar todos los permisos de la categoría
      setSelectedPermissions(prev => prev.filter(p => !permissions.includes(p)));
    } else {
      // Seleccionar todos los permisos de la categoría
      setSelectedPermissions(prev => {
        const newPermissions = [...prev];
        permissions.forEach(permission => {
          if (!newPermissions.includes(permission)) {
            newPermissions.push(permission);
          }
        });
        return newPermissions;
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Llamar callback si existe
      onPermissionsChange?.(selectedPermissions);
      
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving permissions:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedPermissions(userPermissions);
    setHasChanges(false);
  };

  const validation = validateUserPermissions(selectedPermissions);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Gestión de Permisos - {userRole}
          </h3>
          <p className="text-sm text-gray-600">
            Selecciona los permisos que tendrá este rol
          </p>
        </div>
        
        {hasChanges && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !validation.isValid}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Validación de permisos */}
      {!validation.isValid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-2">
                Configuración de Permisos Inválida
              </h4>
              {validation.invalidPermissions.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm text-red-700 mb-1">
                    Permisos no válidos para este rol:
                  </p>
                  <ul className="text-xs text-red-600 list-disc list-inside">
                    {validation.invalidPermissions.map(permission => (
                      <li key={permission}>{permission}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {selectedPermissions.length}
          </div>
          <div className="text-sm text-gray-600">Permisos Seleccionados</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {Object.values(permissionCategories).flat().length}
          </div>
          <div className="text-sm text-gray-600">Total de Permisos</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {Math.round((selectedPermissions.length / Object.values(permissionCategories).flat().length) * 100)}%
          </div>
          <div className="text-sm text-gray-600">Cobertura</div>
        </div>
      </div>

      {/* Categorías de permisos */}
      <div className="space-y-4">
        {Object.entries(permissionCategories).map(([category, permissions]) => {
          const isExpanded = expandedCategories.includes(category);
          const selectedCategoryPermissions = permissions.filter(p => selectedPermissions.includes(p));
          const allSelected = selectedCategoryPermissions.length === permissions.length;
          const someSelected = selectedCategoryPermissions.length > 0 && selectedCategoryPermissions.length < permissions.length;

          return (
            <div key={category} className="border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between p-4">
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex items-center space-x-3 text-left hover:text-gray-700 transition-colors"
                >
                  <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                    allSelected ? 'bg-blue-600 border-blue-600' : 
                    someSelected ? 'bg-blue-100 border-blue-600' : 
                    'border-gray-300'
                  }`}>
                    {allSelected && <CheckCircle className="w-3 h-3 text-white" />}
                    {someSelected && <div className="w-2 h-2 bg-blue-600 rounded-sm" />}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">{category}</h4>
                    <p className="text-sm text-gray-600">
                      {selectedCategoryPermissions.length} de {permissions.length} permisos seleccionados
                    </p>
                  </div>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleCategoryPermissions(category, permissions)}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                  </button>
                  
                  <button
                    onClick={() => toggleCategory(category)}
                    className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="space-y-2">
                    {permissions.map((permission) => {
                      const isSelected = selectedPermissions.includes(permission);
                      return (
                        <div key={permission} className="flex items-center space-x-3 p-2 bg-white rounded">
                          <button
                            onClick={() => togglePermission(permission)}
                            className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                              isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                          </button>
                          
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {permission}
                            </p>
                            <p className="text-xs text-gray-600">
                              {getPermissionDescription(permission)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
