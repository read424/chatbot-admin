'use client';

import React, { useState, useEffect } from 'react';
import { ChatbotConfig, ChatbotRule, TriggerCondition, BotResponse, MenuOption, CreateChatbotRuleRequest, UpdateChatbotRuleRequest } from '@/types/chatbot';
import { ProviderType } from '@/types/connections';

interface ChatbotRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ruleData: Omit<CreateChatbotRuleRequest, 'chatbotConfigId'>) => Promise<void>;
  rule: ChatbotRule | null;
  config: ChatbotConfig;
}

const PROVIDER_TYPES: ProviderType[] = ['whatsapp', 'instagram', 'facebook', 'telegram', 'whatsapp_api'];

const TRIGGER_TYPES = [
  { value: 'keyword', label: 'Palabra Clave', description: 'Busca palabras específicas en el mensaje' },
  { value: 'pattern', label: 'Patrón', description: 'Usa expresiones regulares para coincidencias complejas' },
  { value: 'exact_match', label: 'Coincidencia Exacta', description: 'El mensaje debe coincidir exactamente' },
  { value: 'intent', label: 'Intención', description: 'Detecta la intención del usuario' }
];

const MATCH_TYPES = [
  { value: 'contains', label: 'Contiene' },
  { value: 'starts_with', label: 'Comienza con' },
  { value: 'ends_with', label: 'Termina con' },
  { value: 'exact', label: 'Exacto' }
];

const RESPONSE_TYPES = [
  { value: 'text', label: 'Texto', description: 'Respuesta de texto simple' },
  { value: 'transfer', label: 'Transferir', description: 'Transferir a un agente o departamento' },
  { value: 'menu', label: 'Menú', description: 'Mostrar opciones al usuario' },
  { value: 'template', label: 'Plantilla', description: 'Usar una plantilla predefinida' }
];

interface FormData {
  name: string;
  trigger: TriggerCondition;
  response: BotResponse & {
    transferToDepartment?: string;
    transferToAgent?: string;
    menuOptions?: MenuOption[];
  };
  channels: ProviderType[];
  priority: number;
}

