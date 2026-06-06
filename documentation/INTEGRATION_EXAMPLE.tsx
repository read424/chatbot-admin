// EJEMPLO DE INTEGRACIÓN DEL SISTEMA DE ENVÍO DE MENSAJES
// Este archivo muestra cómo integrar el hook useSendMessage con el componente ChatWindow

import React, { useState } from 'react';
import { ChatWindow } from '@/components/inbox/ChatWindow';
import { useSendMessage } from '@/hooks/useSendMessage';
import type { Chat, Message } from '@/types/chat';
import type { Conversation } from '@/types/inbox';

function InboxPage() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Hook para envío de mensajes
  const { sendMessage, sendMessageWithAttachments, isLoading, error } = useSendMessage({
    onSuccess: (newMessage) => {
      console.log('Mensaje enviado exitosamente:', newMessage);

      // Agregar el nuevo mensaje a la lista
      setMessages(prev => [...prev, newMessage]);

      // Opcional: Mostrar notificación de éxito
      // toast.success('Mensaje enviado');
    },
    onError: (error) => {
      console.error('Error al enviar mensaje:', error);

      // Mostrar notificación de error al usuario
      // toast.error(`Error: ${error.message}`);
      alert(`Error al enviar mensaje: ${error.message}`);
    }
  });

  // Handler para enviar mensajes desde ChatWindow
  const handleSendMessage = async (request: SendMessageRequest) => {
    await sendMessage(request);
  };

  const handleSendMessageWithAttachments = async (request: SendMessageWithAttachmentsRequest) => {
    await sendMessageWithAttachments(request);
  };

  return (
    <div className="h-screen flex">
      {/* Lista de chats - Izquierda */}
      <div className="w-1/3 border-r">
        {/* ... tu lista de chats aquí */}
      </div>

      {/* Ventana de chat - Derecha */}
      <div className="flex-1 flex flex-col">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error.message}</span>
          </div>
        )}

        <ChatWindow
          chat={selectedChat}
          conversation={conversation}
          messages={messages}
          onSendMessage={handleSendMessage}
          onUpdateClient={(updatedClient) => setSelectedChat(updatedClient)}
          isTyping={false}
          typingUsers={[]}
        />

        {isLoading && (
          <div className="absolute bottom-20 right-4 bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
              <span>Enviando mensaje...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// EJEMPLO 2: Uso más simple directamente en un componente
// ============================================

function SimpleChatExample() {
  const conversationId = 'conv-123'; // Tu ID de conversación

  const { sendMessage, isLoading } = useSendMessage({
    onSuccess: (message) => {
      console.log('Mensaje enviado:', message);
    }
  });

  const handleQuickReply = async (text: string) => {
    await sendMessage({
      conversationId,
      content: text,
      type: 'text'
    });
  };

  return (
    <div>
      <h3>Respuestas Rápidas</h3>
      <button
        onClick={() => handleQuickReply('Hola, ¿en qué puedo ayudarte?')}
        disabled={isLoading}
      >
        Saludo
      </button>
      <button
        onClick={() => handleQuickReply('Gracias por contactarnos')}
        disabled={isLoading}
      >
        Agradecimiento
      </button>
    </div>
  );
}

// ============================================
// EJEMPLO 3: Con integración de Socket.IO para actualizaciones en tiempo real
// ============================================

import { useSocket } from '@/contexts/SocketIOContext';
import { useEffect } from 'react';

function RealtimeChatExample() {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);

  const { sendMessage } = useSendMessage({
    onSuccess: (newMessage) => {
      // El mensaje se agregará vía socket, pero podemos agregarlo optimísticamente
      setMessages(prev => [...prev, newMessage]);
    }
  });

  useEffect(() => {
    if (!socket) return;

    // Escuchar nuevos mensajes
    socket.on('message_received', (data) => {
      setMessages(prev => [...prev, data.message]);
    });

    // Escuchar actualizaciones de estado
    socket.on('message_sent', (data) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === data.message.id
            ? { ...msg, status: 'sent' }
            : msg
        )
      );
    });

    socket.on('message_delivered', (data) => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === data.message.id
            ? { ...msg, status: 'delivered' }
            : msg
        )
      );
    });

    return () => {
      socket.off('message_received');
      socket.off('message_sent');
      socket.off('message_delivered');
    };
  }, [socket]);

  // ... resto del componente
}

// ============================================
// EJEMPLO 4: Uso del servicio directamente (sin hook)
// ============================================

import { inboxService } from '@/lib/api/services/inbox';

async function sendMessageDirectly() {
  try {
    const message = await inboxService.sendChatMessage({
      conversationId: 'conv-123',
      content: 'Hola mundo',
      type: 'text'
    });

    console.log('Mensaje enviado:', message);
    return message;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// ============================================
// EJEMPLO 5: Envío de mensajes con archivos
// ============================================

function FileUploadExample() {
  const { sendMessageWithAttachments, isLoading } = useSendMessage();

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);

    await sendMessageWithAttachments({
      conversationId: 'conv-123',
      content: 'Te envío estos archivos',
      type: filesArray.some(f => f.type.startsWith('image/')) ? 'image' : 'file',
      attachments: filesArray
    });
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => handleFileUpload(e.target.files)}
        disabled={isLoading}
      />
      {isLoading && <p>Subiendo archivos...</p>}
    </div>
  );
}

export default InboxPage;