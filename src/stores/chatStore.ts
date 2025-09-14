import { create } from 'zustand';
import { initialChats } from '../data/mockData';
import type { Chat, ChatFilters, Message } from '../types/chat';

interface ChatState {
  // State
  chats: Chat[];
  selectedChat: Chat | null;
  currentUser: string;
  filters: ChatFilters;
  
  // Actions
  setSelectedChat: (chat: Chat | null) => void;
  setCurrentUser: (user: string) => void;
  setFilters: (filters: Partial<ChatFilters>) => void;
  
  // Chat operations
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  markAsRead: (chatId: string) => void;
  assignSalesperson: (chatId: string, salesperson: string) => void;
  
  // Message operations
  addMessage: (chatId: string, message: Omit<Message, 'id'>) => void;
  updateMessageStatus: (chatId: string, messageId: string, status: boolean) => void;
  
  // Utility functions
  getFilteredChats: () => Chat[];
  getChatMessages: (chatId: string) => Message[];
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  chats: initialChats,
  selectedChat: null,
  currentUser: "Admin Usuario",
  filters: {
    searchTerm: '',
    assignedTo: undefined,
    status: 'all'
  },

  // Basic setters
  setSelectedChat: (chat) => set({ selectedChat: chat }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setFilters: (newFilters) => set(state => ({ 
    filters: { ...state.filters, ...newFilters } 
  })),

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

  getChatMessages: (chatId) => {
    const chat = get().chats.find(c => c.id === chatId);
    return chat?.messages || [];
  }
}));