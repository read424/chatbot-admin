# 🚀 Quick Start - Sistema de Mensajería en Tiempo Real

## Implementación en 3 Pasos

### Paso 1: Conectar al Tenant (Una vez por sesión)

```typescript
// En tu componente principal o layout
import { useSocket } from '@/contexts/SocketIOContext';
import { useEffect } from 'react';

function YourComponent() {
  const { connectToTenant, isConnected } = useSocket();

  useEffect(() => {
    if (isConnected) {
      const tenantId = localStorage.getItem('tenantId'); // O de tu auth context
      if (tenantId) {
        connectToTenant(tenantId);
      }
    }
  }, [isConnected, connectToTenant]);

  // ... resto del componente
}
```

### Paso 2: Agregar los Hooks

```typescript
import { useSendMessage } from '@/hooks/useSendMessage';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { useState } from 'react';

function ChatComponent({ conversationId }) {
  const [messages, setMessages] = useState<Message[]>([]);

  // Hook para ENVIAR mensajes
  const { sendMessage } = useSendMessage({
    onSuccess: (msg) => console.log('Enviado:', msg),
    onError: (err) => console.error('Error:', err)
  });

  // Hook para RECIBIR mensajes
  useRealtimeChat({
    conversationId,
    onMessageReceived: (newMessage) => {
      setMessages(prev => {
        // Prevenir duplicados
        if (prev.some(m => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    }
  });

  // ... resto del componente
}
```

### Paso 3: Usar con ChatWindow

```typescript
import { ChatWindow } from '@/components/inbox/ChatWindow';

function YourComponent() {
  // ... hooks del paso 2

  return (
    <ChatWindow
      chat={selectedChat}
      conversation={conversation}
      messages={messages}
      onSendMessage={sendMessage}  // ← Conecta el envío
      onUpdateClient={setSelectedChat}
    />
  );
}
```

## ✅ ¡Listo!

El sistema ahora:
- ✅ Envía mensajes al backend
- ✅ Recibe mensajes en tiempo real
- ✅ Actualiza la UI automáticamente

---

## 📋 Código Completo (Copy-Paste)

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { ChatWindow } from '@/components/inbox/ChatWindow';
import { useSendMessage } from '@/hooks/useSendMessage';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { useSocket } from '@/contexts/SocketIOContext';
import type { Chat, Message } from '@/types/chat';
import type { Conversation } from '@/types/inbox';

export function InboxPage() {
  // Estado
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Conectar al tenant
  const { connectToTenant, isConnected } = useSocket();

  useEffect(() => {
    if (isConnected) {
      const tenantId = localStorage.getItem('tenantId');
      if (tenantId) {
        connectToTenant(tenantId);
      }
    }
  }, [isConnected, connectToTenant]);

  // Envío de mensajes
  const { sendMessage, isLoading } = useSendMessage({
    onSuccess: (message) => {
      console.log('✅ Mensaje enviado:', message);
    },
    onError: (error) => {
      console.error('❌ Error:', error);
      alert(`Error: ${error.message}`);
    }
  });

  // Recepción en tiempo real
  useRealtimeChat({
    conversationId: conversation?.id,
    onMessageReceived: (newMessage) => {
      console.log('📨 Nuevo mensaje recibido:', newMessage);

      setMessages(prev => {
        // Prevenir duplicados
        if (prev.some(m => m.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    }
  });

  return (
    <div className="h-screen">
      {/* Indicador de conexión */}
      <div className="bg-gray-100 px-4 py-2 text-sm">
        {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
        {isLoading && ' | ⏳ Enviando...'}
      </div>

      {/* Chat */}
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
```

---

## 🎯 Funciones Principales

### Enviar Mensaje de Texto

```typescript
await sendMessage({
  conversationId: 'conv-123',
  content: '¡Hola!',
  type: 'text'
});
```

### Enviar Mensaje con Archivos

```typescript
const { sendMessageWithAttachments } = useSendMessage();

await sendMessageWithAttachments({
  conversationId: 'conv-123',
  content: 'Te envío estos archivos',
  type: 'file',
  attachments: [file1, file2]
});
```

### Responder a un Mensaje

```typescript
await sendMessage({
  conversationId: 'conv-123',
  content: 'Respondiendo...',
  type: 'text',
  replyTo: 'message-id-456'
});
```

---

## 🐛 Problemas Comunes

### "Los mensajes no llegan"

**Solución:**

1. Verifica la conexión WebSocket:
   ```typescript
   const { isConnected } = useSocket();
   console.log('Conectado:', isConnected);
   ```

2. Verifica el tenant:
   ```typescript
   const { currentTenantId } = useSocket();
   console.log('Tenant:', currentTenantId);
   ```

### "Mensajes duplicados"

**Solución:** El sistema ya previene duplicados. Verifica que no estés agregando mensajes manualmente sin verificar.

### "Error al enviar"

**Solución:**

1. Verifica que el `conversationId` sea válido
2. Verifica que el usuario esté autenticado
3. Revisa la consola para el error específico

---

## 📚 Más Información

- **SEND_MESSAGE_GUIDE.md** - Guía completa de envío
- **WEBSOCKET_INTEGRATION.md** - Detalles de WebSocket
- **COMPLETE_INTEGRATION_EXAMPLE.tsx** - 5 ejemplos avanzados
- **RESUMEN_IMPLEMENTACION.md** - Documentación completa

---

## ⚡ Variables de Entorno

```env
# .env.local
NEXT_PUBLIC_API_URL=http://api-tlm.localhost/api
NEXT_PUBLIC_WS_URL=http://127.0.0.1:3330
```

---

## 🎉 ¡Eso es todo!

Con estos 3 pasos ya tienes un sistema completo de mensajería en tiempo real funcionando.

**¿Necesitas ayuda?** Revisa los archivos de documentación o los ejemplos completos.
