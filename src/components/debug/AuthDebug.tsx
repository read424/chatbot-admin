'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useEffect, useState } from 'react';

export const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, mounted } = useAuth();
  const { userRole, userPermissions } = usePermissions();
  const [localStorageData, setLocalStorageData] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = {
        user: localStorage.getItem('user'),
        isAuthenticated: localStorage.getItem('isAuthenticated'),
        token: localStorage.getItem('token'),
        sessionExpiry: localStorage.getItem('sessionExpiry'),
        rememberMe: localStorage.getItem('rememberMe'),
        authStorage: localStorage.getItem('auth-storage')
      };
      setLocalStorageData(data);
    }
  }, [user, isAuthenticated]);

  if (!mounted) {
    return <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">Cargando...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold">🔍 Auth Debug</h3>
      
      {/* Estado del Hook useAuth */}
      <div className="space-y-2">
        <h4 className="font-medium">useAuth State:</h4>
        <div className="bg-white p-3 rounded border">
          <p><strong>isAuthenticated:</strong> {isAuthenticated ? '✅' : '❌'}</p>
          <p><strong>user:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
          <p><strong>mounted:</strong> {mounted ? '✅' : '❌'}</p>
        </div>
      </div>

      {/* Estado del Hook usePermissions */}
      <div className="space-y-2">
        <h4 className="font-medium">usePermissions State:</h4>
        <div className="bg-white p-3 rounded border">
          <p><strong>userRole:</strong> {userRole || 'null'}</p>
          <p><strong>userPermissions:</strong> {userPermissions.length} permisos</p>
          <div className="text-xs text-gray-600">
            {userPermissions.slice(0, 5).join(', ')}
            {userPermissions.length > 5 && '...'}
          </div>
        </div>
      </div>

      {/* LocalStorage Data */}
      <div className="space-y-2">
        <h4 className="font-medium">LocalStorage Data:</h4>
        <div className="bg-white p-3 rounded border">
          <pre className="text-xs overflow-auto">
            {JSON.stringify(localStorageData, null, 2)}
          </pre>
        </div>
      </div>

      {/* Botón para limpiar storage */}
      <div className="space-y-2">
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🗑️ Limpiar Storage y Recargar
        </button>
      </div>
    </div>
  );
};
