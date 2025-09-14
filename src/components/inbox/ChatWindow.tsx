'use client';

import type { Chat, Message } from '@/types/chat';
import { Check, CheckCheck, Clock, Edit3, Mail, Phone, User } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { EditClientModal } from '../modals/EditClientModal';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
  chat: Chat | null;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onUpdateClient: (updatedClient: Chat) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  messages,
  onSendMessage,
  onUpdateClient
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSaveClient = (updatedClient: Chat) => {
    onUpdateClient(updatedClient);
  };

  if (!chat) {
    return (
      <div className="w-3/5 bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-lg">Selecciona un chat para comenzar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-3/5 bg-white flex flex-col">
      {/* Header del chat */}
      <div className="p-4 bg-gray-100 border-b border-gray-300 flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h2 className="font-semibold text-gray-900">{chat.name}</h2>
              <button
                onClick={() => setShowEditModal(true)}
                className="text-gray-400 hover:text-green-600 transition-colors"
                title="Editar información del cliente"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <div className="flex items-center space-x-1">
                <Phone className="w-3 h-3" />
                <span>{chat.phone}</span>
              </div>
              {chat.email && (
                <div className="flex items-center space-x-1">
                  <Mail className="w-3 h-3" />
                  <span>{chat.email}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${chat.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>{chat.status === 'online' ? 'En línea' : 'Desconectado'}</span>
              </div>
            </div>
            {chat.additionalPhones && chat.additionalPhones.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Teléfonos adicionales: {chat.additionalPhones.join(', ')}
              </div>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {chat.assignedTo ? (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Asignado a: {chat.assignedTo}
            </span>
          ) : (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              Sin asignar
            </span>
          )}
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === 'agent' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderId === 'agent'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <p>{message.content}</p>
              <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                message.senderId === 'agent' ? 'text-green-100' : 'text-gray-500'
              }`}>
                <Clock className="w-3 h-3" />
                <span>{message.createdAt}</span>
                {message.senderId === 'agent' && (
                  <>
                    {!message.isRead && <Check className="w-3 h-3" />}
                    {message.isRead && <CheckCheck className="w-3 h-3 text-blue-300" />}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSendMessage={onSendMessage} />

      {/* Modal de edición */}
      <EditClientModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        client={chat}
        onSave={handleSaveClient}
      />
    </div>
  );
};