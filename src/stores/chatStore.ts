import { create } from 'zustand';
import { initialChats } from '../data/mockData';
import type { 
  Chat, 
  ChatFilters, 
  Message, 
  Conversation, 
  ConversationFilters,
  TypingIndicator,
  MessageStatus,
  User
} from '../types/chat';

interface ChatState {
  // State
  chats: Chat[];
  conversations: Conversation[];
  selectedChat: Chat | null;
  selectedConversation: Conversation | null;
  currentUser: string;
  filters: ChatFilters;
  conversationFilters: ConversationFilters;
  
  // Real-time state
  typingIndicators: TypingIndicator[];
  onlineUsers: User[];
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  
  // Actions
  setSelectedChat: (chat: Chat | null) => void;
  setSelectedConversation: (conversation: Conversation | null) => void;
  setCurrentUser: (user: string) => void;
  setFilters: (filters: Partial<ChatFilters>) => void;
  setConversationFilters: (filters: Partial<ConversationFilters>) => void;
  setConnectionStatus: (status: 'connected' | 'connecting' | 'disconnected') => void;
  
  // Chat operations
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  markAsRead: (chatId: string) => void;
  assignSalesperson: (chatId: string, salesperson: string) => void;
  
  // Conversation operations
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  removeConversation: (conversationId: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  
  // Message operations
  addMessage: (chatId: string, message: Omit<Message, 'id'>) => void;
  addMessageToConversation: (conversationId: string, message: Message) => void;
  updateMessageStatus: (chatId: string, messageId: string, status: boolean) => void;
  updateMessageStatusInConversation: (conversationId: string, messageId: string, status: MessageStatus) => void;
  
  // Real-time operations
  addTypingIndicator: (indicator: TypingIndicator) => void;
  removeTypingIndicator: (userId: string, conversationId: string) => void;
  updateUserOnlineStatus: (user: User) => void;
  removeUserFromOnline: (userId: string) => void;
  
  // Utility functions
  getFilteredChats: () => Chat[];
  getFilteredConversations: () => Conversation[];
  getChatMessages: (chatId: string) => Message[];
  getConversationMessages: (conversationId: string) => Message[];
  getTypingUsersForConversation: (conversationId: string) => TypingIndicator[];
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  chats: initialChats,
  conversations: [],
  selectedChat: null,
  selectedConversation: null,
  currentUser: "Admin Usuario",
  filters: {
    searchTerm: '',
    assignedTo: undefined,
    status: 'all'
  },
  conversationFilters: {},
  
  // Real-time state
  typingIndicators: [],
  onlineUsers: [],
  connectionStatus: 'disconnected',

  // Basic setters
  setSelectedChat: (chat) => set({ selectedChat: chat }),
  setSelectedConversation: (conversation) => set({ selectedConversation: conversation }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setFilters: (newFilters) => set(state => ({ 
    filters: { ...state.filters, ...newFilters } 
  })),
  setConversationFilters: (newFilters) => set(state => ({ 
    conversationFilters: { ...state.conversationFilters, ...newFilters } 
  })),
  setConnectionStatus: (status) => set({ connectionStatus: status }),

  // Chat operations
  updateChat: (chatId, updates) => set(state => {
    const updatedChats = state.chats.map(chat => 
      chat.id === chatId ? { ...chat, ...updates } : chat
    );
    
    const updatedSelectedChat = state.selectedChat?.id === chatId 
      ? { ...state.selectedChat, ...updates } 
      : state.selectedChat;

    return {
      chats: updatedChats,
      selectedChat: updatedSelectedChat
    };
  }),

  markAsRead: (chatId) => set(state => ({
    chats: state.chats.map(chat => 
      chat.id === chatId ? { ...chat, unread: 0 } : chat
    )
  })),

  assignSalesperson: (chatId, salesperson) => {
    get().updateChat(chatId, { assignedTo: salesperson });
  },

  // Conversation operations
  addConversation: (conversation) => set(state => ({
    conversations: [...state.conversations, conversation]
  })),

  updateConversation: (conversationId, updates) => set(state => {
    const updatedConversations = state.conversations.map(conv => 
      conv.id === conversationId ? { ...conv, ...updates } : conv
    );
    
    const updatedSelectedConversation = state.selectedConversation?.id === conversationId 
      ? { ...state.selectedConversation, ...updates } 
      : state.selectedConversation;

    return {
      conversations: updatedConversations,
      selectedConversation: updatedSelectedConversation
    };
  }),

  removeConversation: (conversationId) => set(state => ({
    conversations: state.conversations.filter(conv => conv.id !== conversationId),
    selectedConversation: state.selectedConversation?.id === conversationId 
      ? null 
      : state.selectedConversation
  })),

  markConversationAsRead: (conversationId) => set(state => ({
    conversations: state.conversations.map(conv => 
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    )
  })),

  // Message operations
  addMessage: (chatId, messageData) => set(state => {
    const newMessage: Message = {
      id: Date.now().toString(),
      ...messageData
    };

    const updatedChats = state.chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: newMessage.content,
          timestamp: newMessage.createdAt
        };
      }
      return chat;
    });

