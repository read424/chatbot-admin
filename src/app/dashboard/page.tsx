'use client';

import { ChatList } from '@/components/inbox/ChatList';
import { ChatWindow } from '@/components/inbox/ChatWindow';
import { ConnectionStatus } from '@/components/inbox/ConnectionStatus';
import { CustomerInfo } from '@/components/inbox/CustomerInfo';
import { Header } from '@/components/inbox/Header';
import { RealtimeChatProvider } from '@/components/inbox/RealtimeChatProvider';
import { useAuth } from '@/hooks/useAuth'; // Agregar este import
import { useChat } from '@/hooks/useChat';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { useChatStore } from '@/stores/chatStore';
import type { ConversationPriority, Notification, TypingIndicator } from '@/types/chat';
import { Contact } from '@/types/contact';
import { Conversation, ConversationFilters } from '@/types/inbox';
import { useEffect, useState } from 'react'; // Agregar useEffect

export default function Home() {
  // Hooks existentes...
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

    const { user } = useAuth();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
    const [currentUserId] = useState('current-user-id');
    const currentMessages = getCurrentMessages();
    const filteredConversations = getFilteredConversations();
  
    const typingUsers = selectedConversation 
        ? getTypingUsersForConversation(selectedConversation.id)
        : [];

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

    // Determinar estado de conexión
    const connectionStatus = isConnected ? 'connected' : 'disconnected';

    // Handler para notificaciones
    const handleNotificationClick = () => {
        setNotifications(prev => 
            prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadNotificationCount(0);
    };

    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation);

        // Opcional: Lógica adicional como marcar como leída, etc.
        if (conversation.unreadCount > 0) {
            // markAsRead(conversation.id);
        }
    };

    const handleUpdateContact = async (contactId: string, updates: Partial<Contact>) => {
        try {
          console.log('Update contact:', contactId, updates);
          // TODO: Implementar llamada real a la API
          // await contactService.updateContact(contactId, updates);
        } catch (error) {
          console.error('Error updating contact:', error);
        }
    };

    const handleAddNote = async (conversationId: string, content: string, isInternal: boolean) => {
        try {
          console.log('Add note:', conversationId, content, isInternal);
          // TODO: Implementar llamada real a la API
          // await inboxService.addConversationNote({ conversationId, content, isInternal });
        } catch (error) {
          console.error('Error adding note:', error);
        }
    };
    
    const handleAddTag = async (conversationId: string, tag: string) => {
        try {
          console.log('Add tag:', conversationId, tag);
          // TODO: Implementar llamada real a la API
          // await inboxService.addTag(conversationId, tag);
        } catch (error) {
          console.error('Error adding tag:', error);
        }
    };
    
    const handleRemoveTag = async (conversationId: string, tag: string) => {
        try {
          console.log('Remove tag:', conversationId, tag);
          // TODO: Implementar llamada real a la API
          // await inboxService.removeTag(conversationId, tag);
        } catch (error) {
          console.error('Error removing tag:', error);
        }
    };
    
    const handleUpdatePriority = async (conversationId: string, priority: ConversationPriority) => {
        try {
          console.log('Update priority:', conversationId, priority);
          // TODO: Implementar llamada real a la API
          // await inboxService.updateConversation(conversationId, { priority });
        } catch (error) {
          console.error('Error updating priority:', error);
        }
    };

    // Efecto para contar notificaciones no leídas
    useEffect(() => {
        const unreadCount = notifications.filter(n => !n.isRead).length;
        setUnreadNotificationCount(unreadCount);
    }, [notifications]);

    // Resto de tu lógica existente...
    const handleEnhancedSendMessage = (message: string, type?: string) => {
        // Tu lógica existente
    };

    return (
        <RealtimeChatProvider>
        <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Header actualizado con props reales */}
            <Header 
            user={user?.name || currentUser}
            notifications={notifications}
            unreadNotificationCount={unreadNotificationCount}
            connectionStatus={connectionStatus}
            onNotificationClick={handleNotificationClick}
            />
            
            <div className="flex-1 flex overflow-hidden">
                <div className="flex items-center space-x-2 p-4">
                    <ConnectionStatus 
                        status={isConnected ? 'connected' : 'disconnected'}
                        showText={true}
                        onlineUsers={0}
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {conversations.length > 0 
                            ? `${conversations.length} conversaciones • ${chats.length} chats legacy`
                            : `${chats.length} chats`
                        }
                    </div>
                </div>
            
                <ChatList 
                    conversations={filteredConversations as Conversation[]}
                    selectedConversation={selectedConversation as Conversation | null}
                    searchTerm={searchTerm}
                    filters={conversationFilters}
                    isLoading={false}
                    onSelectConversation={setSelectedConversation}
                    onSearchChange={handleSearchChange}
                    onFiltersChange={setConversationFilters as (filters: ConversationFilters) => void}
                />
            
                <ChatWindow 
                    chat={selectedChat}
                    conversation={selectedConversation}
                    messages={currentMessages}
                    onSendMessage={handleEnhancedSendMessage}
                    onUpdateClient={handleUpdateClient}
                    isTyping={typingUsers.length > 0}
                    typingUsers={typingUsers.map((t: TypingIndicator) => t.userName)}
                />
            
                <CustomerInfo 
                    conversation={selectedConversation}
                    contact={selectedConversation?.contact}
                    onAssignAgent={handleAssignSalesperson}
                    onUpdateContact={handleUpdateContact}
                    onAddNote={handleAddNote}
                    onAddTag={handleAddTag}
                    onRemoveTag={handleRemoveTag}
                    onUpdatePriority={handleUpdatePriority}
                />
            </div>
        </div>
        </RealtimeChatProvider>
    );
}