'use client';

import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { useChatStore } from '@/stores/chatStore';
import type { Message, MessageStatus, TypingIndicator, User } from '@/types/chat';
import React, { useEffect, ReactNode } from 'react';

interface RealtimeChatProviderProps {
  children: ReactNode;
  userId?: string;
  conversationId?: string;
}

export const RealtimeChatProvider: React.FC<RealtimeChatProviderProps> = ({
  children,
  userId,
  conversationId
}) => {
  const {
    addMessageToConversation,
    updateMessageStatusInConversation,
    addTypingIndicator,
    removeTypingIndicator,
    updateUserOnlineStatus,
    removeUserFromOnline,
    updateConversation,
    setConnectionStatus
  } = useChatStore();

  const {
    isConnected,
    typingUsers,
    onlineUsers
  } = useRealtimeChat({
    conversationId,
    userId,
    onMessageReceived: (message: Message) => {
      console.log('📨 Message received in provider:', message);
      if (message.conversationId) {
        addMessageToConversation(message.conversationId, message);
      }
    },
    onMessageStatusUpdate: (messageId: string, status: MessageStatus) => {
      console.log('📋 Message status updated in provider:', { messageId, status });
      if (conversationId) {
        updateMessageStatusInConversation(conversationId, messageId, status);
      }
    },
    onTypingUpdate: (typing: TypingIndicator) => {
      console.log('⌨️ Typing update in provider:', typing);
      if (typing.isTyping) {
        addTypingIndicator(typing);
      } else {
        removeTypingIndicator(typing.userId, typing.conversationId);
      }
    },
    onUserStatusUpdate: (userId: string, status: 'online' | 'away' | 'busy' | 'offline') => {
      console.log('👤 User status updated in provider:', { userId, status });
      if (status === 'offline') {
        removeUserFromOnline(userId);
      } else {
        // In a real implementation, you'd fetch the full user data
        const user: User = {
          id: userId,
          name: `User ${userId}`,
          email: '',
          role: 'agent',
          status,
          permissions: [],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        updateUserOnlineStatus(user);
      }
    },
    onConversationUpdate: (conversationUpdates) => {
      console.log('💬 Conversation updated in provider:', conversationUpdates);
      if (conversationId && conversationUpdates) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateConversation(conversationId, conversationUpdates as any);
      }
    }
  });

  // Update connection status in store
  useEffect(() => {
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  }, [isConnected, setConnectionStatus]);

  // Sync typing users and online users with store
  useEffect(() => {
    // The typing users are already managed by the store through the callbacks
    // This effect could be used for additional synchronization if needed
  }, [typingUsers, onlineUsers]);

  return <>{children}</>;
};