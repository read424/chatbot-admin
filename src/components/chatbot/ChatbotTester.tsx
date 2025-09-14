'use client';

import React, { useState } from 'react';
import { ChatbotConfig, ChatbotTestRequest } from '@/types/chatbot';
import { ProviderType } from '@/types/connections';
import { ChatbotService } from '@/lib/api/services/chatbot';

interface ChatbotTesterProps {
  config: ChatbotConfig;
}

interface TestMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  channel?: ProviderType;
  matchedRule?: string;
  processingTime?: number;
}

export const ChatbotTester: React.FC<ChatbotTesterProps> = ({ config }) => {
  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<ProviderType>('whatsapp');
  const [isLoading, setIsLoading] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    success: boolean;
    errors: Array<{
      type: string;
      message: string;
      ruleId?: string;
    }>;
  } | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: TestMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
      channel: selectedChannel
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const testRequest: ChatbotTestRequest = {
        configId: config.id,
        message: inputMessage,
        channel: selectedChannel
      };

      const response = await ChatbotService.testChatbotRule(testRequest);

      const botMessage: TestMessage = {
        id: (Date.now() + 1).toString(),
        content: response.response?.content || 'Sin respuesta configurada',
        isUser: false,
        timestamp: new Date(),
        channel: selectedChannel,
        matchedRule: response.matchedRule?.name,
        processingTime: response.processingTime
      };

      setMessages(prev => [...prev, botMessage]);

      // If should transfer, add transfer message
      if (response.shouldTransfer) {
        const transferMessage: TestMessage = {
          id: (Date.now() + 2).toString(),
          content: `🔄 Transferido a: ${response.transferTarget || 'Agente'}`,
          isUser: false,
          timestamp: new Date(),
          channel: selectedChannel
        };
        setMessages(prev => [...prev, transferMessage]);
      }

    } catch (error) {
      const errorMessage: TestMessage = {
        id: (Date.now() + 1).toString(),
        content: `❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        isUser: false,
        timestamp: new Date(),
        channel: selectedChannel
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateConfig = async () => {
    try {
      setIsLoading(true);
      const validation = await ChatbotService.validateChatbotConfig(config.id);
      setValidationResults(validation);
      setShowValidation(true);
    } catch (error) {
      console.error('Error validating config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900">Probador de Chatbot</h4>
        <div className="flex space-x-3">
          <button
            onClick={handleValidateConfig}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Validar Configuración
          </button>
          <button
            onClick={clearMessages}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Limpiar Chat
          </button>
        </div>
      </div>

      {/* Channel Selector */}
      <div className="bg-gray-50 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Canal de Prueba
        </label>
        <select
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value as ProviderType)}
          className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="whatsapp">WhatsApp</option>
          <option value="whatsapp_api">WhatsApp API</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="telegram">Telegram</option>
        </select>
      </div>

      {/* Chat Interface */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">🤖</span>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-900">Chatbot de Prueba</h5>
              <p className="text-xs text-gray-500">Canal: {selectedChannel}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
              </div>
              <p className="text-sm">Envía un mensaje para probar el chatbot</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs opacity-75">
                      {formatTime(message.timestamp)}
                    </p>
                    {message.matchedRule && (
                      <span className="text-xs opacity-75 ml-2">
                        📋 {message.matchedRule}
                      </span>
                    )}
                    {message.processingTime && (
                      <span className="text-xs opacity-75 ml-2">
                        ⚡ {message.processingTime}ms
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  <span className="text-sm">El bot está escribiendo...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje para probar..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Validation Results Modal */}
      {showValidation && validationResults && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowValidation(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Resultados de Validación
                  </h3>
                  <button
                    onClick={() => setShowValidation(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {validationResults.success && validationResults.errors.length === 0 ? (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-green-800">
                            ✅ Configuración válida
                          </h4>
                          <p className="text-sm text-green-700 mt-1">
                            No se encontraron problemas en la configuración del chatbot.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <h4 className="text-sm font-medium text-yellow-800 mb-2">
                          ⚠️ Problemas encontrados ({validationResults.errors.length})
                        </h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {validationResults.errors.map((error, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <div>
                                <strong>{error.type.replace('_', ' ')}:</strong> {error.message}
                                {error.ruleId && (
                                  <span className="text-xs text-yellow-600 block">
                                    Regla ID: {error.ruleId}
                                  </span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowValidation(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};