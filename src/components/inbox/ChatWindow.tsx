'use client';

import type { Chat, Message, MessageType, MessageStatus, Conversation } from '@/types/chat';
import type { ProviderType } from '@/types/connections';
import { 
  Check, 
  CheckCheck, 
  Clock, 
  Edit3, 
  Mail, 
  Phone, 
  User,
  MessageSquare,
  Instagram,
  Facebook,
  Send,
  Bot,
  AlertCircle,
  FileText,
  Image,
  Mic,
  Video,
  MapPin,
  UserCheck,
  X
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { EditClientModal } from '../modals/EditClientModal';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
  chat: Chat | null;
  conversation?: Conversation | null;
  messages: Message[];
  onSendMessage: (message: string, type?: MessageType) => void;
  onUpdateClient: (updatedClient: Chat) => void;
  isTyping?: boolean;
  typingUsers?: string[];
}

// Channel icon mapping
const getChannelIcon = (channel: ProviderType) => {
  switch (channel) {
    case 'whatsapp':
    case 'whatsapp_api':
      return <MessageSquare className="w-4 h-4 text-green-500" />;
    case 'instagram':
      return <Instagram className="w-4 h-4 text-pink-500" />;
    case 'facebook':
      return <Facebook className="w-4 h-4 text-blue-500" />;
    case 'telegram':
      return <Send className="w-4 h-4 text-blue-400" />;
    default:
      return <MessageSquare className="w-4 h-4 text-gray-500" />;
  }
};

// Message type icon mapping
const getMessageTypeIcon = (type: MessageType) => {
  switch (type) {
    case 'image':
      return <Image className="w-4 h-4" />;
    case 'file':
      return <FileText className="w-4 h-4" />;
    case 'audio':
      return <Mic className="w-4 h-4" />;
    case 'video':
      return <Video className="w-4 h-4" />;
    case 'location':
      return <MapPin className="w-4 h-4" />;
    case 'contact':
      return <UserCheck className="w-4 h-4" />;
    default:
      return null;
  }
};

// Message status icon mapping
const getStatusIcon = (status: MessageStatus) => {
  switch (status) {
    case 'sending':
      return <Clock className="w-3 h-3 text-gray-400" />;
    case 'sent':
      return <Check className="w-3 h-3 text-gray-400" />;
    case 'delivered':
      return <CheckCheck className="w-3 h-3 text-gray-400" />;
    case 'read':
      return <CheckCheck className="w-3 h-3 text-blue-400" />;
    case 'failed':
      return <AlertCircle className="w-3 h-3 text-red-400" />;
    default:
      return null;
  }
};

