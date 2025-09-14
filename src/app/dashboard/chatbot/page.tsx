'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Connection } from '@/types/connections';
import { connectionsService } from '@/lib/api/services/connections';
import { ChatbotConfigPage } from '@/components/chatbot';

export default function ChatbotPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const connections = await connectionsService.getConnections();
      setConnections(connections);
      // Auto-select first connection if available
      if (connections.length > 0 && !selectedConnectionId) {
        setSelectedConnectionId(connections[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading connections');
    } finally {
      setLoading(false);
    }
  }, [selectedConnectionId]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
            <div className="mt-4">
              <button
                onClick={loadConnections}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Sin conexiones configuradas</h3>
        <p className="mt-1 text-sm text-gray-500">
          Necesitas configurar al menos una conexión antes de poder crear chatbots.
        </p>
        <div className="mt-6">
          <a
            href="/dashboard/connections"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Configurar Conexiones
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Configuración de Chatbots</h1>
          <p className="mt-2 text-sm text-gray-700">
            Configura y gestiona los chatbots para tus conexiones de redes sociales.
          </p>
        </div>
      </div>

      {/* Connection Selector */}
      {connections.length > 1 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Seleccionar Conexión
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {connections.map((connection) => (
                <button
                  key={connection.id}
                  onClick={() => setSelectedConnectionId(connection.id)}
                  className={`${selectedConnectionId === connection.id
                    ? 'ring-2 ring-blue-500 border-blue-500'
                    : 'border-gray-300 hover:border-gray-400'
                    } relative rounded-lg border p-4 flex flex-col items-start text-left focus:outline-none`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`flex-shrink-0 w-3 h-3 rounded-full ${connection.isActive ? 'bg-green-400' : 'bg-gray-400'
                      }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {connection.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {connection.providerType}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chatbot Configuration */}
      {selectedConnectionId && (
        <ChatbotConfigPage connectionId={selectedConnectionId} />
      )}
    </div>
  );
}