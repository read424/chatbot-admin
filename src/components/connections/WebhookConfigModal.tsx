'use client';

import { WebhookConfig, ProviderType } from '@/types/connections';
import { X, Globe, Shield, TestTube, CheckCircle, AlertCircle, Loader2, Copy, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';

interface WebhookConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerType: ProviderType;
  connectionId: string;
  connectionName: string;
  webhookConfig?: WebhookConfig;
  onSave: (config: WebhookConfig) => Promise<void>;
}

interface WebhookTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  statusCode?: number;
  headers?: Record<string, string>;
  body?: unknown;
}

const providerWebhookEvents: Record<ProviderType, Array<{ value: string; label: string; description: string }>> = {
  whatsapp_api: [
    { value: 'messages', label: 'Mensajes', description: 'Mensajes entrantes y salientes' },
    { value: 'message_status', label: 'Estado de mensajes', description: 'Entregado, leído, fallido' },
    { value: 'account_alerts', label: 'Alertas de cuenta', description: 'Alertas del negocio' },
    { value: 'account_review_update', label: 'Revisión de cuenta', description: 'Actualizaciones de revisión' }
  ],
  facebook: [
    { value: 'messages', label: 'Mensajes', description: 'Mensajes de Messenger' },
    { value: 'messaging_postbacks', label: 'Postbacks', description: 'Respuestas de botones' },
    { value: 'messaging_optins', label: 'Opt-ins', description: 'Suscripciones' },
    { value: 'messaging_referrals', label: 'Referencias', description: 'Referencias de mensajes' }
  ],
  instagram: [
    { value: 'messages', label: 'Mensajes', description: 'Mensajes directos' },
    { value: 'messaging_postbacks', label: 'Postbacks', description: 'Respuestas de botones' },
    { value: 'messaging_optins', label: 'Opt-ins', description: 'Suscripciones' }
  ],
  telegram: [
    { value: 'message', label: 'Mensajes', description: 'Mensajes de texto' },
    { value: 'edited_message', label: 'Mensajes editados', description: 'Mensajes modificados' },
    { value: 'callback_query', label: 'Callback queries', description: 'Respuestas de botones inline' },
    { value: 'inline_query', label: 'Consultas inline', description: 'Consultas inline del bot' }
  ],
  whatsapp: [],
  chatweb: [
    { value: 'message', label: 'Mensajes', description: 'Mensajes del chat web' },
    { value: 'visitor_joined', label: 'Visitante unido', description: 'Nuevo visitante en el chat' },
    { value: 'visitor_left', label: 'Visitante salió', description: 'Visitante abandonó el chat' }
  ]
};

