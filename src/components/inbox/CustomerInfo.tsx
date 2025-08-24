'use client';

import { salespeople } from '@/data/mockData';
import type { Chat } from '@/types/chat';
import { Mail, Phone, User } from 'lucide-react';
import React, { useState } from 'react';

interface CustomerInfoProps {
  chat: Chat | null;
  onAssignSalesperson: (chatId: number, salesperson: string) => void;
}

export const CustomerInfo: React.FC<CustomerInfoProps> = ({
  chat,
  onAssignSalesperson
}) => {
  const [selectedSalesperson, setSelectedSalesperson] = useState('');
  const [notes, setNotes] = useState('Cliente interesado en productos premium. Seguimiento pendiente.');

  React.useEffect(() => {
    if (chat) {
      setSelectedSalesperson(chat.assignedTo || '');
    }
  }, [chat]);

  const handleAssign = () => {
    if (chat && selectedSalesperson) {
      onAssignSalesperson(chat.id, selectedSalesperson);
    }
  };

  if (!chat) return null;

  return (
    <div className="w-1/5 bg-white border-l border-gray-300 p-4">
      <div className="space-y-6">
        {/* Información del cliente */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Información del Cliente</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">{chat.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">{chat.phone}</span>
            </div>
            {chat.email && (
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">{chat.email}</span>
              </div>
            )}
            {chat.additionalPhones && chat.additionalPhones.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Teléfonos adicionales:</div>
                {chat.additionalPhones.map((phone, index) => (
                  <div key={index} className="flex items-center space-x-2 ml-6">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span className="text-sm text-gray-700">{phone}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${chat.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-700 capitalize">{chat.status}</span>
            </div>
          </div>
        </div>

        {/* Asignación de vendedor */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Asignar Vendedor</h3>
          <select
            value={selectedSalesperson}
            onChange={(e) => setSelectedSalesperson(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500"
          >
            <option value="">Sin asignar</option>
            {salespeople.map((person) => (
              <option key={person} value={person}>{person}</option>
            ))}
          </select>
          <button
            onClick={handleAssign}
            disabled={selectedSalesperson === chat.assignedTo}
            className="w-full mt-2 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Asignar
          </button>
        </div>

        {/* Notas internas */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Notas Internas</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:border-green-500"
            rows={4}
            placeholder="Agregar notas sobre el cliente..."
          />
        </div>

        {/* Estadísticas rápidas */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Estadísticas</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Mensajes totales:</span>
              <span className="font-medium">{chat.messages?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Último contacto:</span>
              <span className="font-medium">{chat.timestamp}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};