    const updatedSelectedChat = state.selectedChat?.id === chatId
      ? {
          ...state.selectedChat,
          messages: [...state.selectedChat.messages, newMessage],
          lastMessage: newMessage.content,
          timestamp: newMessage.createdAt
        }
      : state.selectedChat;

    return {
      chats: updatedChats,
      selectedChat: updatedSelectedChat
    };
  }),

  addMessageToConversation: (conversationId, message) => set(state => {
    const updatedConversations = state.conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: message,
          updatedAt: message.timestamp,
          unreadCount: message.senderType !== 'agent' ? conv.unreadCount + 1 : conv.unreadCount
        };
      }
      return conv;
    });

    return { conversations: updatedConversations };
  }),

  updateMessageStatus: (chatId, messageId, status) => set(state => {
    const updatedChats = state.chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: chat.messages.map(msg => 
            msg.id === messageId ? { ...msg, isRead: status } : msg
          )
        };
      }
      return chat;
    });

    const updatedSelectedChat = state.selectedChat?.id === chatId
      ? {
          ...state.selectedChat,
          messages: state.selectedChat.messages.map(msg => 
            msg.id === messageId ? { ...msg, isRead: status } : msg
          )
        }
      : state.selectedChat;

    return {
      chats: updatedChats,
      selectedChat: updatedSelectedChat
    };
  }),

  updateMessageStatusInConversation: (conversationId, messageId, status) => set(state => {
    // This would typically update messages in a separate messages store or API
    // For now, we'll just update the conversation's lastMessage if it matches
    const updatedConversations = state.conversations.map(conv => {
      if (conv.id === conversationId && conv.lastMessage?.id === messageId) {
        return {
          ...conv,
          lastMessage: { ...conv.lastMessage, status }
        };
      }
      return conv;
    });

    return { conversations: updatedConversations };
  }),

  // Real-time operations
  addTypingIndicator: (indicator) => set(state => {
    const filtered = state.typingIndicators.filter(
      t => t.userId !== indicator.userId || t.conversationId !== indicator.conversationId
    );
    return {
      typingIndicators: [...filtered, indicator]
    };
  }),

  removeTypingIndicator: (userId, conversationId) => set(state => ({
    typingIndicators: state.typingIndicators.filter(
      t => t.userId !== userId || t.conversationId !== conversationId
    )
  })),

  updateUserOnlineStatus: (user) => set(state => {
    const filtered = state.onlineUsers.filter(u => u.id !== user.id);
    return {
      onlineUsers: [...filtered, user]
    };
  }),

  removeUserFromOnline: (userId) => set(state => ({
    onlineUsers: state.onlineUsers.filter(u => u.id !== userId)
  })),

  // Utility functions
  getFilteredChats: () => {
    const { chats, filters } = get();
    return chats.filter(chat => {
      const matchesSearch = filters.searchTerm === '' || 
        chat.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        chat.phone.includes(filters.searchTerm) ||
        chat.email?.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesAssignee = !filters.assignedTo || 
        chat.assignedTo === filters.assignedTo;
      
      const matchesStatus = filters.status === 'all' || 
        chat.status === filters.status;

      return matchesSearch && matchesAssignee && matchesStatus;
    });
  },

  getFilteredConversations: () => {
    const { conversations, conversationFilters } = get();
    return conversations.filter(conv => {
      const matchesSearch = !conversationFilters.search || 
        conv.contact.name.toLowerCase().includes(conversationFilters.search.toLowerCase()) ||
        conv.contact.phone?.includes(conversationFilters.search) ||
        conv.contact.email?.toLowerCase().includes(conversationFilters.search.toLowerCase());
      
      const matchesChannel = !conversationFilters.channel || 
        conv.channel === conversationFilters.channel;
      
      const matchesStatus = !conversationFilters.status || 
        conv.status === conversationFilters.status;
      
      const matchesAssignee = !conversationFilters.assignedTo || 
        conv.assignedAgent?.name === conversationFilters.assignedTo;
      
      const matchesDepartment = !conversationFilters.department || 
        conv.department === conversationFilters.department;
      
      const matchesPriority = !conversationFilters.priority || 
        conv.priority === conversationFilters.priority;
      
      const matchesUnread = conversationFilters.hasUnread === undefined || 
        (conversationFilters.hasUnread ? conv.unreadCount > 0 : conv.unreadCount === 0);

      return matchesSearch && matchesChannel && matchesStatus && 
             matchesAssignee && matchesDepartment && matchesPriority && matchesUnread;
    });
  },

  getChatMessages: (chatId) => {
    const chat = get().chats.find(c => c.id === chatId);
    return chat?.messages || [];
  },

  getConversationMessages: (conversationId) => {
    // In a real implementation, this would fetch messages from an API or separate store
    // For now, return empty array as messages are handled separately
    return [];
  },

  getTypingUsersForConversation: (conversationId) => {
    const { typingIndicators } = get();
    return typingIndicators.filter(t => t.conversationId === conversationId && t.isTyping);
  }
}));