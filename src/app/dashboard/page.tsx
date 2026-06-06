'use client';

import { ChatList } from '@/components/inbox/ChatList';
import { ChatWindow } from '@/components/inbox/ChatWindow';
import { ConnectionStatus } from '@/components/inbox/ConnectionStatus';
import { CustomerInfo } from '@/components/inbox/CustomerInfo';
import { Header } from '@/components/inbox/Header';
import { RealtimeChatProvider } from '@/components/inbox/RealtimeChatProvider';
import { useAuth } from '@/hooks/useAuth';
import { useInbox } from '@/hooks/useInbox';
import type { ConversationPriority, Notification } from '@/types/chat';
import { Contact } from '@/types/contact';
import { Conversation, MessageType } from '@/types/inbox';
import { useEffect, useState } from 'react';

export default function Home() {
    const { user } = useAuth();

    // Usar el hook useInbox que ya tiene toda la funcionalidad integrada
    const {
        conversations,
        selectedConversation,
        messages,
        typingUsers,
        isLoading: isLoadingConversations,
        isLoadingMessages: _isLoadingMessages,
        error,
        filters,
        searchTerm,
        selectConversation,
        sendMessage,
        setSearchTerm,
        updateFilters,
        markAsRead: _markAsRead,
        assignConversation,
        closeConversation: _closeConversation,
        startTyping: _startTyping,
        stopTyping: _stopTyping
    } = useInbox();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

    // Handler para notificaciones
    const handleNotificationClick = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadNotificationCount(0);
    };

    // Handler para seleccionar conversación
    const handleSelectConversation = (conversation: Conversation) => {
        selectConversation(conversation.id);
    };

    // Handler para enviar mensaje
    const handleSendMessage = async (content: string, type?: MessageType) => {
        if (!selectedConversation) return;

        try {
            await sendMessage({
                conversationId: selectedConversation.id,
                content,
                type: type || 'text'
            });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Crear un objeto Chat compatible con ChatWindow desde selectedConversation
    const selectedChat = selectedConversation ? {
        id: selectedConversation.contact.id,
        name: selectedConversation.contact.name,
        firstName: selectedConversation.contact.name.split(' ')[0] || '',
        lastName: selectedConversation.contact.name.split(' ').slice(1).join(' ') || '',
        email: selectedConversation.contact.email,
        phone: selectedConversation.contact.phone || '',
        additionalPhones: [],
        lastMessage: selectedConversation.lastMessage?.content || '',
        timestamp: selectedConversation.updatedAt,
        unread: selectedConversation.unreadCount,
        assignedTo: selectedConversation.assignedAgent?.name,
        status: 'online' as const,
        messages: messages
    } : null;

    const handleUpdateClient = async (updatedClient: { id: string; name: string; email?: string; phone: string }) => {
        try {
            console.log('Update client:', updatedClient);
            // TODO: Implementar actualización de contacto
        } catch (error) {
            console.error('Error updating client:', error);
        }
    };

    const handleUpdateContact = async (contactId: string, updates: Partial<Contact>) => {
        try {
            console.log('Update contact:', contactId, updates);
            // TODO: Implementar llamada real a la API
        } catch (error) {
            console.error('Error updating contact:', error);
        }
    };

    const handleAddNote = async (conversationId: string, content: string, isInternal: boolean) => {
        try {
            console.log('Add note:', conversationId, content, isInternal);
            // TODO: Implementar llamada real a la API
        } catch (error) {
            console.error('Error adding note:', error);
        }
    };

    const handleAddTag = async (conversationId: string, tag: string) => {
        try {
            console.log('Add tag:', conversationId, tag);
            // TODO: Implementar llamada real a la API
        } catch (error) {
            console.error('Error adding tag:', error);
        }
    };

    const handleRemoveTag = async (conversationId: string, tag: string) => {
        try {
            console.log('Remove tag:', conversationId, tag);
            // TODO: Implementar llamada real a la API
        } catch (error) {
            console.error('Error removing tag:', error);
        }
    };

    const handleUpdatePriority = async (conversationId: string, priority: ConversationPriority) => {
        try {
            console.log('Update priority:', conversationId, priority);
            // TODO: Implementar llamada real a la API
        } catch (error) {
            console.error('Error updating priority:', error);
        }
    };

    const handleAssignAgent = async (conversationId: string, agentId: string) => {
        try {
            await assignConversation(conversationId, agentId);
        } catch (error) {
            console.error('Error assigning agent:', error);
        }
    };

    // Mostrar error si hay
    useEffect(() => {
        if (error) {
            console.error('Inbox error:', error);
            // Opcionalmente mostrar un toast/notification
        }
    }, [error]);

    // Efecto para contar notificaciones no leídas
    useEffect(() => {
        const unreadCount = notifications.filter(n => !n.isRead).length;
        setUnreadNotificationCount(unreadCount);
    }, [notifications]);

    return (
        <RealtimeChatProvider>
            <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
                {/* Header */}
                <Header
                    user={user?.name || 'Usuario'}
                    notifications={notifications}
                    unreadNotificationCount={unreadNotificationCount}
                    connectionStatus={'connected'}
                    onNotificationClick={handleNotificationClick}
                />

                {/* Barra de estado horizontal - va ENCIMA de los 3 paneles */}
                <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <ConnectionStatus
                        status={'connected'}
                        showText={true}
                        onlineUsers={0}
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {conversations.length} conversación{conversations.length !== 1 ? 'es' : ''}
                    </div>
                </div>

                {/* Los 3 paneles principales */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Panel izquierdo - Lista de chats */}
                    <div className="w-80 flex-shrink-0 h-full">
                        <ChatList
                            conversations={conversations}
                            selectedConversation={selectedConversation}
                            searchTerm={searchTerm}
                            filters={filters}
                            isLoading={isLoadingConversations}
                            onSelectConversation={handleSelectConversation}
                            onSearchChange={setSearchTerm}
                            onFiltersChange={updateFilters}
                        />
                    </div>

                    {/* Panel central - Ventana de chat */}
                    <div className="flex-1 h-full">
                        <ChatWindow
                            chat={selectedChat}
                            conversation={selectedConversation}
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            onUpdateClient={handleUpdateClient}
                            isTyping={typingUsers.length > 0}
                            typingUsers={typingUsers.map(t => t.userName)}
                        />
                    </div>

                    {/* Panel derecho - Información del cliente */}
                    <div className="w-80 flex-shrink-0 h-full">
                        <CustomerInfo
                            conversation={selectedConversation}
                            contact={selectedConversation?.contact}
                            onAssignAgent={handleAssignAgent}
                            onUpdateContact={handleUpdateContact}
                            onAddNote={handleAddNote}
                            onAddTag={handleAddTag}
                            onRemoveTag={handleRemoveTag}
                            onUpdatePriority={handleUpdatePriority}
                        />
                    </div>
                </div>
            </div>
        </RealtimeChatProvider>
    );
}