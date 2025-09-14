'use client';

import React, { useState, useEffect } from 'react';
import { ChatbotConfig, ChatbotSettings as ChatbotSettingsType } from '@/types/chatbot';

interface ChatbotSettingsProps {
  config: ChatbotConfig;
  onUpdate: (updates: Partial<ChatbotConfig>) => void;
}

export const ChatbotSettings: React.FC<ChatbotSettingsProps> = ({ 
  config, 
  onUpdate 
}) => {
  const [settings, setSettings] = useState<ChatbotSettingsType>(config.settings);
  const [fallbackMessage, setFallbackMessage] = useState(config.fallbackMessage);
  const [transferToDepartment, setTransferToDepartment] = useState(config.transferToDepartment || '');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const hasSettingsChanges = JSON.stringify(settings) !== JSON.stringify(config.settings);
    const hasFallbackChanges = fallbackMessage !== config.fallbackMessage;
    const hasTransferChanges = transferToDepartment !== (config.transferToDepartment || '');
    
    setHasChanges(hasSettingsChanges || hasFallbackChanges || hasTransferChanges);
  }, [settings, fallbackMessage, transferToDepartment, config]);

  const handleSettingChange = (key: keyof ChatbotSettingsType, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleEscalationKeywordsChange = (keywords: string) => {
    const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
    handleSettingChange('escalationKeywords', keywordArray);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onUpdate({ 
        settings,
        fallbackMessage,
        transferToDepartment: transferToDepartment || undefined
      });
      setHasChanges(false);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(config.settings);
    setFallbackMessage(config.fallbackMessage);
    setTransferToDepartment(config.transferToDepartment || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">Configuración del Chatbot</h4>
        {hasChanges && (
          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Response Delay */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Retraso de Respuesta (ms)
          </label>
          <input
            type="number"
            min="0"
            max="10000"
            step="100"
            value={settings.responseDelay}
            onChange={(e) => handleSettingChange('responseDelay', parseInt(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Tiempo de espera antes de enviar la respuesta automática
          </p>
        </div>

        {/* Max Retries */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Máximo de Reintentos
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={settings.maxRetries}
            onChange={(e) => handleSettingChange('maxRetries', parseInt(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Número máximo de intentos antes de transferir a un agente
          </p>
        </div>

        {/* Session Timeout */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiempo de Sesión (minutos)
          </label>
          <input
            type="number"
            min="5"
            max="120"
            value={settings.sessionTimeout}
            onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Tiempo de inactividad antes de cerrar la sesión del chatbot
          </p>
        </div>
      </div>

      {/* Boolean Settings */}
      <div className="space-y-4">
        <h5 className="text-sm font-medium text-gray-900">Opciones Adicionales</h5>
        
        <div className="space-y-3">
          {[
            {
              key: 'collectUserInfo' as keyof ChatbotSettingsType,
              label: 'Recopilar Información del Usuario',
              description: 'Solicitar nombre y datos de contacto al inicio de la conversación'
            },
            {
              key: 'enableTypingIndicator' as keyof ChatbotSettingsType,
              label: 'Indicador de Escritura',
              description: 'Mostrar que el bot está escribiendo antes de enviar respuestas'
            },
            {
              key: 'enableReadReceipts' as keyof ChatbotSettingsType,
              label: 'Confirmaciones de Lectura',
              description: 'Marcar mensajes como leídos automáticamente'
            }
          ].map((option) => (
            <div key={option.key} className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={settings[option.key] as boolean}
                  onChange={(e) => handleSettingChange(option.key, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700">
                  {option.label}
                </label>
                <p className="text-gray-500">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Escalation Keywords */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Palabras Clave de Escalación
        </label>
        <input
          type="text"
          value={settings.escalationKeywords.join(', ')}
          onChange={(e) => handleEscalationKeywordsChange(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="agente, humano, persona, ayuda"
        />
        <p className="mt-1 text-xs text-gray-500">
          Palabras separadas por comas que activarán la transferencia a un agente humano
        </p>
      </div>

      {/* Fallback Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mensaje de Respaldo
        </label>
        <textarea
          value={fallbackMessage}
          onChange={(e) => setFallbackMessage(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Mensaje que se enviará cuando el bot no pueda entender o responder"
        />
        <p className="mt-1 text-xs text-gray-500">
          Este mensaje se enviará cuando ninguna regla coincida con el mensaje del usuario
        </p>
      </div>

      {/* Transfer Department */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Departamento de Transferencia por Defecto
        </label>
        <input
          type="text"
          value={transferToDepartment}
          onChange={(e) => setTransferToDepartment(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="soporte, ventas, atencion-cliente"
        />
        <p className="mt-1 text-xs text-gray-500">
          Departamento al que se transferirán las conversaciones cuando sea necesario
        </p>
      </div>

      {/* Preview Section */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="text-sm font-medium text-gray-900 mb-3">Vista Previa de Configuración</h5>
        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>Retraso:</strong> {settings.responseDelay}ms</p>
          <p><strong>Reintentos:</strong> {settings.maxRetries}</p>
          <p><strong>Sesión:</strong> {settings.sessionTimeout} minutos</p>
          <p><strong>Escalación:</strong> {settings.escalationKeywords.join(', ')}</p>
          <p><strong>Opciones:</strong> 
            {settings.collectUserInfo && ' Recopilar info'} 
            {settings.enableTypingIndicator && ' Indicador'} 
            {settings.enableReadReceipts && ' Confirmaciones'}
          </p>
        </div>
      </div>
    </div>
  );
};