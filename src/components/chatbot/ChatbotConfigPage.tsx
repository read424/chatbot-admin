'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChatbotConfig } from '@/types/chatbot';
import { Connection } from '@/types/connections';
import { ChatbotService } from '@/lib/api/services/chatbot';
import { connectionsService } from '@/lib/api/services/connections';
import { 
  ChatbotRulesList,
  WorkingHoursConfig,
  ChatbotSettings,
  ChatbotTester
} from '@/components/chatbot';

interface ChatbotConfigPageProps {
  connectionId?: string;
}

export const ChatbotConfigPage: React.FC<ChatbotConfigPageProps> = ({ connectionId }) => {
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rules' | 'hours' | 'settings' | 'test'>('rules');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (connectionId) {
        // Load connection details
        const connectionResponse = await connectionsService.getConnectionById(parseInt(connectionId));
        setConnection(connectionResponse);

        // Try to load existing chatbot config
        try {
          const configResponse = await ChatbotService.getChatbotConfigByConnection(connectionId);
          if (configResponse.success) {
            setConfig(configResponse.data);
          }
        } catch {
          // Config doesn't exist yet, that's okay
          console.log('No existing chatbot config found');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading chatbot configuration');
    } finally {
      setLoading(false);
    }
  }, [connectionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);



  const handleCreateConfig = async () => {
    if (!connectionId) return;

    try {
      const response = await ChatbotService.createChatbotConfig({
        connectionId,
        fallbackMessage: 'Lo siento, no pude entender tu mensaje. Un agente se pondrá en contacto contigo pronto.',
        isEnabled: false,
        settings: {
          responseDelay: 1000,
          maxRetries: 3,
          escalationKeywords: ['agente', 'humano', 'persona', 'ayuda'],
          collectUserInfo: true,
          enableTypingIndicator: true,
          enableReadReceipts: true,
          sessionTimeout: 30
        }
      });

      if (response.success) {
        setConfig(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating chatbot configuration');
    }
  };

  const handleToggleConfig = async (enabled: boolean) => {
    if (!config) return;

    try {
      const response = await ChatbotService.toggleChatbotConfig(config.id, enabled);
      if (response.success) {
        setConfig(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error toggling chatbot');
    }
  };

  const handleUpdateConfig = async (updates: Partial<ChatbotConfig>) => {
    if (!config) return;

    try {
      const response = await ChatbotService.updateChatbotConfig({
        id: config.id,
        ...updates
      });

      if (response.success) {
        setConfig(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating chatbot configuration');
    }
  };

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
                onClick={loadData}
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

  if (!config) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Sin configuración de chatbot</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza creando una configuración de chatbot para esta conexión.
        </p>
        <div className="mt-6">
          <button
            onClick={handleCreateConfig}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Crear Configuración de Chatbot
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Configuración de Chatbot
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {connection?.name || 'Conexión'} - {connection?.providerType}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-3">Estado:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  config.isEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {config.isEnabled ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <button
                onClick={() => handleToggleConfig(!config.isEnabled)}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                  config.isEnabled
                    ? 'text-red-700 bg-red-100 hover:bg-red-200'
                    : 'text-green-700 bg-green-100 hover:bg-green-200'
                }`}
              >
                {config.isEnabled ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'rules', name: 'Reglas', icon: '🤖' },
              { id: 'hours', name: 'Horarios', icon: '🕐' },
              { id: 'settings', name: 'Configuración', icon: '⚙️' },
              { id: 'test', name: 'Pruebas', icon: '🧪' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'rules' | 'hours' | 'settings' | 'test')}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'rules' && (
            <ChatbotRulesList 
              config={config} 
              onConfigUpdate={setConfig}
            />
          )}
          {activeTab === 'hours' && (
            <WorkingHoursConfig 
              config={config} 
              onUpdate={handleUpdateConfig}
            />
          )}
          {activeTab === 'settings' && (
            <ChatbotSettings 
              config={config} 
              onUpdate={handleUpdateConfig}
            />
          )}
          {activeTab === 'test' && config && (
            <ChatbotTester 
              config={config}
            />
          )}
        </div>
      </div>
    </div>
  );
};