// Channel name mapping
const getChannelName = (channel: ProviderType) => {
  switch (channel) {
    case 'whatsapp':
      return 'WhatsApp Web';
    case 'whatsapp_api':
      return 'WhatsApp API';
    case 'instagram':
      return 'Instagram';
    case 'facebook':
      return 'Facebook';
    case 'telegram':
      return 'Telegram';
    case 'chatweb':
      return 'Chat Web';
    default:
      return 'Desconocido';
  }
};

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  conversation,
  messages,
  onSendMessage,
  onUpdateClient,
  isTyping = false,
  typingUsers = []
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
      <div className="p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h2 className="font-semibold text-gray-900 dark:text-white">{chat.name}</h2>
              <button
                onClick={() => setShowEditModal(true)}
                className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                title="Editar información del cliente"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mt-1">
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
              {/* Channel indicator */}
              {conversation && (
                <div className="flex items-center space-x-1">
                  {getChannelIcon(conversation.channel)}
                  <span className="text-xs">{getChannelName(conversation.channel)}</span>
                </div>
              )}
            </div>
            {chat.additionalPhones && chat.additionalPhones.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Teléfonos adicionales: {chat.additionalPhones.join(', ')}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Priority indicator */}
          {conversation?.priority && conversation.priority !== 'normal' && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              conversation.priority === 'urgent' 
                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                : conversation.priority === 'high'
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            }`}>
              {conversation.priority === 'urgent' ? 'Urgente' : 
               conversation.priority === 'high' ? 'Alta' : 'Baja'}
            </span>
          )}
          
          {/* Assignment indicator */}
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {chat.assignedTo ? (
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded-full">
                Asignado a: {chat.assignedTo}
              </span>
            ) : (
              <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 px-2 py-1 rounded-full">
                Sin asignar
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderType === 'agent' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="max-w-xs lg:max-w-md">
              {/* Message bubble */}
              <div
                className={`px-4 py-2 rounded-lg ${
                  message.senderType === 'agent'
                    ? 'bg-green-500 text-white'
                    : message.senderType === 'bot'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                }`}
              >
                {/* Message header with channel and type indicators */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1">
                    {/* Channel indicator */}
                    <div className="flex items-center space-x-1">
                      {getChannelIcon(message.channel)}
                      <span className={`text-xs ${
                        message.senderType === 'agent' || message.senderType === 'bot'
                          ? 'text-white/70'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {getChannelName(message.channel)}
                      </span>
                    </div>
                    
                    {/* Message type indicator */}
                    {message.type !== 'text' && (
                      <div className={`flex items-center space-x-1 ${
                        message.senderType === 'agent' || message.senderType === 'bot'
                          ? 'text-white/70'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {getMessageTypeIcon(message.type)}
                        <span className="text-xs capitalize">{message.type}</span>
                      </div>
                    )}
                    
                    {/* Bot indicator */}
                    {message.senderType === 'bot' && (
                      <div className="flex items-center space-x-1 text-white/70">
                        <Bot className="w-3 h-3" />
                        <span className="text-xs">Bot</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message content */}
                <div className="message-content">
                  {message.type === 'text' ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : message.type === 'image' && message.metadata?.attachments?.[0] ? (
                    <div className="space-y-2">
                      <img 
                        src={message.metadata.attachments[0].url} 
                        alt="Imagen"
                        className="max-w-full h-auto rounded-lg"
                        loading="lazy"
                      />
                      {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                    </div>
                  ) : message.type === 'file' && message.metadata?.attachments?.[0] ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 bg-black/10 rounded-lg">
                        <FileText className="w-4 h-4" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {message.metadata.attachments[0].filename}
                          </p>
                          <p className="text-xs opacity-70">
                            {(message.metadata.attachments[0].size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                    </div>
                  ) : message.type === 'audio' && message.metadata?.attachments?.[0] ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 bg-black/10 rounded-lg">
                        <Mic className="w-4 h-4" />
                        <span className="text-sm">Mensaje de voz</span>
                      </div>
                      {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                    </div>
                  ) : message.type === 'location' && message.metadata?.location ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 bg-black/10 rounded-lg">
                        <MapPin className="w-4 h-4" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Ubicación compartida</p>
                          {message.metadata.location.address && (
                            <p className="text-xs opacity-70">{message.metadata.location.address}</p>
                          )}
                        </div>
                      </div>
                      {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>

                {/* Message footer with timestamp and status */}
                <div className={`flex items-center justify-between mt-2 text-xs ${
                  message.senderType === 'agent' || message.senderType === 'bot'
                    ? 'text-white/70'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(message.timestamp).toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</span>
                    {message.isEdited && (
                      <span className="text-xs opacity-70">(editado)</span>
                    )}
                  </div>
                  
                  {/* Message status for agent messages */}
                  {message.senderType === 'agent' && (
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(message.status)}
                      <span className="text-xs capitalize">
                        {message.status === 'sending' ? 'Enviando' :
                         message.status === 'sent' ? 'Enviado' :
                         message.status === 'delivered' ? 'Entregado' :
                         message.status === 'read' ? 'Leído' :
                         message.status === 'failed' ? 'Error' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {(isTyping || typingUsers.length > 0) && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {typingUsers.length > 0 
                    ? `${typingUsers.join(', ')} está${typingUsers.length > 1 ? 'n' : ''} escribiendo...`
                    : 'Escribiendo...'
                  }
                </span>
              </div>
            </div>
          </div>
        )}
        
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