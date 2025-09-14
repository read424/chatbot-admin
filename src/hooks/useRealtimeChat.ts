'use client';

import { useSocket } from '@/contexts/SocketIOContext';
import type { 
  Message, 
  Conversation, 
  TypingIndicator, 
  ChatEvent,
  MessageStatus,
  User
} from '@/types/chat';
import { useCallback, useEffect, useState } from 'react';

export interface RealtimeChatOptions {
  conversationId?: string;
  userId?: string;
  onMessageReceived?: (message: Message) => void;
  onMessageStatusUpdate?: (messageId: string, status: MessageStatus) => void;
  onTypingUpdate?: (typing: TypingIndicator) => void;
  onUserStatusUpdate?: (userId: string, status: 'online' | 'away' | 'busy' | 'offline') => void;
  onConversationUpdate?: (conversation: Partial<Conversation>) => void;
}

export interface UseRealtimeChatReturn {
  // Connection status
  isConnected: boolean;
  
  // Message operations
  sendMessage: (content: string, type?: string, metadata?: any) => void;
  updateMessageStatus: (messageId: string, status: MessageStatus) => void;
  
  // Typing indicators
  startTyping: () => void;
  stopTyping: () => void;
  typingUsers: TypingIndicator[];
  
  // User status
  updateUserStatus: (status: 'online' | 'away' | 'busy' | 'offline') => void;
  onlineUsers: User[];
  
  // Conversation management
  joinConversation: (conversationId: string) => void;
  leaveConversation: () => void;
  
  // Message delivery confirmations
  markAsRead: (messageIds: string[]) => void;
  markAsDelivered: (messageIds: string[]) => void;
}

