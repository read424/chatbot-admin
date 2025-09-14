'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChatbotConfig, ChatbotRule } from '@/types/chatbot';
import { CreateChatbotRuleRequest, UpdateChatbotRuleRequest } from '@/types/chatbot';
import { ChatbotService } from '@/lib/api/services/chatbot';
import { ChatbotRuleModal } from '@/components/chatbot';

interface ChatbotRulesListProps {
  config: ChatbotConfig;
  onConfigUpdate?: (config: ChatbotConfig) => void;
}

export const ChatbotRulesList: React.FC<ChatbotRulesListProps> = ({
  config,
  onConfigUpdate: _
}) => {
  const [rules, setRules] = useState<ChatbotRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ChatbotRule | null>(null);

  const loadRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ChatbotService.getChatbotRules(config.id);
      if (response.success) {
        setRules(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading rules');
    } finally {
      setLoading(false);
    }
  }, [config.id]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);



  const handleCreateRule = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const handleEditRule = (rule: ChatbotRule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta regla?')) {
      return;
    }

    try {
      await ChatbotService.deleteChatbotRule(config.id, ruleId);
      setRules(rules.filter(rule => rule.id !== ruleId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting rule');
    }
  };

  const handleToggleRule = async (rule: ChatbotRule) => {
    try {
      const response = await ChatbotService.toggleChatbotRule(
        config.id,
        rule.id,
        !rule.isActive
      );
      if (response.success) {
        setRules(rules.map(r => r.id === rule.id ? response.data : r));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error toggling rule');
    }
  };

  const handleDuplicateRule = async (rule: ChatbotRule) => {
    try {
      const response = await ChatbotService.duplicateChatbotRule(
        config.id,
        rule.id,
        `${rule.name} (Copia)`
      );
      if (response.success) {
        setRules([...rules, response.data]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error duplicating rule');
    }
  };

  const handleSaveRule = async (ruleData: Omit<CreateChatbotRuleRequest, 'chatbotConfigId'>) => {
    try {
      if (editingRule) {
        // Update existing rule
        const updateData: UpdateChatbotRuleRequest = {
          id: editingRule.id,
          ...ruleData
        };
        const response = await ChatbotService.updateChatbotRule(config.id, updateData);
        if (response.success) {
          setRules(rules.map(r => r.id === editingRule.id ? response.data : r));
        }
      } else {
        // Create new rule
        const createData: CreateChatbotRuleRequest = {
          chatbotConfigId: config.id,
          ...ruleData
        };
        const response = await ChatbotService.createChatbotRule(createData);
        if (response.success) {
          setRules([...rules, response.data]);
        }
      }
      setIsModalOpen(false);
      setEditingRule(null);
    } catch (err) {
      throw err; // Let the modal handle the error
    }
  };

  const getTriggerDescription = (rule: ChatbotRule) => {
    const { trigger } = rule;
    switch (trigger.type) {
      case 'keyword':
        return `Palabra clave: "${trigger.value}"`;
      case 'pattern':
        return `Patrón: ${trigger.value}`;
      case 'exact_match':
        return `Coincidencia exacta: "${trigger.value}"`;
      case 'intent':
        return `Intención: ${trigger.value}`;
      default:
        return trigger.value;
    }
  };

  const getResponseDescription = (rule: ChatbotRule) => {
    const { response } = rule;
    switch (response.type) {
      case 'text':
        return response.content.length > 50
          ? `${response.content.substring(0, 50)}...`
          : response.content;
      case 'transfer':
        return `Transferir a: ${response.transferToDepartment || response.transferToAgent || 'Agente'}`;
      case 'menu':
        return `Menú con ${response.menuOptions?.length || 0} opciones`;
      case 'template':
        return 'Plantilla de mensaje';
      default:
        return response.content;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">
          Reglas del Chatbot ({rules.length})
        </h4>
        <button
          onClick={handleCreateRule}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Regla
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Sin reglas configuradas</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza creando tu primera regla de chatbot.
          </p>
          <div className="mt-6">
            <button
              onClick={handleCreateRule}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear Primera Regla
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {rules.map((rule, index) => (
              <li key={rule.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {rule.name}
                          </p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rule.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {rule.isActive ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                        <div className="mt-1 space-y-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Trigger:</span> {getTriggerDescription(rule)}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Respuesta:</span> {getResponseDescription(rule)}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Canales:</span>
                            {rule.channels.map((channel) => (
                              <span key={channel} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {channel}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleRule(rule)}
                      className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded ${rule.isActive
                        ? 'text-red-700 bg-red-100 hover:bg-red-200'
                        : 'text-green-700 bg-green-100 hover:bg-green-200'
                        }`}
                    >
                      {rule.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleEditRule(rule)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDuplicateRule(rule)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Duplicar
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ChatbotRuleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRule(null);
        }}
        onSave={handleSaveRule}
        rule={editingRule}
        config={config}
      />
    </div>
  );
};