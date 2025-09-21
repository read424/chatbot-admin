import { ChatList } from '@/components/inbox/ChatList';
import { ChatWindow } from '@/components/inbox/ChatWindow';
import { ConnectionStatus } from '@/components/inbox/ConnectionStatus';
import { CustomerInfo } from '@/components/inbox/CustomerInfo';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import { useChatStore } from '@/stores/chatStore';
import type { ApiChatSession, ApiContact } from '@/types/api';
import { mapApiContactToContact, mapApiMessageToMessage, mapApiSessionToConversation } from '@/utils/typeMappers';
import { useEffect, useState } from 'react';

export const ChatPage = () => {
  const {
    sessions,
    selectedSession,
    messages,
    isLoading,
    error,
    loadSessions,
    loadMessages,
    sendMessage,
    selectSession,
    updateSession,
    handleNewMessage,
    handleSessionUpdate,
    clearError
  } = useChatStore();

  const [searchTerm, setSearchTerm] = useState('');
  const tenantId = '1'; // Obtener del contexto de autenticación

  // WebSocket connection
  const { isConnected } = useChatWebSocket({
    tenantId,
    onNewMessage: (message) => {
      // El mensaje viene con información de la sesión desde el backend
        const sessionData: ApiChatSession = {
          id: message.chatSessionId,
          status: 'active' as const,
          startedAt: new Date().toISOString(),
          tenantId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          contact: message.contact as ApiContact
        };
      const sessionId = message.chatSessionId;
      handleNewMessage(message as any, sessionData as any);
    },
    onSessionUpdate: (session) => {
      if (session.id) {
        handleSessionUpdate(session.id, session as any);
      }
    },
    onMessageStatusUpdate: (messageId, status) => {
      if (selectedSession) {
        // Encontrar en qué sesión está el mensaje y actualizar
        Object.keys(messages).forEach(sessionId => {
          const sessionMessages = messages[sessionId] || [];
          if (sessionMessages.some(m => m.id === messageId)) {
            useChatStore.getState().updateMessageStatus(sessionId, messageId, status);
          }
        });
      }
    }
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Filtrar sesiones por búsqueda
  const filteredSessions = sessions.filter(session => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      session.contact.name?.toLowerCase().includes(searchLower) ||
      session.contact.phoneNumber.includes(searchLower) ||
      session.lastMessage?.content?.toLowerCase().includes(searchLower)
    );
  });

  const handleSendMessage = async (content: string, messageType = 'text') => {
    if (!selectedSession) return;
    
    try {
      await sendMessage(selectedSession.id, content, messageType);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSelectSession = (session: any) => {
    // Convertir el formato si es necesario
    const chatSession = {
      id: session.id,
      status: session.status || 'active',
      startedAt: session.startedAt || session.createdAt,
      endedAt: session.endedAt,
      handledBy: session.handledBy,
      tenantId: session.tenantId || tenantId,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      contact: session.contact,
      unreadCount: session.unreadCount || 0,
      lastMessage: session.lastMessage
    };
    
    selectSession(chatSession);
  };

  const handleUpdateContact = async (contactId: string, updates: any) => {
    // Implementar actualización de contacto
    console.log('Updating contact:', contactId, updates);
  };

  const handleAssignSalesperson = async (sessionId: string, salesperson: string) => {
    try {
      await updateSession(sessionId, {
        handledBy: parseInt(salesperson) // Asumiendo que salesperson es un ID
      });
    } catch (error) {
      console.error('Error assigning salesperson:', error);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="ml-2 text-white hover:text-gray-200">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="absolute top-4 left-4 z-40">
        <ConnectionStatus 
          status={isConnected ? 'connected' : 'disconnected'}
          showText={true}
        />
      </div>

      {/* Chat List */}
      <ChatList
        chats={[]} // No usar chats legacy
        conversations={filteredSessions.map(mapApiSessionToConversation)}
        selectedChat={null}
        selectedConversation={selectedSession ? mapApiSessionToConversation(selectedSession) : null}
        searchTerm={searchTerm}
        onSelectChat={() => {}}
        onSelectConversation={handleSelectSession}
        onSearchChange={setSearchTerm}
      />

      {/* Chat Window */}
      <ChatWindow
        chat={null} // No usar chat legacy
        conversation={selectedSession ? mapApiSessionToConversation(selectedSession) : null}
        messages={(selectedSession ? messages[selectedSession.id] || [] : []).map(mapApiMessageToMessage)}
        onSendMessage={handleSendMessage}
        onUpdateClient={() => {}}
        isTyping={false}
        typingUsers={[]}
      />

      {/* Customer Info */}
      <CustomerInfo
        chat={null}
        conversation={selectedSession ? mapApiSessionToConversation(selectedSession) : null}
        contact={selectedSession ? mapApiContactToContact(selectedSession.contact) : null}
        onAssignSalesperson={handleAssignSalesperson}
        onUpdateContact={handleUpdateContact}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 dark:text-gray-300">Cargando...</span>
          </div>
        </div>
      )}
    </div>
  );
};