export const ChatbotRuleModal: React.FC<ChatbotRuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  rule,
  config: _
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    trigger: {
      type: 'keyword',
      value: '',
      caseSensitive: false,
      matchType: 'contains'
    },
    response: {
      type: 'text',
      content: '',
      transferToDepartment: '',
      transferToAgent: '',
      menuOptions: [],
      delay: 1000
    },
    channels: ['whatsapp'],
    priority: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name,
        trigger: rule.trigger,
        response: rule.response,
        channels: rule.channels,
        priority: rule.priority
      });
    } else {
      // Reset form for new rule
      setFormData({
        name: '',
        trigger: {
          type: 'keyword',
          value: '',
          caseSensitive: false,
          matchType: 'contains'
        },
        response: {
          type: 'text',
          content: '',
          transferToDepartment: '',
          transferToAgent: '',
          menuOptions: [],
          delay: 1000
        },
        channels: ['whatsapp'],
        priority: 1
      });
    }
    setErrors({});
  }, [rule, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.trigger.value.trim()) {
      newErrors.triggerValue = 'El valor del trigger es requerido';
    }

    if (formData.response.type === 'text' && !formData.response.content.trim()) {
      newErrors.responseContent = 'El contenido de la respuesta es requerido';
    }

    if (formData.response.type === 'transfer' && !formData.response.transferToDepartment && !formData.response.transferToAgent) {
      newErrors.transferTarget = 'Debe especificar un departamento o agente para la transferencia';
    }

    if (formData.channels.length === 0) {
      newErrors.channels = 'Debe seleccionar al menos un canal';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      await onSave(formData);
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Error saving rule' });
    } finally {
      setSaving(false);
    }
  };

  const handleChannelToggle = (channel: ProviderType) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const addMenuOption = () => {
    const newOption: MenuOption = {
      id: Date.now().toString(),
      text: '',
      value: '',
      action: 'reply',
      actionValue: ''
    };

    setFormData(prev => ({
      ...prev,
      response: {
        ...prev.response,
        menuOptions: [
          ...(prev.response.menuOptions || []),
          newOption
        ]
      }
    }));
  };

  const updateMenuOption = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      response: {
        ...prev.response,
        menuOptions: prev.response.menuOptions?.map((option, i) =>
          i === index ? { ...option, [field]: value } : option
        ) || []
      }
    }));
  };

  const removeMenuOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      response: {
        ...prev.response,
        menuOptions: prev.response.menuOptions?.filter((_, i) => i !== index) || []
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {rule ? 'Editar Regla' : 'Nueva Regla'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {errors.general && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-700">{errors.general}</div>
              </div>
            )}

            <div className="space-y-6 max-h-96 overflow-y-auto">
              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Regla *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Ej: Saludo inicial"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridad
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">Menor número = mayor prioridad</p>
                </div>
              </div>

              {/* Trigger Configuration */}
              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Configuración del Trigger</h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Trigger
                    </label>
                    <select
                      value={formData.trigger.type}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        trigger: { ...prev.trigger, type: e.target.value as TriggerCondition['type'] }
                      }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      {TRIGGER_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      {TRIGGER_TYPES.find(t => t.value === formData.trigger.type)?.description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Coincidencia
                    </label>
                    <select
                      value={formData.trigger.matchType}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        trigger: { ...prev.trigger, matchType: e.target.value as TriggerCondition['matchType'] }
                      }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      {MATCH_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor del Trigger *
                  </label>
                  <input
                    type="text"
                    value={formData.trigger.value}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      trigger: { ...prev.trigger, value: e.target.value }
                    }))}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.triggerValue ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="Ej: hola, buenos días, ayuda"
                  />
                  {errors.triggerValue && <p className="mt-1 text-xs text-red-600">{errors.triggerValue}</p>}
                </div>

                <div className="mt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.trigger.caseSensitive}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        trigger: { ...prev.trigger, caseSensitive: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Sensible a mayúsculas y minúsculas
                    </label>
                  </div>
                </div>
              </div>

              {/* Response Configuration */}
              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Configuración de la Respuesta</h4>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Respuesta
                  </label>
                  <select
                    value={formData.response.type}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      response: { ...prev.response, type: e.target.value as BotResponse['type'] }
                    }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    {RESPONSE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {RESPONSE_TYPES.find(t => t.value === formData.response.type)?.description}
                  </p>
                </div>

                {/* Text Response */}
                {formData.response.type === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contenido de la Respuesta *
                    </label>
                    <textarea
                      value={formData.response.content}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        response: { ...prev.response, content: e.target.value }
                      }))}
                      rows={3}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.responseContent ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="Escribe la respuesta que enviará el bot..."
                    />
                    {errors.responseContent && <p className="mt-1 text-xs text-red-600">{errors.responseContent}</p>}
                  </div>
                )}

                {/* Transfer Response */}
                {formData.response.type === 'transfer' && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Departamento
                      </label>
                      <input
                        type="text"
                        value={formData.response.transferToDepartment || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          response: { ...prev.response, transferToDepartment: e.target.value }
                        }))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="soporte, ventas, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Agente Específico
                      </label>
                      <input
                        type="text"
                        value={formData.response.transferToAgent || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          response: { ...prev.response, transferToAgent: e.target.value }
                        }))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="ID o nombre del agente"
                      />
                    </div>
                    {errors.transferTarget && <p className="mt-1 text-xs text-red-600 col-span-2">{errors.transferTarget}</p>}
                  </div>
                )}

                {/* Menu Response */}
                {formData.response.type === 'menu' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Opciones del Menú
                      </label>
                      <button
                        type="button"
                        onClick={addMenuOption}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        Agregar Opción
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.response.menuOptions?.map((option, index) => (
                        <div key={option.id} className="border border-gray-200 rounded-md p-3">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => updateMenuOption(index, 'text', e.target.value)}
                              placeholder="Texto de la opción"
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <input
                              type="text"
                              value={option.value}
                              onChange={(e) => updateMenuOption(index, 'value', e.target.value)}
                              placeholder="Valor de la opción"
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <div className="flex items-center space-x-2">
                              <select
                                value={option.action}
                                onChange={(e) => updateMenuOption(index, 'action', e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              >
                                <option value="reply">Responder</option>
                                <option value="transfer">Transferir</option>
                                <option value="trigger_rule">Activar Regla</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => removeMenuOption(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Response Delay */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retraso de Respuesta (ms)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    step="100"
                    value={formData.response.delay || 1000}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      response: { ...prev.response, delay: parseInt(e.target.value) }
                    }))}
                    className="mt-1 block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Channel Selection */}
              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Canales Activos</h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {PROVIDER_TYPES.map(channel => (
                    <div key={channel} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.channels.includes(channel)}
                        onChange={() => handleChannelToggle(channel)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700 capitalize">
                        {channel.replace('_', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.channels && <p className="mt-1 text-xs text-red-600">{errors.channels}</p>}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {saving ? 'Guardando...' : (rule ? 'Actualizar' : 'Crear')} Regla
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};