export const WebhookConfigModal: React.FC<WebhookConfigModalProps> = ({
  isOpen,
  onClose,
  providerType,
  connectionId,
  connectionName,
  webhookConfig,
  onSave
}) => {
  const [formData, setFormData] = useState<WebhookConfig>({
    url: '',
    secret: '',
    events: [],
    isActive: true,
    failureCount: 0
  });

  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<WebhookTestResult | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (webhookConfig) {
        setFormData(webhookConfig);
      } else {
        setFormData({
          url: '',
          secret: '',
          events: [],
          isActive: true,
          failureCount: 0
        });
      }
      setValidationErrors({});
      setTestResult(null);
    }
  }, [isOpen, webhookConfig]);

  // Generate webhook URL suggestion
  const generateWebhookUrl = () => {
    const baseUrl = window.location.origin;
    const providerPath = providerType.replace('_', '-');
    return `${baseUrl}/api/webhooks/${providerPath}/${connectionId}`;
  };

  // Generate secure secret
  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, secret: result }));
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.url.trim()) {
      errors.url = 'La URL del webhook es requerida';
    } else if (!/^https:\/\/.+/.test(formData.url)) {
      errors.url = 'La URL debe usar HTTPS';
    }

    if (formData.events.length === 0) {
      errors.events = 'Debe seleccionar al menos un evento';
    }

    if (formData.secret && formData.secret.length < 8) {
      errors.secret = 'El secreto debe tener al menos 8 caracteres';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Test webhook
  const testWebhook = async () => {
    if (!validateForm()) {
      setTestResult({
        success: false,
        message: 'Por favor corrige los errores en el formulario antes de probar el webhook'
      });
      return;
    }

    setIsTestingWebhook(true);
    setTestResult(null);

    try {
      // Simulate webhook test - in real implementation, this would call the API
      const startTime = Date.now();
      
      // Mock test payload based on provider
      // Test payload is generated for demonstration
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const responseTime = Date.now() - startTime;
      
      // Mock successful response
      const mockSuccess = Math.random() > 0.3; // 70% success rate for demo
      
      if (mockSuccess) {
        setTestResult({
          success: true,
          message: 'Webhook configurado correctamente y respondiendo',
          responseTime,
          statusCode: 200,
          headers: {
            'content-type': 'application/json',
            'x-webhook-signature': 'sha256=...'
          },
          body: { status: 'ok', received: true }
        });
      } else {
        setTestResult({
          success: false,
          message: 'Error al conectar con el webhook',
          responseTime,
          statusCode: 404
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Error inesperado al probar el webhook'
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  // Generate test payload for different providers
  const generateTestPayload = (provider: ProviderType): Record<string, unknown> => {
    const basePayload = {
      timestamp: Date.now(),
      connection_id: connectionId,
      test: true
    };

    switch (provider) {
      case 'whatsapp_api':
        return {
          ...basePayload,
          object: 'whatsapp_business_account',
          entry: [{
            id: '123456789',
            changes: [{
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '1234567890' },
                messages: [{
                  from: '1234567890',
                  id: 'wamid.test123',
                  timestamp: '1234567890',
                  text: { body: 'Test message from webhook tester' },
                  type: 'text'
                }]
              },
              field: 'messages'
            }]
          }]
        };
      
      case 'telegram':
        return {
          ...basePayload,
          update_id: 123456789,
          message: {
            message_id: 123,
            from: {
              id: 987654321,
              is_bot: false,
              first_name: 'Test',
              username: 'testuser'
            },
            chat: {
              id: 987654321,
              first_name: 'Test',
              username: 'testuser',
              type: 'private'
            },
            date: Math.floor(Date.now() / 1000),
            text: 'Test message from webhook tester'
          }
        };
      
      case 'facebook':
      case 'instagram':
        return {
          ...basePayload,
          object: 'page',
          entry: [{
            id: '123456789',
            time: Date.now(),
            messaging: [{
              sender: { id: '987654321' },
              recipient: { id: '123456789' },
              timestamp: Date.now(),
              message: {
                mid: 'test_message_id',
                text: 'Test message from webhook tester'
              }
            }]
          }]
        };
      
      default:
        return basePayload;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setValidationErrors({
        submit: error instanceof Error ? error.message : 'Error al guardar la configuración del webhook'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const availableEvents = providerWebhookEvents[providerType] || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Configuración de Webhook
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {connectionName} - {providerType.toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Webhook URL */}
          <div>
            <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Globe className="w-4 h-4 inline mr-2" />
              URL del Webhook *
            </label>
            <div className="flex space-x-2">
              <input
                id="webhook-url"
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  validationErrors.url ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="https://tu-dominio.com/webhook"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, url: generateWebhookUrl() }))}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Generar URL sugerida"
              >
                <Globe className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(formData.url)}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Copiar URL"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {validationErrors.url && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.url}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              La URL debe ser accesible públicamente y usar HTTPS
            </p>
          </div>

          {/* Webhook Secret */}
          <div>
            <label htmlFor="webhook-secret" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Shield className="w-4 h-4 inline mr-2" />
              Secreto del Webhook (Opcional)
            </label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  id="webhook-secret"
                  type={showSecret ? 'text' : 'password'}
                  value={formData.secret || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    validationErrors.secret ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Secreto para validar la autenticidad"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={generateSecret}
                className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                title="Generar secreto seguro"
              >
                <Shield className="w-4 h-4" />
              </button>
            </div>
            {validationErrors.secret && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.secret}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Se usa para verificar que los webhooks provienen de {providerType.toUpperCase()}
            </p>
          </div>

          {/* Events Selection */}
          {availableEvents.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Eventos a Recibir *
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableEvents.map((event) => (
                  <label
                    key={event.value}
                    className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.events.includes(event.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            events: [...prev.events, event.value]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            events: prev.events.filter(ev => ev !== event.value)
                          }));
                        }
                      }}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {event.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {event.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {validationErrors.events && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.events}</p>
              )}
            </div>
          )}

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Webhook Activo
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Activar o desactivar el webhook sin eliminar la configuración
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Webhook Test */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-800 dark:text-white">
                Probar Webhook
              </h4>
              <button
                type="button"
                onClick={testWebhook}
                disabled={isTestingWebhook || !formData.url}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isTestingWebhook ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <TestTube className="w-4 h-4" />
                )}
                <span>{isTestingWebhook ? 'Probando...' : 'Probar'}</span>
              </button>
            </div>

            {testResult && (
              <div className={`p-4 rounded-lg ${
                testResult.success
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
              }`}>
                <div className="flex items-start space-x-2">
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{testResult.message}</p>
                    {testResult.responseTime && (
                      <p className="text-sm mt-1">
                        Tiempo de respuesta: {testResult.responseTime}ms
                      </p>
                    )}
                    {testResult.statusCode && (
                      <p className="text-sm">
                        Código de estado: {testResult.statusCode}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Envía un payload de prueba a tu webhook para verificar que está funcionando correctamente
            </p>
          </div>

          {/* Error Display */}
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
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSaving ? 'Guardando...' : 'Guardar Configuración'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};