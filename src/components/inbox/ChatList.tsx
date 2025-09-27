'use client';

import {
    Archive,
    CheckCircle,
    Clock,
    Filter,
    MessageSquare,
    Search,
    Send,
    Tag,
    User,
    X
} from 'lucide-react';
import React, { useState } from 'react';

// Types refactorizados - SIN Chat legacy
import type { ProviderType } from '@/types/connections';
import type {
    Conversation,
    ConversationFilters,
    ConversationPriority,
    ConversationStatus
} from '@/types/inbox';

// Props refactorizadas
interface ChatListProps {
  conversations: Conversation[];
  selectedConversation?: Conversation | null;
  searchTerm: string;
  filters?: ConversationFilters;
  isLoading?: boolean;
  onSelectConversation: (conversation: Conversation) => void;
  onSearchChange: (term: string) => void;
  onFiltersChange?: (filters: ConversationFilters) => void;
}

// Helper functions - actualizadas para Conversation
const getChannelIcon = (channel: ProviderType) => {
  switch (channel) {
    case 'whatsapp':
    case 'whatsapp_api':
      return <MessageSquare className="w-4 h-4 text-green-500" />;
    case 'instagram':
      return <MessageSquare className="w-4 h-4 text-pink-500" />;
    case 'facebook':
      return <MessageSquare className="w-4 h-4 text-blue-500" />;
    case 'telegram':
      return <Send className="w-4 h-4 text-blue-400" />;
    default:
      return <MessageSquare className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusIcon = (status: ConversationStatus) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'closed':
      return <X className="w-4 h-4 text-gray-500" />;
    case 'archived':
      return <Archive className="w-4 h-4 text-gray-400" />;
    default:
      return null;
  }
};

const getPriorityColor = (priority: ConversationPriority) => {
  switch (priority) {
    case 'urgent':
      return 'text-red-500 bg-red-50 dark:bg-red-900/20';
    case 'high':
      return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
    case 'low':
      return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    default:
      return 'text-gray-500 bg-gray-50 dark:bg-gray-800';
  }
};

// Función para generar avatar con iniciales
const getContactInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

// Función para formatear timestamp
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else {
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  }
};

export const ChatList: React.FC<ChatListProps> = ({
  conversations,
  selectedConversation,
  searchTerm,
  filters = {},
  isLoading = false,
  onSelectConversation,
  onSearchChange,
  onFiltersChange
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ConversationFilters>(filters);

  const handleFilterChange = (key: keyof ConversationFilters, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: ConversationFilters = {};
    setActiveFilters(emptyFilters);
    onFiltersChange?.(emptyFilters);
  };

  const hasActiveFilters = Object.keys(activeFilters).some(
    key => activeFilters[key as keyof ConversationFilters] !== undefined
  );

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Conversaciones
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Filtros"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar conversaciones..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-green-500 dark:focus:border-green-400"
          />
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
            {/* Channel Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Canal
              </label>
              <select
                value={activeFilters.channel || 'all'}
                onChange={(e) => handleFilterChange('channel', e.target.value === 'all' ? undefined : e.target.value)}
                className="w-full text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-2 py-1"
              >
                <option value="all">Todos los canales</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="whatsapp_api">WhatsApp Business</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="telegram">Telegram</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <select
                value={activeFilters.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value === 'all' ? undefined : e.target.value)}
                className="w-full text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-2 py-1"
              >
                <option value="all">Todos</option>
                <option value="active">Activas</option>
                <option value="pending">Pendientes</option>
                <option value="closed">Cerradas</option>
                <option value="archived">Archivadas</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prioridad
              </label>
              <select
                value={activeFilters.priority || 'all'}
                onChange={(e) => handleFilterChange('priority', e.target.value === 'all' ? undefined : e.target.value)}
                className="w-full text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-2 py-1"
              >
                <option value="all">Todas</option>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="normal">Normal</option>
                <option value="low">Baja</option>
              </select>
            </div>

            {/* Unread Filter */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="unread-filter"
                checked={activeFilters.hasUnread || false}
                onChange={(e) => handleFilterChange('hasUnread', e.target.checked || undefined)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="unread-filter" className="text-sm text-gray-700 dark:text-gray-300">
                Solo no leídas
              </label>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-center">
              {searchTerm || hasActiveFilters
                ? 'No se encontraron conversaciones'
                : 'No hay conversaciones'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {conversations.map((conversation) => {
              const isSelected = selectedConversation?.id === conversation.id;
              const contact = conversation.contact;
              const lastMessage = conversation.lastMessage;
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    isSelected ? 'bg-green-50 dark:bg-green-900/20 border-r-2 border-green-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {contact.avatar ? (
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {getContactInitials(contact.name)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center space-x-2 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {contact.name}
                          </h3>
                          {getChannelIcon(conversation.channel)}
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                          {getStatusIcon(conversation.status)}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {lastMessage 
                              ? formatTimestamp(lastMessage.timestamp)
                              : formatTimestamp(conversation.updatedAt)
                            }
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {lastMessage?.content || 'Sin mensajes'}
                        </p>
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                          {/* Priority indicator */}
                          {conversation.priority !== 'normal' && (
                            <span className={`w-2 h-2 rounded-full ${getPriorityColor(conversation.priority)}`}></span>
                          )}
                          
                          {/* Unread count */}
                          {conversation.unreadCount > 0 && (
                            <span className="bg-green-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                            </span>
                          )}

                          {/* Assigned agent indicator */}
                          {conversation.assignedAgent && (
                            <User className="w-3 h-3 text-blue-500" />
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      {conversation.tags.length > 0 && (
                        <div className="flex items-center space-x-1 mt-2">
                          {conversation.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded"
                            >
                              <Tag className="w-2 h-2 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {conversation.tags.length > 2 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{conversation.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer with count */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {conversations.length} conversación{conversations.length !== 1 ? 'es' : ''}
          {hasActiveFilters && ' (filtradas)'}
        </p>
      </div>
    </div>
  );
};