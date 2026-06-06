/**
 * Ejemplo de Implementación: Connections V2
 * Este es un componente de ejemplo funcional que demuestra el uso completo
 * del servicio y hook de conexiones v2
 */

'use client';

import { useConnectionsV2 } from '@/hooks/useConnectionsV2';
import { useState } from 'react';
import type { ChannelType, ConnectionStatus } from '@/types/connectionsV2';

export default function ConnectionsV2Example() {
  const [channelFilter, setChannelFilter] = useState<ChannelType | ''>('');
  const [statusFilter, setStatusFilter] = useState<ConnectionStatus | ''>('');

  const {
    connections,
    pagination,
    isLoading,
    isCreating,
    isDeleting,
    error,
    fetchConnections,
    createConnection,
    deleteConnection,
    activateConnection,
    deactivateConnection,
    clearError,
  } = useConnectionsV2({
    autoFetch: true,
    initialFilters: { page: 1, limit: 20 },
  });

  const handleFilter = () => {
    fetchConnections({
      channelType: channelFilter || undefined,
      status: statusFilter || undefined,
      page: 1,
      limit: 20,
    });
  };

  const handleCreateWhatsApp = async () => {
    const newConn = await createConnection({
      connectionName: 'WhatsApp Ventas ' + Date.now(),
      channelType: 'whatsapp_web',
      departmentId: 1,
      welcomeMessage: '¡Hola! Bienvenido a nuestro servicio',
      goodbyeMessage: '¡Gracias por contactarnos!',
      chatbotTimeout: 30,
    });

    if (newConn) {
      alert('Conexión creada exitosamente: ' + newConn.id);
    }
  };

  const handleCreateInstagram = async () => {
    const accessToken = prompt('Ingresa el Access Token de Instagram:');
    if (!accessToken) return;

    const newConn = await createConnection({
      connectionName: 'Instagram Soporte ' + Date.now(),
      channelType: 'instagram_direct',
      departmentId: 2,
      welcomeMessage: '¡Hola! ¿En qué podemos ayudarte?',
      chatbotTimeout: 30,
      channelCredentials: {
        accessToken,
        verifyToken: 'instagram_verify_' + Date.now(),
        pageId: '123456789',
        instagramAccountId: '17841234567890',
      },
    });

    if (newConn) {
      alert('Conexión de Instagram creada: ' + newConn.id);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`¿Eliminar la conexión "${name}"?`)) {
      const success = await deleteConnection(id);
      if (success) {
        alert('Conexión eliminada exitosamente');
      }
    }
  };

  const handleActivate = async (id: number) => {
    const success = await activateConnection(id);
    if (success) {
      alert('Conexión activada. Si es WhatsApp Web, escanea el código QR');
    }
  };

  const handleDeactivate = async (id: number) => {
    const success = await deactivateConnection(id, {
      reason: 'Desactivada desde la interfaz',
    });
    if (success) {
      alert('Conexión desactivada exitosamente');
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchConnections({
      channelType: channelFilter || undefined,
      status: statusFilter || undefined,
      page: newPage,
      limit: 20,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Gestión de Conexiones V2</h1>

      {/* Botones de Creación */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={handleCreateWhatsApp}
          disabled={isCreating}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isCreating ? 'Creando...' : '+ WhatsApp Web'}
        </button>

        <button
          onClick={handleCreateInstagram}
          disabled={isCreating}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {isCreating ? 'Creando...' : '+ Instagram'}
        </button>

        <button
          onClick={() => fetchConnections()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refrescar
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-2">Canal</label>
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value as ChannelType | '')}
            className="px-3 py-2 border rounded"
          >
            <option value="">Todos</option>
            <option value="whatsapp_web">WhatsApp Web</option>
            <option value="whatsapp_api">WhatsApp API</option>
            <option value="instagram_direct">Instagram</option>
            <option value="facebook_messenger">Facebook</option>
            <option value="telegram">Telegram</option>
            <option value="webchat">WebChat</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Estado</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ConnectionStatus | '')}
            className="px-3 py-2 border rounded"
          >
            <option value="">Todos</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="authenticated">Autenticado</option>
            <option value="connecting">Conectando</option>
            <option value="disconnected">Desconectado</option>
            <option value="error">Error</option>
          </select>
        </div>

        <button
          onClick={handleFilter}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Aplicar Filtros
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-900 font-bold text-xl">
            ×
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando conexiones...</p>
        </div>
      )}

      {/* Tabla de Conexiones */}
      {!isLoading && connections.length > 0 && (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Canal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Departamento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Última Actividad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {connections.map((conn) => (
                  <tr key={conn.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{conn.id}</td>
                    <td className="px-4 py-3 text-sm font-medium">{conn.connectionName}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                        {conn.channelType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          conn.status === 'active' || conn.status === 'authenticated'
                            ? 'bg-green-100 text-green-800'
                            : conn.status === 'error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {conn.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{conn.departmentId || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {conn.lastSeen
                        ? new Date(conn.lastSeen).toLocaleString('es-ES', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        : 'Nunca'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        {conn.status === 'inactive' && (
                          <button
                            onClick={() => handleActivate(conn.id)}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Activar
                          </button>
                        )}

                        {(conn.status === 'active' || conn.status === 'authenticated') && (
                          <button
                            onClick={() => handleDeactivate(conn.id)}
                            className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
                          >
                            Desactivar
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(conn.id, conn.connectionName)}
                          disabled={isDeleting}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Mostrando {connections.length} de {pagination.totalItems} conexiones
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Anterior
                </button>

                <span className="px-4 py-2 text-gray-700">
                  Página {pagination.page} de {pagination.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && connections.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No se encontraron conexiones</p>
          <p className="text-gray-500 mt-2">Crea una nueva conexión para empezar</p>
        </div>
      )}
    </div>
  );
}
