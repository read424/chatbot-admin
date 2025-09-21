import { useSocket } from '@/contexts/SocketIOContext';
import { useEffect, useState } from 'react';

interface ChatMessage {
    id: string;
    content: string;
    messageType: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contact';
    direction: 'incoming' | 'outgoing';
    status: number; // -1: failed, 0: sending, 1: sent, 2: delivered, 3: read
    createdAt: string;
    contact: {
      id: string;
      name: string;
      phoneNumber: string;
    };
    chatSessionId: string;
    mediaUrl?: string;
    whatsappMessageId?: string;
}
  
interface ChatSession {
    id: string;
    status: 'active' | 'closed' | 'transferred';
    startedAt: string;
    endedAt?: string;
    handledBy?: number;
    contact: {
      id: string;
      name: string;
      phoneNumber: string;
      avatarUrl?: string;
    };
    messages?: ChatMessage[];
    unreadCount?: number;
    lastMessage?: ChatMessage;
}
  
interface UseChatWebSocketProps {
    tenantId: string;
    onNewMessage?: (message: ChatMessage) => void;
    onSessionUpdate?: (session: ChatSession) => void;
    onMessageStatusUpdate?: (messageId: string, status: number) => void;
}
  
export const useChatWebSocket = ({
    tenantId,
    onNewMessage,
    onSessionUpdate,
    onMessageStatusUpdate
  }: UseChatWebSocketProps) => {
    const { emit, on, off, isConnected, connectToTenant } = useSocket();
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);
  
    // Conectar al tenant cuando se monta el hook
    useEffect(() => {
      if (isConnected && tenantId) {
        connectToTenant(tenantId);
      }
    }, [isConnected, tenantId, connectToTenant]);
  
    // Eventos WebSocket
    useEffect(() => {
      if (!isConnected) return;
  
      const handleNewMessage = (data: { message: ChatMessage; chatSession: ChatSession; contact: any }) => {
        console.log('Nuevo mensaje recibido:', data);
        
        // Actualizar sesiones
        setChatSessions(prev => {
          const sessionIndex = prev.findIndex(s => s.id === data.chatSession.id);
          if (sessionIndex >= 0) {
            const updated = [...prev];
            updated[sessionIndex] = {
              ...updated[sessionIndex],
              lastMessage: data.message,
              unreadCount: (updated[sessionIndex].unreadCount || 0) + 1
            };
            return updated;
          } else {
            // Nueva sesión
            return [{ ...data.chatSession, lastMessage: data.message, unreadCount: 1 }, ...prev];
          }
        });
  
        onNewMessage?.(data.message);
      };
  
      const handleMessageSent = (data: { message: ChatMessage; chatSession: ChatSession; contact: any }) => {
        console.log('Mensaje enviado:', data);
        
        setChatSessions(prev => {
          const sessionIndex = prev.findIndex(s => s.id === data.chatSession.id);
          if (sessionIndex >= 0) {
            const updated = [...prev];
            updated[sessionIndex] = {
              ...updated[sessionIndex],
              lastMessage: data.message
            };
            return updated;
          }
          return prev;
        });
      };
  
      const handleMessageStatusUpdate = (data: { messageId: string; whatsappMessageId: string; status: number }) => {
        console.log('Estado de mensaje actualizado:', data);
        onMessageStatusUpdate?.(data.messageId, data.status);
      };
  
      const handleSessionUpdated = (data: { sessionId: string; updates: Partial<ChatSession> }) => {
        console.log('Sesión actualizada:', data);
        
        setChatSessions(prev => {
          const sessionIndex = prev.findIndex(s => s.id === data.sessionId);
          if (sessionIndex >= 0) {
            const updated = [...prev];
            updated[sessionIndex] = { ...updated[sessionIndex], ...data.updates };
            return updated;
          }
          return prev;
        });
  
        onSessionUpdate?.(data.updates as ChatSession);
      };
  
      // Registrar listeners
      on('newMessage', handleNewMessage);
      on('messageSent', handleMessageSent);
      on('messageStatusUpdate', handleMessageStatusUpdate);
      on('sessionUpdated', handleSessionUpdated);
  
      return () => {
        off('newMessage', handleNewMessage);
        off('messageSent', handleMessageSent);
        off('messageStatusUpdate', handleMessageStatusUpdate);
        off('sessionUpdated', handleSessionUpdated);
      };
    }, [isConnected, on, off, onNewMessage, onSessionUpdate, onMessageStatusUpdate]);
  
    return {
      chatSessions,
      isConnected,
      isLoading
    };
};