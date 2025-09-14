'use client';

import { ProviderType } from '@/types/connections';
import { TestTube, CircleCheckBig, AlertCircle, Loader2, Code, Copy, Download } from 'lucide-react';
import { useState } from 'react';

interface WebhookTesterProps {
  providerType: ProviderType;
  connectionId: string;
  webhookUrl: string;
  webhookSecret?: string;
  onTest?: (result: WebhookTestResult) => void;
}

interface WebhookTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  statusCode?: number;
  headers?: Record<string, string>;
  body?: unknown;
  payload?: unknown;
  signature?: string;
}

const samplePayloads: Record<ProviderType, Record<string, unknown>> = {
  whatsapp_api: {
    object: 'whatsapp_business_account',
    entry: [{
      id: '123456789',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '1234567890',
            phone_number_id: '123456789'
          },
          messages: [{
            from: '1234567890',
            id: 'wamid.HBgLMTIzNDU2Nzg5MAA=',
            timestamp: '1234567890',
            text: { body: 'Hello from webhook tester!' },
            type: 'text'
          }]
        },
        field: 'messages'
      }]
    }]
  },
  telegram: {
    update_id: 123456789,
    message: {
      message_id: 123,
      from: {
        id: 987654321,
        is_bot: false,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        language_code: 'en'
      },
      chat: {
        id: 987654321,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        type: 'private'
      },
      date: Math.floor(Date.now() / 1000),
      text: 'Hello from webhook tester!'
    }
  },
  facebook: {
    object: 'page',
    entry: [{
      id: '123456789',
      time: Date.now(),
      messaging: [{
        sender: { id: '987654321' },
        recipient: { id: '123456789' },
        timestamp: Date.now(),
        message: {
          mid: 'mid.test123',
          text: 'Hello from webhook tester!'
        }
      }]
    }]
  },
  instagram: {
    object: 'instagram',
    entry: [{
      id: '123456789',
      time: Date.now(),
      messaging: [{
        sender: { id: '987654321' },
        recipient: { id: '123456789' },
        timestamp: Date.now(),
        message: {
          mid: 'mid.test123',
          text: 'Hello from webhook tester!'
        }
      }]
    }]
  },
  whatsapp: {
    message: 'Hello from webhook tester!',
    from: '1234567890',
    timestamp: Date.now(),
    type: 'text'
  },
  chatweb: {
    event: 'message',
    data: {
      message: 'Hello from webhook tester!',
      visitor_id: 'visitor_123',
      session_id: 'session_456',
      timestamp: Date.now()
    }
  }
};

