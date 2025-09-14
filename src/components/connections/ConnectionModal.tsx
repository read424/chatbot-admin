'use client';

import { connectionsService } from '@/lib/api/services/connections';
import { CreateConnectionRequest } from '@/types/connections';
import { Clock, X } from 'lucide-react';
import { useState } from 'react';
import { RichTextEditor } from './RichTextEditor';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionType: string;
  editingConnection?: any;
  onSave: (data: any) => void;
}

const connectionTypeLabels = {
  'whatsapp': 'WhatsApp',
  'facebook': 'Facebook',
  'instagram': 'Instagram',
  'chat': 'Chat Web',
  'whatsapp_api': 'WhatsApp Business API',
  'telegram': 'Telegram'
};

const mockDepartments = [
  { id: 1, name: 'Ventas' },
  { id: 2, name: 'Marketing' },
  { id: 3, name: 'Soporte' },
  { id: 4, name: 'Atención al Cliente' }
];

const availableVariables = [
  { name: '{{nombre_cliente}}', description: 'Nombre del cliente' },
  { name: '{{empresa}}', description: 'Nombre de la empresa' },
  { name: '{{fecha}}', description: 'Fecha actual' },
  { name: '{{hora}}', description: 'Hora actual' },
  { name: '{{agente}}', description: 'Nombre del agente' },
  { name: '{{departamento}}', description: 'Nombre del departamento' }
];

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  isOpen,
  onClose,
  connectionType,
  editingConnection,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    greetingMessage: '',
    farewellMessage: '',
    department: editingConnection?.department || '',
    botResetMinutes: 30
  });

  const [showVariables, setShowVariables] = useState(false);
  const [activeEditor, setActiveEditor] = useState<'greeting' | 'farewell' | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const connectionData: CreateConnectionRequest = {
        providerType: connectionType as 'whatsapp' | 'facebook' | 'instagram' | 'telegram' | 'whatsapp_api' | 'chatweb',
        name: formData.name,
        greetingMessage: formData.greetingMessage,
        farewellMessage: formData.farewellMessage,
        department: formData.department,
        botResetMinutes: formData.botResetMinutes,
        config: {
          credentials: {},
          settings: {
            maxRetries: 3,
            retryDelay: 1000,
            timeout: 30000,
            features: {
              supportsFiles: true,
              supportsImages: true,
              supportsAudio: true,
              supportsVideo: true,
              supportsLocation: true,
              supportsTemplates: true,
              supportsReadReceipts: true,
              supportsTypingIndicators: true
            }
          },
          botResetMinutes: formData.botResetMinutes,
          chatbotEnabled: false
        }
      };

      const response = await connectionsService.createConnection(connectionData);
      onSave(response);
    } catch (error) {
      console.error('Error al crear conexión:', error);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById(`${activeEditor}Message`) as HTMLTextAreaElement;
    if (textarea && activeEditor) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData[`${activeEditor}Message` as keyof typeof formData] as string;
      const newText = text.slice(0, start) + variable + text.slice(end);

      setFormData(prev => ({
        ...prev,
        [`${activeEditor}Message`]: newText
      }));

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
    setShowVariables(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {editingConnection ? 'Configurar' : 'Nueva'} Conexión - {connectionTypeLabels[connectionType as keyof typeof connectionTypeLabels]}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre de la Conexión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de la Conexión *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ej: WhatsApp Ventas Principal"
            />
          </div>

          {/* Departamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Departamento *
            </label>
            <select
              required
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Seleccionar departamento</option>
              {mockDepartments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Mensaje de Saludo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mensaje de Saludo *
            </label>
            <div className="relative">
              <RichTextEditor
                id="greetingMessage"
                value={formData.greetingMessage}
                onChange={(value) => setFormData(prev => ({ ...prev, greetingMessage: value }))}
                placeholder="Hola {{nombre_cliente}}, ¿en qué podemos ayudarte hoy?"
                onFocus={() => setActiveEditor('greeting')}
                onVariableClick={() => setShowVariables(true)}
              />
            </div>
          </div>

          {/* Mensaje de Despedida */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mensaje de Despedida *
            </label>
            <div className="relative">
              <RichTextEditor
                id="farewellMessage"
                value={formData.farewellMessage}
                onChange={(value) => setFormData(prev => ({ ...prev, farewellMessage: value }))}
                placeholder="Gracias por contactarnos {{nombre_cliente}}. ¡Que tengas un excelente día!"
                onFocus={() => setActiveEditor('farewell')}
                onVariableClick={() => setShowVariables(true)}
              />
            </div>
          </div>

          {/* Variables disponibles */}
          {showVariables && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3">Variables Disponibles:</h4>
              <div className="grid grid-cols-2 gap-2">
                {availableVariables.map((variable) => (
                  <button
                    key={variable.name}
                    type="button"
                    onClick={() => insertVariable(variable.name)}
                    className="text-left p-2 bg-white dark:bg-gray-700 rounded border hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
                  >
                    <div className="font-mono text-sm text-blue-600 dark:text-blue-400">
                      {variable.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {variable.description}
                    </div>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowVariables(false)}
                className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Cerrar variables
              </button>
            </div>
          )}

          {/* Reinicio de Chatbot */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reinicio de Chatbot (minutos)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="1440"
                value={formData.botResetMinutes}
                onChange={(e) => setFormData(prev => ({ ...prev, botResetMinutes: parseInt(e.target.value) || 30 }))}
                className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tiempo en minutos después del cual el chatbot se reinicia para nuevas conversaciones
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Guardar Conexión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};