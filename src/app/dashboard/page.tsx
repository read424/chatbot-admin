'use client';

import { ChatList } from '@/components/inbox/ChatList';
import { ChatWindow } from '@/components/inbox/ChatWindow';
import { CustomerInfo } from '@/components/inbox/CustomerInfo';
import { Header } from '@/components/inbox/Header';
import { RealtimeChatProvider } from '@/components/inbox/RealtimeChatProvider';
import { ConnectionStatus } from '@/components/inbox/ConnectionStatus';
import { useChat } from '@/hooks/useChat';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { useChatStore } from '@/stores/chatStore';
import { useEffect, useState } from 'react';

export default function Home() {
  const {
    chats,
    selectedChat,
    currentUser,
    searchTerm,
    handleSelectChat,
    handleSendMessage,
    handleUpdateClient,
    handleAssignSalesperson,
    handleSearchChange,
    getCurrentMessages
  } = useChat();

  const {
    conversations,
    selectedConversation,
    conversationFilters,
    setSelectedConversation,
    setConversationFilters,
    getFilteredConversations,
    getTypingUsersForConversation
  } = useChatStore();

  const [currentUserId] = useState('current-user-id'); // In real app, get from auth
  const currentMessages = getCurrentMessages();
  const filteredConversations = getFilteredConversations();
  
  // Get typing users for current conversation
  const typingUsers = selectedConversation 
    ? getTypingUsersForConversation(selectedConversation.id)
    : [];

  // Real-time chat functionality
  const {
    isConnected,
    sendMessage: sendRealtimeMessage,
    startTyping,
    stopTyping,
    joinConversation,
    leaveConversation,
    markAsRead
  } = useRealtimeChat({
    conversationId: selectedConversation?.id,
    userId: currentUserId
  });

  // Enhanced message sending that supports both legacy and real-time
  const handleEnhancedSendMessage = (message: string, type?: string) => {
    if (selectedConversation && isConnected) {
      // Send via real-time if conversation is selected and connected
      sendRealtimeMessage(message, type);
    } else if (selectedChat) {
      // Fall back to legacy chat system
      handleSendMessage(message);
    }
  };

  // Handle conversation selection
  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation);
    
    // Mark conversation as read
    if (conversation.unreadCount > 0) {
      // In real implementation, you'd call an API
      markAsRead([conversation.lastMessage?.id].filter(Boolean));
    }
  };

  // Handle typing indicators
  const handleStartTyping = () => {
    if (selectedConversation) {
      startTyping();
    }
  };

  const handleStopTyping = () => {
    if (selectedConversation) {
      stopTyping();
    }
  };

  return (
    <RealtimeChatProvider userId={currentUserId} conversationId={selectedConversation?.id}>
      <div className="h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
        <Header user={currentUser} />
        
        {/* Connection Status Bar */}
        <div className="px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <ConnectionStatus />
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {conversations.length > 0 
                ? `${conversations.length} conversaciones • ${chats.length} chats legacy`
                : `${chats.length} chats`
              }
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          <ChatList 
            chats={chats}
            conversations={filteredConversations}
            selectedChat={selectedChat}
            selectedConversation={selectedConversation}
            searchTerm={searchTerm}
            filters={conversationFilters}
            onSelectChat={handleSelectChat}
            onSelectConversation={handleSelectConversation}
            onSearchChange={handleSearchChange}
            onFiltersChange={setConversationFilters}
          />
          
          <ChatWindow 
            chat={selectedChat}
            conversation={selectedConversation}
            messages={currentMessages}
            onSendMessage={handleEnhancedSendMessage}
            onUpdateClient={handleUpdateClient}
            isTyping={typingUsers.length > 0}
            typingUsers={typingUsers.map(t => t.userName)}
          />
          
          <CustomerInfo 
            chat={selectedChat}
            conversation={selectedConversation}
            contact={selectedConversation?.contact}
            onAssignSalesperson={handleAssignSalesperson}
            onUpdateContact={(contactId, updates) => {
              // In real implementation, call API to update contact
              console.log('Update contact:', contactId, updates);
            }}
            onAddNote={(contactId, note, isInternal) => {
              // In real implementation, call API to add note
              console.log('Add note:', contactId, note, isInternal);
            }}
            onAddTag={(conversationId, tag) => {
              // In real implementation, call API to add tag
              console.log('Add tag:', conversationId, tag);
            }}
            onRemoveTag={(conversationId, tag) => {
              // In real implementation, call API to remove tag
              console.log('Remove tag:', conversationId, tag);
            }}
            onUpdatePriority={(conversationId, priority) => {
              // In real implementation, call API to update priority
              console.log('Update priority:', conversationId, priority);
            }}
          />
        </div>
      </div>
    </RealtimeChatProvider>
  );
}