export const useRealtimeChat = (options: RealtimeChatOptions = {}): UseRealtimeChatReturn => {
  const { socket, isConnected, emit, on, off } = useSocket();
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(options.conversationId);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Join conversation on mount or when conversationId changes
  useEffect(() => {
    if (options.conversationId && isConnected) {
      joinConversation(options.conversationId);
    }
    
    return () => {
      if (currentConversationId) {
        leaveConversation();
      }
    };
  }, [options.conversationId, isConnected]);

  // Set up event listeners
  useEffect(() => {
    if (!isConnected) return;

    // Message events
    const handleNewMessage = (message: Message) => {
      console.log('📨 New message received:', message);
      options.onMessageReceived?.(message);
    };

    const handleMessageStatusUpdate = (data: { messageId: string; status: MessageStatus }) => {
      console.log('📋 Message status update:', data);
      options.onMessageStatusUpdate?.(data.messageId, data.status);
    };

    // Typing events
    const handleTypingStart = (typing: TypingIndicator) => {
      console.log('⌨️ User started typing:', typing);
      setTypingUsers(prev => {
        const filtered = prev.filter(t => t.userId !== typing.userId || t.conversationId !== typing.conversationId);
        return [...filtered, { ...typing, isTyping: true }];
      });
      options.onTypingUpdate?.(typing);
    };

    const handleTypingStop = (typing: TypingIndicator) => {
      console.log('⌨️ User stopped typing:', typing);
      setTypingUsers(prev => prev.filter(t => t.userId !== typing.userId || t.conversationId !== typing.conversationId));
      options.onTypingUpdate?.({ ...typing, isTyping: false });
    };

    // User status events
    const handleUserStatusUpdate = (data: { userId: string; status: 'online' | 'away' | 'busy' | 'offline'; user?: User }) => {
      console.log('👤 User status update:', data);
      setOnlineUsers(prev => {
        const filtered = prev.filter(u => u.id !== data.userId);
        if (data.user && data.status !== 'offline') {
          return [...filtered, { ...data.user, status: data.status }];
        }
        return filtered;
      });
      options.onUserStatusUpdate?.(data.userId, data.status);
    };

    // Conversation events
    const handleConversationUpdate = (conversation: Partial<Conversation>) => {
      console.log('💬 Conversation update:', conversation);
      options.onConversationUpdate?.(conversation);
    };

    // Register event listeners
    on('message:new', handleNewMessage);
    on('message:status', handleMessageStatusUpdate);
    on('typing:start', handleTypingStart);
    on('typing:stop', handleTypingStop);
    on('user:status', handleUserStatusUpdate);
    on('conversation:update', handleConversationUpdate);

    // Cleanup listeners
    return () => {
      off('message:new', handleNewMessage);
      off('message:status', handleMessageStatusUpdate);
      off('typing:start', handleTypingStart);
      off('typing:stop', handleTypingStop);
      off('user:status', handleUserStatusUpdate);
      off('conversation:update', handleConversationUpdate);
    };
  }, [isConnected, options, on, off]);

  // Message operations
  const sendMessage = useCallback((content: string, type: string = 'text', metadata?: any) => {
    if (!isConnected || !currentConversationId) {
      console.warn('Cannot send message - not connected or no conversation');
      return;
    }

    const messageData = {
      conversationId: currentConversationId,
      content,
      type,
      metadata,
      timestamp: new Date().toISOString()
    };

    console.log('📤 Sending message:', messageData);
    emit('message:send', messageData);
  }, [isConnected, currentConversationId, emit]);

  const updateMessageStatus = useCallback((messageId: string, status: MessageStatus) => {
    if (!isConnected) return;

    console.log('📋 Updating message status:', { messageId, status });
    emit('message:status:update', { messageId, status });
  }, [isConnected, emit]);

  // Typing indicators
  const startTyping = useCallback(() => {
    if (!isConnected || !currentConversationId || !options.userId) return;

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const typingData = {
      conversationId: currentConversationId,
      userId: options.userId,
      isTyping: true,
      timestamp: new Date().toISOString()
    };

    console.log('⌨️ Starting typing indicator:', typingData);
    emit('typing:start', typingData);

    // Auto-stop typing after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      stopTyping();
    }, 3000);
    
    setTypingTimeout(timeout);
  }, [isConnected, currentConversationId, options.userId, emit, typingTimeout]);

  const stopTyping = useCallback(() => {
    if (!isConnected || !currentConversationId || !options.userId) return;

    // Clear timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }

    const typingData = {
      conversationId: currentConversationId,
      userId: options.userId,
      isTyping: false,
      timestamp: new Date().toISOString()
    };

    console.log('⌨️ Stopping typing indicator:', typingData);
    emit('typing:stop', typingData);
  }, [isConnected, currentConversationId, options.userId, emit, typingTimeout]);

  // User status
  const updateUserStatus = useCallback((status: 'online' | 'away' | 'busy' | 'offline') => {
    if (!isConnected || !options.userId) return;

    console.log('👤 Updating user status:', { userId: options.userId, status });
    emit('user:status:update', { userId: options.userId, status });
  }, [isConnected, options.userId, emit]);

  // Conversation management
  const joinConversation = useCallback((conversationId: string) => {
    if (!isConnected) return;

    console.log('🚪 Joining conversation:', conversationId);
    emit('conversation:join', { conversationId, userId: options.userId });
    setCurrentConversationId(conversationId);
  }, [isConnected, options.userId, emit]);

  const leaveConversation = useCallback(() => {
    if (!isConnected || !currentConversationId) return;

    console.log('🚪 Leaving conversation:', currentConversationId);
    emit('conversation:leave', { conversationId: currentConversationId, userId: options.userId });
    
    // Stop typing when leaving
    stopTyping();
    
    setCurrentConversationId(undefined);
  }, [isConnected, currentConversationId, options.userId, emit, stopTyping]);

  // Message delivery confirmations
  const markAsRead = useCallback((messageIds: string[]) => {
    if (!isConnected || !currentConversationId) return;

    console.log('👁️ Marking messages as read:', messageIds);
    emit('messages:read', { 
      conversationId: currentConversationId, 
      messageIds, 
      userId: options.userId 
    });
  }, [isConnected, currentConversationId, options.userId, emit]);

  const markAsDelivered = useCallback((messageIds: string[]) => {
    if (!isConnected || !currentConversationId) return;

    console.log('📬 Marking messages as delivered:', messageIds);
    emit('messages:delivered', { 
      conversationId: currentConversationId, 
      messageIds, 
      userId: options.userId 
    });
  }, [isConnected, currentConversationId, options.userId, emit]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  return {
    isConnected,
    sendMessage,
    updateMessageStatus,
    startTyping,
    stopTyping,
    typingUsers: typingUsers.filter(t => t.conversationId === currentConversationId),
    updateUserStatus,
    onlineUsers,
    joinConversation,
    leaveConversation,
    markAsRead,
    markAsDelivered
  };
};