export const WebhookTester: React.FC<WebhookTesterProps> = ({
  providerType,
  connectionId,
  webhookUrl,
  webhookSecret,
  onTest
}) => {
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<WebhookTestResult | null>(null);
  const [customPayload, setCustomPayload] = useState('');
  const [useCustomPayload, setUseCustomPayload] = useState(false);
  const [showPayload, setShowPayload] = useState(false);

  // Generate webhook signature (simplified version)
  const generateSignature = (payload: string, secret: string): string => {
    // In a real implementation, this would use crypto.createHmac
    // For demo purposes, we'll create a mock signature
    return `sha256=${btoa(payload + secret).substring(0, 32)}`;
  };

  // Test webhook with payload
  const testWebhook = async () => {
    if (!webhookUrl) {
      const result: WebhookTestResult = {
        success: false,
        message: 'URL del webhook no configurada'
      };
      setTestResult(result);
      onTest?.(result);
      return;
    }

    setIsTestingWebhook(true);
    setTestResult(null);

    try {
      const startTime = Date.now();
      
      // Prepare payload
      let payload: Record<string, unknown>;
      if (useCustomPayload && customPayload.trim()) {
        try {
          payload = JSON.parse(customPayload);
        } catch {
          throw new Error('Payload JSON inválido');
        }
      } else {
        payload = {
          ...samplePayloads[providerType],
          connection_id: connectionId,
          test: true,
          timestamp: Date.now()
        };
      }

      const payloadString = JSON.stringify(payload);
      
      // Generate signature if secret is provided
      let signature: string | undefined;
      if (webhookSecret) {
        signature = generateSignature(payloadString, webhookSecret);
      }

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'WebhookTester/1.0'
      };

      if (signature) {
        // Different providers use different signature headers
        switch (providerType) {
          case 'whatsapp_api':
            headers['X-Hub-Signature-256'] = signature;
            break;
          case 'facebook':
          case 'instagram':
            headers['X-Hub-Signature'] = signature;
            break;
          case 'telegram':
            headers['X-Telegram-Bot-Api-Secret-Token'] = webhookSecret;
            break;
          default:
            headers['X-Webhook-Signature'] = signature;
        }
      }

      // Make the actual webhook request
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: payloadString
      });

      const responseTime = Date.now() - startTime;
      let responseBody: unknown;
      
      try {
        const responseText = await response.text();
        responseBody = responseText ? JSON.parse(responseText) : null;
      } catch {
        responseBody = await response.text();
      }

      const result: WebhookTestResult = {
        success: response.ok,
        message: response.ok 
          ? 'Webhook respondió correctamente' 
          : `Error ${response.status}: ${response.statusText}`,
        responseTime,
        statusCode: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseBody,
        payload,
        signature
      };

      setTestResult(result);
      onTest?.(result);

    } catch (error: unknown) {
      const result: WebhookTestResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Error inesperado al probar el webhook'
      };
      setTestResult(result);
      onTest?.(result);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err: unknown) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Download as file
  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const defaultPayload = JSON.stringify(samplePayloads[providerType] || {}, null, 2);

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-800 dark:text-white">
            Probar Webhook
          </h4>
          <button
            onClick={testWebhook}
            disabled={isTestingWebhook || !webhookUrl}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isTestingWebhook ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <TestTube className="w-4 h-4" />
            )}
            <span>{isTestingWebhook ? 'Enviando...' : 'Enviar Prueba'}</span>
          </button>
        </div>

        {/* Payload Options */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="payloadType"
                checked={!useCustomPayload}
                onChange={() => setUseCustomPayload(false)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Usar payload de ejemplo para {providerType.toUpperCase()}
              </span>
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="payloadType"
                checked={useCustomPayload}
                onChange={() => setUseCustomPayload(true)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Usar payload personalizado
              </span>
            </label>
          </div>

          {/* Custom Payload Editor */}
          {useCustomPayload && (
            <div className="mt-3">
              <textarea
                value={customPayload}
                onChange={(e) => setCustomPayload(e.target.value)}
                placeholder="Ingresa tu payload JSON personalizado..."
                className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>
          )}

          {/* Show Payload Button */}
          <button
            type="button"
            onClick={() => setShowPayload(!showPayload)}
            className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Code className="w-4 h-4" />
            <span>{showPayload ? 'Ocultar' : 'Ver'} payload que se enviará</span>
          </button>
        </div>
      </div>

      {/* Payload Preview */}
      {showPayload && (
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-medium text-gray-300">
              Payload que se enviará:
            </h5>
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(useCustomPayload ? customPayload : defaultPayload)}
                className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                title="Copiar payload"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => downloadAsFile(
                  useCustomPayload ? customPayload : defaultPayload,
                  `webhook-payload-${providerType}.json`
                )}
                className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                title="Descargar payload"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <pre className="text-sm text-green-400 overflow-x-auto">
            {useCustomPayload ? customPayload : defaultPayload}
          </pre>
        </div>
      )}

      {/* Test Result */}
      {testResult && (
        <div className={`p-4 rounded-lg ${
          testResult.success
            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
        }`}>
          <div className="flex items-start space-x-2">
            {testResult.success ? (
              <CircleCheckBig className="w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-medium">{testResult.message}</p>
              
              {/* Response Details */}
              <div className="mt-3 space-y-2 text-sm">
                {testResult.responseTime && (
                  <div className="flex justify-between">
                    <span>Tiempo de respuesta:</span>
                    <span className="font-mono">{testResult.responseTime}ms</span>
                  </div>
                )}
                
                {testResult.statusCode && (
                  <div className="flex justify-between">
                    <span>Código de estado:</span>
                    <span className="font-mono">{testResult.statusCode}</span>
                  </div>
                )}

                {testResult.signature && (
                  <div className="flex justify-between">
                    <span>Firma generada:</span>
                    <span className="font-mono text-xs truncate max-w-xs" title={testResult.signature}>
                      {testResult.signature}
                    </span>
                  </div>
                )}
              </div>

              {/* Response Body */}
              {testResult.body && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    Ver respuesta del servidor
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-800 text-green-400 rounded text-xs overflow-x-auto">
                    {typeof testResult.body === 'string' 
                      ? testResult.body 
                      : JSON.stringify(testResult.body, null, 2)
                    }
                  </pre>
                </details>
              )}

              {/* Response Headers */}
              {testResult.headers && Object.keys(testResult.headers).length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    Ver headers de respuesta
                  </summary>
                  <div className="mt-2 p-3 bg-gray-800 rounded text-xs">
                    {Object.entries(testResult.headers).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-gray-300">
                        <span className="text-blue-400">{key}:</span>
                        <span className="ml-2 truncate">{value}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>• El webhook debe responder con código 200 para considerarse exitoso</p>
        <p>• Se incluirá una firma en el header si se configuró un secreto</p>
        <p>• El payload incluye datos de prueba específicos para {providerType.toUpperCase()}</p>
      </div>
    </div>
  );
};