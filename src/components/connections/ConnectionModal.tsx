'use client';

import { connectionsService } from '@/lib/api/services/connections';
import { CreateConnectionRequest, ProviderType, ProviderCredentials, TestConnectionResponse, WebhookConfig } from '@/types/connections';
import { Clock, X, CheckCircle, AlertCircle, Loader2, TestTube, Eye, EyeOff, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { WebhookConfigModal } from './WebhookConfigModal';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionType: ProviderType;
  editingConnection?: any;
  onSave: (data: any) => void;
}

interface ValidationErrors {
  [key: string]: string;
}

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

const connectionTypeLabels: Record<ProviderType, string> = {
  'whatsapp': 'WhatsApp',
  'facebook': 'Facebook',
  'instagram': 'Instagram',
  'chatweb': 'Chat Web',
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
    name: editingConnection?.name || '',
    greetingMessage: editingConnection?.greetingMessage || '',
    farewellMessage: editingConnection?.farewellMessage || '',
    department: editingConnection?.department || '',
    botResetMinutes: editingConnection?.botResetMinutes || 30
  });

  const [credentials, setCredentials] = useState<ProviderCredentials>(
    editingConnection?.config?.credentials || {}
  );

  const [showVariables, setShowVariables] = useState(false);
  const [activeEditor, setActiveEditor] = useState<'greeting' | 'farewell' | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showSensitiveFields, setShowSensitiveFields] = useState<{ [key: string]: boolean }>({});
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig | undefined>(
    editingConnection?.config?.webhook
  );

  // Reset form when modal opens/closes or connection type changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: editingConnection?.name || '',
        greetingMessage: editingConnection?.greetingMessage || '',
        farewellMessage: editingConnection?.farewellMessage || '',
        department: editingConnection?.department || '',
        botResetMinutes: editingConnection?.botResetMinutes || 30
      });
      setCredentials(editingConnection?.config?.credentials || {});
      setValidationErrors({});
      setTestResult(null);
      setShowSensitiveFields({});
      setWebhookConfig(editingConnection?.config?.webhook);
    }
  }, [isOpen, connectionType, editingConnection]);

  // Provider-specific credential requirements
  const getRequiredCredentials = (provider: ProviderType): Array<{ key: keyof ProviderCredentials, label: string, type: 'text' | 'password', placeholder: string, description?: string }> => {
    switch (provider) {
      case 'whatsapp_api':
        return [
          { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'EAAxxxxxxxxxx...', description: 'Token de acceso de WhatsApp Business API' },
          { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text', placeholder: '1234567890123456', description: 'ID del número de teléfono en Meta Business' },
          { key: 'businessAccountId', label: 'Business Account ID', type: 'text', placeholder: '1234567890123456', description: 'ID de la cuenta de negocio' },
          { key: 'webhookVerifyToken', label: 'Webhook Verify Token', type: 'password', placeholder: 'mi_token_secreto', description: 'Token para verificar webhooks' }
        ];
      case 'facebook':
        return [
          { key: 'pageAccessToken', label: 'Page Access Token', type: 'password', placeholder: 'EAAxxxxxxxxxx...', description: 'Token de acceso de la página de Facebook' },
          { key: 'pageId', label: 'Page ID', type: 'text', placeholder: '1234567890123456', description: 'ID de la página de Facebook' },
          { key: 'appId', label: 'App ID', type: 'text', placeholder: '1234567890123456', description: 'ID de la aplicación de Facebook' },
          { key: 'appSecret', label: 'App Secret', type: 'password', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'Secreto de la aplicación' }
        ];
      case 'instagram':
        return [
          { key: 'pageAccessToken', label: 'Page Access Token', type: 'password', placeholder: 'EAAxxxxxxxxxx...', description: 'Token de acceso de la página de Instagram' },
          { key: 'pageId', label: 'Page ID', type: 'text', placeholder: '1234567890123456', description: 'ID de la página de Instagram' },
          { key: 'appId', label: 'App ID', type: 'text', placeholder: '1234567890123456', description: 'ID de la aplicación de Facebook' },
          { key: 'appSecret', label: 'App Secret', type: 'password', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'Secreto de la aplicación' }
        ];
      case 'telegram':
        return [
          { key: 'botToken', label: 'Bot Token', type: 'password', placeholder: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz', description: 'Token del bot de Telegram obtenido de @BotFather' },
          { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://mi-dominio.com/webhook/telegram', description: 'URL donde Telegram enviará los mensajes (opcional)' }
        ];
      case 'whatsapp':
        return [
          { key: 'sessionData', label: 'Session Data', type: 'password', placeholder: 'Datos de sesión...', description: 'Datos de sesión de WhatsApp Web (se genera automáticamente)' }
        ];
      case 'chatweb':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', description: 'Clave API para el chat web' }
        ];
      default:
        return [];
    }
  };

  // Validation functions
  const validateCredentials = (provider: ProviderType, creds: ProviderCredentials): ValidationErrors => {
    const errors: ValidationErrors = {};
    const required = getRequiredCredentials(provider);

    required.forEach(field => {
      const value = creds[field.key];
      if (!value || (typeof value === 'string' && !value.trim())) {
        errors[field.key] = `${field.label} es requerido`;
        return;
      }

      // Provider-specific validations
      switch (provider) {
        case 'whatsapp_api':
          if (field.key === 'accessToken' && !value.toString().startsWith('EAA')) {
            errors[field.key] = 'El Access Token debe comenzar con "EAA"';
          }
          if (field.key === 'phoneNumberId' && !/^\d{15,16}$/.test(value.toString())) {
            errors[field.key] = 'El Phone Number ID debe tener 15-16 dígitos';
          }
          break;
        case 'telegram':
          if (field.key === 'botToken' && !/^\d+:[A-Za-z0-9_-]+$/.test(value.toString())) {
            errors[field.key] = 'Formato de Bot Token inválido';
          }
          if (field.key === 'webhookUrl' && value && !/^https:\/\/.+/.test(value.toString())) {
            errors[field.key] = 'La Webhook URL debe usar HTTPS';
          }
          break;
        case 'facebook':
        case 'instagram':
          if (field.key === 'pageAccessToken' && !value.toString().startsWith('EAA')) {
            errors[field.key] = 'El Page Access Token debe comenzar con "EAA"';
          }
          if (field.key === 'pageId' && !/^\d+$/.test(value.toString())) {
            errors[field.key] = 'El Page ID debe contener solo números';
          }
          break;
      }
    });

    return errors;
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Basic form validation
    if (!formData.name.trim()) {
      errors.name = 'El nombre de la conexión es requerido';
    }
    if (!formData.department) {
      errors.department = 'El departamento es requerido';
    }
    if (!formData.greetingMessage.trim()) {
      errors.greetingMessage = 'El mensaje de saludo es requerido';
    }
    if (!formData.farewellMessage.trim()) {
      errors.farewellMessage = 'El mensaje de despedida es requerido';
    }

    // Credentials validation
    const credentialErrors = validateCredentials(connectionType, credentials);
    Object.assign(errors, credentialErrors);

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Test connection functionality
  const testConnection = async () => {
    if (!validateForm()) {
      setTestResult({
        success: false,
        message: 'Por favor corrige los errores en el formulario antes de probar la conexión'
      });
      return;
    }

    setIsTestingConnection(true);
    setTestResult(null);

    try {
      const connectionData: CreateConnectionRequest = {
        providerType: connectionType,
        name: formData.name,
        greetingMessage: formData.greetingMessage,
        farewellMessage: formData.farewellMessage,
        department: formData.department,
        botResetMinutes: formData.botResetMinutes,
        config: {
          credentials,
          settings: {
            maxRetries: 3,
            retryDelay: 1000,
            timeout: 30000,
            features: {
              supportsFiles: connectionType !== 'chatweb',
              supportsImages: connectionType !== 'chatweb',
              supportsAudio: ['whatsapp', 'whatsapp_api', 'telegram'].includes(connectionType),
              supportsVideo: ['whatsapp', 'whatsapp_api', 'telegram'].includes(connectionType),
              supportsLocation: ['whatsapp', 'whatsapp_api', 'telegram'].includes(connectionType),
              supportsTemplates: ['whatsapp_api', 'facebook', 'instagram'].includes(connectionType),
              supportsReadReceipts: ['whatsapp', 'whatsapp_api'].includes(connectionType),
              supportsTypingIndicators: true
            }
          },
          webhook: webhookConfig,
          botResetMinutes: formData.botResetMinutes,
          chatbotEnabled: false
        }
      };

      const result = await connectionsService.testConnection(connectionData);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Error inesperado al probar la conexión'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const toggleSensitiveField = (fieldKey: string) => {
    setShowSensitiveFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const connectionData: CreateConnectionRequest = {
        providerType: connectionType,
        name: formData.name,
        greetingMessage: formData.greetingMessage,
        farewellMessage: formData.farewellMessage,
        department: formData.department,
        botResetMinutes: formData.botResetMinutes,
        config: {
          credentials,
          settings: {
            maxRetries: 3,
            retryDelay: 1000,
            timeout: 30000,
            features: {
              supportsFiles: connectionType !== 'chatweb',
              supportsImages: connectionType !== 'chatweb',
              supportsAudio: ['whatsapp', 'whatsapp_api', 'telegram'].includes(connectionType),
              supportsVideo: ['whatsapp', 'whatsapp_api', 'telegram'].includes(connectionType),
              supportsLocation: ['whatsapp', 'whatsapp_api', 'telegram'].includes(connectionType),
              supportsTemplates: ['whatsapp_api', 'facebook', 'instagram'].includes(connectionType),
              supportsReadReceipts: ['whatsapp', 'whatsapp_api'].includes(connectionType),
              supportsTypingIndicators: true
            }
          },
          webhook: webhookConfig,
          botResetMinutes: formData.botResetMinutes,
          chatbotEnabled: false
        }
      };

      const response = await connectionsService.createConnection(connectionData);
      onSave(response);
      onClose();
    } catch (error) {
      console.error('Error al crear conexión:', error);
      setValidationErrors({
        submit: error instanceof Error ? error.message : 'Error al crear la conexión'
      });
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
            {editingConnection ? 'Configurar' : 'Nueva'} Conexión - {connectionTypeLabels[connectionType]}
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${validationErrors.name ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                }`}
              placeholder="Ej: WhatsApp Ventas Principal"
            />
            {validationErrors.name && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
            )}
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${validationErrors.department ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                }`}
            >
              <option value="">Seleccionar departamento</option>
              {mockDepartments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            {validationErrors.department && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.department}</p>
            )}
          </div>

          {/* Provider-specific Credentials */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              Configuración de {connectionTypeLabels[connectionType]}
            </h3>

            {getRequiredCredentials(connectionType).map((field) => (
              <div key={field.key} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {field.label} *
                </label>
                <div className="relative">
                  <input
                    type={field.type === 'password' && !showSensitiveFields[field.key] ? 'password' : 'text'}
                    required
                    value={credentials[field.key] || ''}
                    onChange={(e) => setCredentials(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${field.type === 'password' ? 'pr-10' : ''
                      } ${validationErrors[field.key] ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                      }`}
                  />
                  {field.type === 'password' && (
                    <button
                      type="button"
                      onClick={() => toggleSensitiveField(field.key)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showSensitiveFields[field.key] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
                {field.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {field.description}
                  </p>
                )}
                {validationErrors[field.key] && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors[field.key]}</p>
                )}
              </div>
            ))}

            {/* Connection Test */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800 dark:text-white">
                  Probar Conexión
                </h4>
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={isTestingConnection}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isTestingConnection ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <TestTube className="w-4 h-4" />
                  )}
                  <span>{isTestingConnection ? 'Probando...' : 'Probar'}</span>
                </button>
              </div>

              {testResult && (
                <div className={`flex items-start space-x-2 p-3 rounded-md ${testResult.success
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                  }`}>
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium">{testResult.message}</p>
                    {testResult.details && testResult.success && (
                      <p className="text-sm mt-1">
                        Tiempo de respuesta: {testResult.details.responseTime}ms
                      </p>
                    )}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Prueba la conexión antes de guardar para asegurar que las credenciales son correctas.
              </p>
            </div>

            {/* Webhook Configuration */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">
                    Configuración de Webhook
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Configura webhooks para recibir eventos en tiempo real
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWebhookModal(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>Configurar</span>
                </button>
              </div>

              {webhookConfig && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">URL:</span>
                    <span className="font-mono text-xs truncate max-w-xs" title={webhookConfig.url}>
                      {webhookConfig.url}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      webhookConfig.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                    }`}>
                      {webhookConfig.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Eventos:</span>
                    <span className="text-xs">
                      {webhookConfig.events.length} evento{webhookConfig.events.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}

              {!webhookConfig && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No hay webhook configurado. Haz clic en "Configurar" para añadir uno.
                </p>
              )}
            </div>
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
                hasError={!!validationErrors.greetingMessage}
              />
              {validationErrors.greetingMessage && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.greetingMessage}</p>
              )}
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
                hasError={!!validationErrors.farewellMessage}
              />
              {validationErrors.farewellMessage && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.farewellMessage}</p>
              )}
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

          {/* General Error Display */}
          {validationErrors.submit && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-red-800 dark:text-red-300">{validationErrors.submit}</p>
              </div>
            </div>
          )}

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
              disabled={isTestingConnection}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {editingConnection ? 'Actualizar Conexión' : 'Guardar Conexión'}
            </button>
          </div>
        </form>

        {/* Webhook Configuration Modal */}
        {showWebhookModal && (
          <WebhookConfigModal
            isOpen={showWebhookModal}
            onClose={() => setShowWebhookModal(false)}
            providerType={connectionType}
            connectionId={editingConnection?.id || 'new'}
            connectionName={formData.name || 'Nueva Conexión'}
            webhookConfig={webhookConfig}
            onSave={async (config) => {
              setWebhookConfig(config);
              setShowWebhookModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};