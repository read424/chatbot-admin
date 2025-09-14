'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { getPermissionCategories, getPermissionDescription } from '@/types/permissions';
import { CheckCircle, Info, Shield, XCircle } from 'lucide-react';
import { useState } from 'react';

interface PermissionInfoProps {
  className?: string;
  showCategories?: boolean;
  showUserPermissions?: boolean;
}

export const PermissionInfo: React.FC<PermissionInfoProps> = ({
  className = '',
  showCategories = false,
  showUserPermissions = true
}) => {
  const { userRole, userPermissions, hasPermission } = usePermissions();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const permissionCategories = getPermissionCategories();

  if (!userRole) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-gray-600">
          <Info className="w-5 h-5" />
          <span>No hay información de permisos disponible</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Información del rol */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Información de Permisos
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Rol Actual</label>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {userRole}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Total de Permisos</label>
            <p className="text-lg font-semibold text-gray-900">
              {userPermissions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Permisos del usuario */}
      {showUserPermissions && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            Tus Permisos
          </h4>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {userPermissions.map((permission) => (
              <div key={permission} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {permission}
                  </p>
                  <p className="text-xs text-gray-600">
                    {getPermissionDescription(permission)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categorías de permisos */}
      {showCategories && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            Categorías de Permisos
          </h4>
          
          <div className="space-y-3">
            {Object.entries(permissionCategories).map(([category, permissions]) => {
              const isExpanded = expandedCategories.includes(category);
              const userCategoryPermissions = permissions.filter(p => hasPermission(p));
              
              return (
                <div key={category} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900">{category}</span>
                      <span className="text-sm text-gray-500">
                        ({userCategoryPermissions.length}/{permissions.length})
                      </span>
                    </div>
                    <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="space-y-2">
                        {permissions.map((permission) => {
                          const hasAccess = hasPermission(permission);
                          return (
                            <div key={permission} className="flex items-center space-x-3">
                              {hasAccess ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                              <div className="flex-1">
                                <p className={`text-sm ${hasAccess ? 'text-gray-900' : 'text-gray-500'}`}>
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
      )}
    </div>
  );
};
