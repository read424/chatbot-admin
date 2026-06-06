/**
 * EJEMPLO COMPLETO DE INTEGRACIÓN
 * Sistema de Mensajería en Tiempo Real con WebSocket
 *
 * Este archivo muestra cómo integrar completamente:
 * 1. Envío de mensajes con useSendMessage
 * 2. Recepción de mensajes en tiempo real con WebSocket
 * 3. Visualización en ChatWindow
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ChatWindow } from '@/components/inbox/ChatWindow';
import { useSendMessage } from '@/hooks/useSendMessage';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { useSocket } from '@/contexts/SocketIOContext';
import type { Chat, Message } from '@/types/chat';
import type { Conversation, SendMessageRequest } from '@/types/inbox';

// ============================================
// EJEMPLO 1: Integración Básica
// ============================================

function BasicIntegrationExample() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const { connectToTenant, isConnected } = useSocket();

  // Conectar al tenant cuando el componente se monta
  useEffect(() => {
    const tenantId = localStorage.getItem('tenantId');
    if (isConnected && tenantId) {
      connectToTenant(tenantId);
    }
  }, [isConnected, connectToTenant]);

  // Hook para enviar mensajes
  const { sendMessage, isLoading: isSending } = useSendMessage({
    onSuccess: (message) => {
      console.log('✅ Mensaje enviado exitosamente:', message);
      // El mensaje se agregará automáticamente vía WebSocket
    },
    onError: (error) => {
      console.error('❌ Error al enviar mensaje:', error);
      alert(`Error: ${error.message}`);
    }
  });

  // Hook para recibir mensajes en tiempo real
  useRealtimeChat({
    conversationId: conversation?.id,
    onMessageReceived: (newMessage) => {
      console.log('📨 Nuevo mensaje recibido:', newMessage);

      // Agregar mensaje al array evitando duplicados
      setMessages(prev => {
        const exists = prev.some(m => m.id === newMessage.id);
        if (exists) {
          console.log('⚠️ Mensaje duplicado, ignorando...');
          return prev;
        }
        return [...prev, newMessage];
      });
    },
    onMessageStatusUpdate: (messageId, status) => {
      console.log('📋 Estado actualizado:', { messageId, status });

      // Actualizar el estado del mensaje
      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, status } : m))
      );
    }
  });

  // Handler para enviar mensaje
  const handleSendMessage = async (request: SendMessageRequest) => {
    await sendMessage(request);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Indicador de conexión */}
      <div className="bg-gray-100 p-2 text-sm">
        Estado: {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
        {isSending && ' | ⏳ Enviando mensaje...'}
      </div>

      {/* ChatWindow */}
      <div className="flex-1">
        <ChatWindow
          chat={selectedChat}
          conversation={conversation}
          messages={messages}
          onSendMessage={handleSendMessage}
          onUpdateClient={setSelectedChat}
        />
      </div>
    </div>
  );
}

// ============================================
// EJEMPLO 2: Con Gestión de Estados Avanzada
// ============================================

function AdvancedIntegrationExample() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const { connectToTenant, isConnected, currentTenantId } = useSocket();

  // Conectar al tenant
  useEffect(() => {
    const tenantId = localStorage.getItem('tenantId');
    if (isConnected && tenantId && !currentTenantId) {
      console.log('🔌 Conectando al tenant:', tenantId);
      connectToTenant(tenantId);
    }
  }, [isConnected, currentTenantId, connectToTenant]);

  // Cargar historial de mensajes cuando se selecciona una conversación
  useEffect(() => {
    if (!conversation?.id) return;

    const loadMessages = async () => {
      setIsLoadingHistory(true);
      try {
        // Aquí cargarías los mensajes del historial
        // const history = await inboxService.getMessages(conversation.id, { page: 1, limit: 50 });
        // setMessages(history.messages);
        console.log('📜 Cargando historial de mensajes...');
      } catch (error) {
        console.error('Error cargando historial:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadMessages();
  }, [conversation?.id]);

  // Hook para enviar mensajes
  const { sendMessage, sendMessageWithAttachments, isLoading, error } = useSendMessage({
    onSuccess: (message) => {
      console.log('✅ Mensaje enviado:', message.id);
    },
    onError: (error) => {
      console.error('❌ Error:', error);
    }
  });

  // Hook para tiempo real
  useRealtimeChat({
    conversationId: conversation?.id,
    onMessageReceived: (newMessage) => {
      console.log('📨 Mensaje recibido:', newMessage);

      setMessages(prev => {
        // Prevenir duplicados
        if (prev.some(m => m.id === newMessage.id)) {
          return prev;
        }

        // Insertar en orden cronológico
        return [...prev, newMessage].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });
    },
    onMessageStatusUpdate: (messageId, status) => {
      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, status } : m))
      );
    },
    onTypingUpdate: (typing) => {
      console.log('⌨️ Typing:', typing);
    }
  });

  return (
    <div className="h-screen">
      <ChatWindow
        chat={selectedChat}
        conversation={conversation}
        messages={messages}
        onSendMessage={sendMessage}
        onUpdateClient={setSelectedChat}
      />
    </div>
  );
}

