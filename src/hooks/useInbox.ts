import { useSocket } from '@/contexts/SocketIOContext';
import { useAuth } from '@/hooks/useAuth';
import { inboxService } from '@/lib/api/services/inbox';
import {
    Conversation,
    ConversationFilters,
    ConversationListResponse,
    ConversationSort,
    Message,
    MessageListResponse,
    SendMessageRequest,
    TypingIndicator
} from '@/types/inbox';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface UseInboxResult {
  // Data
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  typingUsers: TypingIndicator[];
  
  // UI State
  isLoading: boolean;
  isLoadingMessages: boolean;
  isLoadingMore: boolean;
  hasMoreMessages: boolean;
  error: string | null;
  
  // Filters and Search
  filters: ConversationFilters;
  sort: ConversationSort;
  searchTerm: string;
  
  // Actions
  selectConversation: (conversationId: string) => void;
  sendMessage: (request: SendMessageRequest) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  updateFilters: (filters: Partial<ConversationFilters>) => void;
  updateSort: (sort: ConversationSort) => void;
  setSearchTerm: (term: string) => void;
  markAsRead: (conversationId: string) => Promise<void>;
  assignConversation: (conversationId: string, agentId: string) => Promise<void>;
  closeConversation: (conversationId: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  
  // Real-time actions
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
}

const INITIAL_FILTERS: ConversationFilters = {
  status: 'active',
  hasUnread: false
};

const INITIAL_SORT: ConversationSort = {
  field: 'lastMessage',
  direction: 'desc'
};

const MESSAGES_PER_PAGE = 50;
const CONVERSATIONS_PER_PAGE = 50;

export const useInbox = (): UseInboxResult => {
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ConversationFilters>(INITIAL_FILTERS);
  const [sort, setSort] = useState<ConversationSort>(INITIAL_SORT);
  const [searchTerm, setSearchTerm] = useState('');
  const [messagesPage, setMessagesPage] = useState(1);

  // Hooks
  const { user } = useAuth();
  const { isConnected, emit, on, off } = useSocket();

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    let filtered = [...conversations];

    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(conv => 
        conv.contact.name.toLowerCase().includes(term) ||
        conv.contact.phone?.includes(term) ||
        conv.contact.email?.toLowerCase().includes(term) ||
        conv.lastMessage?.content.toLowerCase().includes(term)
      );
    }

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(conv => conv.status === filters.status);
    }

    if (filters.channel && filters.channel !== 'all') {
      filtered = filtered.filter(conv => conv.channel === filters.channel);
    }

    if (filters.assignedTo) {
      if (filters.assignedTo === 'unassigned') {
        filtered = filtered.filter(conv => !conv.assignedAgentId);
      } else if (filters.assignedTo !== 'all') {
        filtered = filtered.filter(conv => conv.assignedAgentId === filters.assignedTo);
      }
    }

    if (filters.department && filters.department !== 'all') {
      filtered = filtered.filter(conv => conv.department === filters.department);
    }

    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(conv => conv.priority === filters.priority);
    }

    if (filters.hasUnread) {
      filtered = filtered.filter(conv => conv.unreadCount > 0);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(conv => 
        filters.tags!.some(tag => conv.tags.includes(tag))
      );
    }

    if (filters.dateRange) {
      const { from, to } = filters.dateRange;
      filtered = filtered.filter(conv => {
        const date = new Date(conv.updatedAt);
        return date >= from && date <= to;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sort.field) {
        case 'lastMessage':
          comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          break;
        case 'createdAt':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case 'unreadCount':
          comparison = b.unreadCount - a.unreadCount;
          break;
      }

      return sort.direction === 'desc' ? comparison : -comparison;
    });

    return filtered;
  }, [conversations, searchTerm, filters, sort]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const response: ConversationListResponse = await inboxService.getConversations({
        filters,
        sort,
        page: 1,
        limit: CONVERSATIONS_PER_PAGE
      });

      setConversations(response.conversations);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Error al cargar las conversaciones');
    } finally {
      setIsLoading(false);
    }
  }, [user, filters, sort]);

  // Load messages for selected conversation
  const loadMessages = useCallback(async (conversationId: string, page = 1) => {
    try {
      if (page === 1) {
        setIsLoadingMessages(true);
        setMessages([]);
      } else {
        setIsLoadingMore(true);
      }

      const response: MessageListResponse = await inboxService.getMessages(conversationId, {
        page,
        limit: MESSAGES_PER_PAGE
      });

      if (page === 1) {
        setMessages(response.messages);
      } else {
        setMessages(prev => [...response.messages, ...prev]);
      }

      setHasMoreMessages(response.hasMore);
      setMessagesPage(page);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Error al cargar los mensajes');
    } finally {
      setIsLoadingMessages(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Actions
  const selectConversation = useCallback(async (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;

    setSelectedConversation(conversation);
    await loadMessages(conversationId);
    
    // Mark as read if has unread messages
    if (conversation.unreadCount > 0) {
      await markAsRead(conversationId);
    }
  }, [conversations, loadMessages]);

  const sendMessage = useCallback(async (request: SendMessageRequest) => {
    try {
      await inboxService.sendMessage(request);
      
      // Emit typing stop event
      if (isConnected) {
        emit('typing_stop', {
          conversationId: request.conversationId,
          userId: user?.id,
          userName: user?.name
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Error al enviar el mensaje');
      throw err;
    }
  }, [isConnected, emit, user]);

  const loadMoreMessages = useCallback(async () => {
    if (!selectedConversation || isLoadingMore || !hasMoreMessages) return;
    await loadMessages(selectedConversation.id, messagesPage + 1);
  }, [selectedConversation, isLoadingMore, hasMoreMessages, loadMessages, messagesPage]);

  const updateFilters = useCallback((newFilters: Partial<ConversationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const updateSort = useCallback((newSort: ConversationSort) => {
    setSort(newSort);
  }, []);

  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await inboxService.markAsRead(conversationId);
      
      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );

      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(prev => 
          prev ? { ...prev, unreadCount: 0 } : null
        );
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, [selectedConversation]);

  const assignConversation = useCallback(async (conversationId: string, agentId: string) => {
    try {
      await inboxService.assignConversation(conversationId, agentId);
      await loadConversations(); // Refresh to get updated data
    } catch (err) {
      console.error('Error assigning conversation:', err);
      setError('Error al asignar la conversación');
    }
  }, [loadConversations]);

  const closeConversation = useCallback(async (conversationId: string) => {
    try {
      await inboxService.closeConversation(conversationId);
      await loadConversations(); // Refresh to get updated data
    } catch (err) {
      console.error('Error closing conversation:', err);
      setError('Error al cerrar la conversación');
    }
  }, [loadConversations]);

  const refreshConversations = useCallback(async () => {
    await loadConversations();
  }, [loadConversations]);

  const startTyping = useCallback((conversationId: string) => {
    if (isConnected && user) {
      emit('typing_start', {
        conversationId,
        userId: user.id,
        userName: user.name
      });
    }
  }, [isConnected, emit, user]);

  const stopTyping = useCallback((conversationId: string) => {
    if (isConnected && user) {
      emit('typing_stop', {
        conversationId,
        userId: user.id,
        userName: user.name
      });
    }
  }, [isConnected, emit, user]);

  // WebSocket event handlers
  useEffect(() => {
    if (!isConnected) return;

    const handleNewMessage = (data: any) => {
      const { message, conversationId } = data;
      
      // Add message to current conversation if selected
      if (selectedConversation?.id === conversationId) {
        setMessages(prev => [...prev, message]);
      }

      // Update conversation in list
      setConversations(prev => 
        prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: message,
              updatedAt: message.createdAt,
              unreadCount: conv.id === selectedConversation?.id ? 0 : conv.unreadCount + 1
            };
          }
          return conv;
        })
      );
    };

    const handleTypingStart = (data: TypingIndicator) => {
      if (data.userId !== user?.id) {
        setTypingUsers(prev => {
          const exists = prev.find(t => t.userId === data.userId && t.conversationId === data.conversationId);
          if (exists) return prev;
          return [...prev, data];
        });
      }
    };

    const handleTypingStop = (data: TypingIndicator) => {
      setTypingUsers(prev => 
        prev.filter(t => !(t.userId === data.userId && t.conversationId === data.conversationId))
      );
    };

    const handleMessageRead = (data: any) => {
      const { conversationId, messageId } = data;
      
      if (selectedConversation?.id === conversationId) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, status: 'read' }
              : msg
          )
        );
      }
    };

    const handleConversationAssigned = (data: any) => {
      const { conversationId } = data;
      // Refresh conversations to get updated assignment
      loadConversations();
    };

    // Register event listeners
    on('message_received', handleNewMessage);
    on('typing_start', handleTypingStart);
    on('typing_stop', handleTypingStop);
    on('message_read', handleMessageRead);
    on('conversation_assigned', handleConversationAssigned);

    return () => {
      off('message_received', handleNewMessage);
      off('typing_start', handleTypingStart);
      off('typing_stop', handleTypingStop);
      off('message_read', handleMessageRead);
      off('conversation_assigned', handleConversationAssigned);
    };
  }, [isConnected, selectedConversation, user, on, off, loadConversations]);

  // Load conversations on mount and when filters/sort change
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Clear typing indicators after timeout
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => 
        prev.filter(t => now - new Date(t.timestamp).getTime() < 10000) // 10 seconds timeout
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return {
    // Data
    conversations: filteredConversations,
    selectedConversation,
    messages,
    typingUsers,
    
    // UI State
    isLoading,
    isLoadingMessages,
    isLoadingMore,
    hasMoreMessages,
    error,
    
    // Filters and Search
    filters,
    sort,
    searchTerm,
    
    // Actions
    selectConversation,
    sendMessage,
    loadMoreMessages,
    updateFilters,
    updateSort,
    setSearchTerm,
    markAsRead,
    assignConversation,
    closeConversation,
    refreshConversations,
    
    // Real-time actions
    startTyping,
    stopTyping
  };
};