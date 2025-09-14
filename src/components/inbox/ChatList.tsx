'use client';

import type { Chat, Conversation, ConversationFilters, ConversationStatus, ConversationPriority } from '@/types/chat';
import type { ProviderType } from '@/types/connections';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Send, 
  X,
  ChevronDown,
  Clock,
  CheckCircle,
  Archive,
  User,
  Tag
} from 'lucide-react';
import React, { useState } from 'react';

interface ChatListProps {
  chats: Chat[];
  conversations?: Conversation[];
  selectedChat: Chat | null;
  selectedConversation?: Conversation | null;
  searchTerm: string;
  filters?: ConversationFilters;
  onSelectChat: (chat: Chat) => void;
  onSelectConversation?: (conversation: Conversation) => void;
  onSearchChange: (term: string) => void;
  onFiltersChange?: (filters: ConversationFilters) => void;
}

// Helper functions
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

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  conversations = [],
  selectedChat,
  selectedConversation,
  searchTerm,
  filters = {},
  onSelectChat,
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

  const hasActiveFilters = Object.values(activeFilters).some(value => 
    value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true)
  );

  // Use conversations if available, otherwise fall back to chats
  const displayItems = conversations.length > 0 ? conversations : chats;
  const isUsingConversations = conversations.length > 0;

  return (
    <div className="w-1/4 bg-white dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600 flex flex-col">
      {/* Search and Filter Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-600 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-green-500 dark:focus:border-green-400"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors ${
              hasActiveFilters 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && isUsingConversations && (
          <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {/* Channel Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Canal
              </label>
              <select
                value={activeFilters.channel || ''}
                onChange={(e) => handleFilterChange('channel', e.target.value || undefined)}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:outline-none focus:border-green-500"
              >
                <option value="">Todos los canales</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="whatsapp_api">WhatsApp API</option>
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
                value={activeFilters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:outline-none focus:border-green-500"
              >
                <option value="">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="pending">Pendiente</option>
                <option value="closed">Cerrado</option>
                <option value="archived">Archivado</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prioridad
              </label>
              <select
                value={activeFilters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:outline-none focus:border-green-500"
              >
                <option value="">Todas las prioridades</option>
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
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="unread-filter" className="text-xs text-gray-700 dark:text-gray-300">
                Solo no leídos
              </label>
            </div>
          </div>
        )}
      </div>
      
      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {displayItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay conversaciones</p>
          </div>
        ) : (
          displayItems.map((item) => {
            const isConversation = 'contact' in item;
            const conversation = isConversation ? item as Conversation : null;
            const chat = isConversation ? null : item as Chat;
            
            const isSelected = isConversation 
              ? selectedConversation?.id === conversation?.id
              : selectedChat?.id === chat?.id;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isConversation && conversation && onSelectConversation) {
                    onSelectConversation(conversation);
                  } else if (chat) {
                    onSelectChat(chat);
                  }
                }}
                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  isSelected ? 'bg-gray-100 dark:bg-gray-700 border-l-4 border-l-green-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Header with name and timestamp */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {isConversation ? conversation?.contact.name : chat?.name}
                        </h3>
                        
                        {/* Channel indicator for conversations */}
                        {isConversation && conversation && (
                          <div className="flex-shrink-0">
                            {getChannelIcon(conversation.channel)}
                          </div>
                        )}
                      </div>
                      
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                        {isConversation 
                          ? new Date(conversation?.updatedAt || '').toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })
                          : chat?.timestamp
                        }
                      </span>
                    </div>

                    {/* Last message */}
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate mb-2">
                      {isConversation 
                        ? conversation?.lastMessage?.content || 'Sin mensajes'
                        : chat?.lastMessage
                      }
                    </p>

                    {/* Footer with contact info and indicators */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          {isConversation 
                            ? conversation?.contact.phone || conversation?.contact.email
                            : chat?.phone
                          }
                        </span>
                        
                        {/* Status indicator for conversations */}
                        {isConversation && conversation && (
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(conversation.status)}
                            <span className="capitalize">{conversation.status}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Priority indicator */}
                        {isConversation && conversation && conversation.priority !== 'normal' && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(conversation.priority)}`}>
                            {conversation.priority === 'urgent' ? 'Urgente' : 
                             conversation.priority === 'high' ? 'Alta' : 'Baja'}
                          </span>
                        )}

                        {/* Tags indicator */}
                        {isConversation && conversation && conversation.tags.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Tag className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{conversation.tags.length}</span>
                          </div>
                        )}

                        {/* Assignment indicator */}
                        {isConversation && conversation && conversation.assignedAgent && (
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3 text-blue-500" />
                          </div>
                        )}

                        {/* Online status for legacy chats */}
                        {!isConversation && chat && (
                          <div className={`w-2 h-2 rounded-full ${chat.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        )}

                        {/* Unread count */}
                        {((isConversation && conversation && conversation.unreadCount > 0) || 
                          (!isConversation && chat && chat.unread > 0)) && (
                          <span className="bg-green-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center px-1">
                            {isConversation ? conversation?.unreadCount : chat?.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};