// ============================================
// EJEMPLO 3: Con Provider Pattern
// ============================================

import { RealtimeChatProvider } from '@/components/inbox/RealtimeChatProvider';
import { useChatStore } from '@/stores/chatStore';

function ProviderPatternExample() {
  const [selectedConversationId, setSelectedConversationId] = useState<string>();
  const { getConversationMessages } = useChatStore();

  const messages = getConversationMessages(selectedConversationId || '');

  const { sendMessage } = useSendMessage();

  return (
    <RealtimeChatProvider
      conversationId={selectedConversationId}
      userId="user-123"
    >
      <ChatWindow
        chat={null}
        conversation={null}
        messages={messages}
        onSendMessage={sendMessage}
        onUpdateClient={() => {}}
      />
    </RealtimeChatProvider>
  );
}

// ============================================
// EJEMPLO 4: Con Manejo de Errores y Retry
// ============================================

function RobustIntegrationExample() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');

  const { isConnected, connectToTenant } = useSocket();

  // Monitorear estado de conexión
  useEffect(() => {
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  }, [isConnected]);

  // Intentar reconectar
  useEffect(() => {
    if (!isConnected && connectionStatus === 'connected') {
      setConnectionStatus('reconnecting');

      const reconnectTimer = setTimeout(() => {
        const tenantId = localStorage.getItem('tenantId');
        if (tenantId) {
          connectToTenant(tenantId);
        }
      }, 3000);

      return () => clearTimeout(reconnectTimer);
    }
  }, [isConnected, connectionStatus, connectToTenant]);

  const { sendMessage, isLoading, error } = useSendMessage({
    onSuccess: (message) => {
      console.log('✅ Mensaje enviado');

      // Agregar mensaje optimísticamente (se actualizará vía WebSocket)
      setMessages(prev => [...prev, {
        ...message,
        status: 'sending'
      }]);
    },
    onError: (error) => {
      console.error('❌ Error:', error);

      // Mostrar notificación de error
      // toast.error(`Error al enviar: ${error.message}`);
    }
  });

  useRealtimeChat({
    conversationId: conversation?.id,
    onMessageReceived: (newMessage) => {
      setMessages(prev => {
        // Si el mensaje ya existe, actualizar su estado
        const existingIndex = prev.findIndex(m => m.id === newMessage.id);

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = newMessage;
          return updated;
        }

        // Nuevo mensaje
        return [...prev, newMessage];
      });
    }
  });

  return (
    <div className="h-screen flex flex-col">
      {/* Barra de estado */}
      <div className={`p-3 text-sm font-medium ${
        connectionStatus === 'connected'
          ? 'bg-green-100 text-green-800'
          : connectionStatus === 'reconnecting'
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-red-100 text-red-800'
      }`}>
        {connectionStatus === 'connected' && '🟢 Conectado'}
        {connectionStatus === 'reconnecting' && '🟡 Reconectando...'}
        {connectionStatus === 'disconnected' && '🔴 Desconectado'}
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3">
          <strong>Error:</strong> {error.message}
        </div>
      )}

      {/* Chat */}
      <div className="flex-1">
        <ChatWindow
          chat={null}
          conversation={conversation}
          messages={messages}
          onSendMessage={sendMessage}
          onUpdateClient={() => {}}
        />
      </div>
    </div>
  );
}

// ============================================
// EJEMPLO 5: Hook Personalizado que Combina Todo
// ============================================

function useInboxWithRealtime(conversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { connectToTenant, isConnected } = useSocket();

  // Conectar al tenant
  useEffect(() => {
    const tenantId = localStorage.getItem('tenantId');
    if (isConnected && tenantId) {
      connectToTenant(tenantId);
    }
  }, [isConnected, connectToTenant]);

  // Envío de mensajes
  const { sendMessage, isLoading, error } = useSendMessage({
    onSuccess: (message) => {
      console.log('Mensaje enviado:', message.id);
    }
  });

  // Recepción de mensajes
  useRealtimeChat({
    conversationId,
    onMessageReceived: (newMessage) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    }
  });

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    isConnected
  };
}

// Uso del hook personalizado
function SimpleExample() {
  const conversationId = 'conv-123';
  const { messages, sendMessage, isLoading, isConnected } = useInboxWithRealtime(conversationId);

  return (
    <div>
      <div>Estado: {isConnected ? '✅ Conectado' : '❌ Desconectado'}</div>
      <div>Mensajes: {messages.length}</div>

      <ChatWindow
        chat={null}
        conversation={{ id: conversationId } as Conversation}
        messages={messages}
        onSendMessage={sendMessage}
        onUpdateClient={() => {}}
      />
    </div>
  );
}

// ============================================
// EXPORTAR EJEMPLO PRINCIPAL
// ============================================

export default BasicIntegrationExample;

// También puedes exportar los otros ejemplos
export {
  AdvancedIntegrationExample,
  ProviderPatternExample,
  RobustIntegrationExample,
  SimpleExample,
  useInboxWithRealtime
};
