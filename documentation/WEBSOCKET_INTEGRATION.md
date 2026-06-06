# Integración WebSocket - Mensajes en Tiempo Real

Esta guía explica cómo funciona la integración de WebSocket para recibir mensajes en tiempo real desde el backend.

## Flujo de Funcionamiento

### 1. Envío de Mensaje desde el Frontend

```typescript
import { useSendMessage } from '@/hooks/useSendMessage';

const { sendMessage } = useSendMessage({
  onSuccess: (message) => {
    console.log('Mensaje enviado al backend');
  }
});

// Enviar mensaje
await sendMessage({
  conversationId: 'conv-123',
  content: 'Hola mundo',
  type: 'text'
});
```

### 2. Backend Procesa y Notifica

El backend:
1. Recibe el mensaje en `POST /api/chat/send-message`
2. Guarda el mensaje en la base de datos
3. **Emite un evento WebSocket** al tenant específico:

```typescript
// Backend code (ejemplo)
await this.notificationPort.notifyNewMessage(tenantId, {
  conversationId: "123",
  message: {
    id: 456,
    chatSessionId: 123,
    contactId: 789,
    content: "Hola",
    messageType: "text",
    direction: "outgoing",
    status: 0,
    respondedBy: 1,
    responderType: "agent",
    tenantId: 1,
    createdAt: "2025-01-15...",
    updatedAt: "2025-01-15..."
  },
  timestamp: "2025-01-15T10:30:00.000Z"
});
```

### 3. Frontend Recibe y Muestra el Mensaje

El frontend automáticamente:
1. Escucha el evento `newMessage` en el canal del tenant
2. Transforma el mensaje del formato backend → frontend
3. Agrega el mensaje al array de mensajes
4. Actualiza la UI

## Estructura del Payload del Backend

### Evento WebSocket
- **Canal**: `tenantId` (ej: `"tenant-1"`)
- **Evento**: `newMessage`

### Formato del Payload

```typescript
interface BackendMessagePayload {
  conversationId: string;
  message: {
    id: number;
    chatSessionId: number;
    contactId: number;
    content: string;
    messageType: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'contact';
    direction: 'incoming' | 'outgoing';
    status: number; // 0=pendiente, 1=enviado, 2=entregado, 3=leído, 4=fallido
    respondedBy?: number;
    responderType?: 'agent' | 'bot';
    tenantId: number;
    createdAt: string;
    updatedAt: string;
    metadata?: Record<string, any>;
  };
  timestamp: string;
}
```

### Ejemplo de Payload Real

```json
{
  "conversationId": "123",
  "message": {
    "id": 456,
    "chatSessionId": 123,
    "contactId": 789,
    "content": "Hola, ¿cómo estás?",
    "messageType": "text",
    "direction": "outgoing",
    "status": 0,
    "respondedBy": 1,
    "responderType": "agent",
    "tenantId": 1,
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

## Transformación de Mensajes

El sistema incluye una utilidad para transformar mensajes del backend al frontend:

### Mapeo de Estado (Status)

| Backend Status | Frontend Status |
|----------------|-----------------|
| 0              | sending         |
| 1              | sent            |
| 2              | delivered       |
| 3              | read            |
| 4              | failed          |

### Mapeo de Tipo de Remitente (SenderType)

| Backend Direction | Backend ResponderType | Frontend SenderType |
|-------------------|----------------------|---------------------|
| incoming          | -                    | contact             |
| outgoing          | agent                | agent               |
| outgoing          | bot                  | bot                 |
| outgoing          | -                    | agent (default)     |

### Función de Transformación

```typescript
import { transformBackendMessageToFrontend } from '@/lib/utils/messageTransformer';

const frontendMessage = transformBackendMessageToFrontend(
  backendMessage,
  conversationId
);
```

## Arquitectura de Componentes

### 1. SocketIOContext (`src/contexts/SocketIOContext.tsx`)

Proporciona la conexión WebSocket base:

```typescript
const { socket, isConnected, on, off, connectToTenant } = useSocket();

// Conectarse al tenant
connectToTenant('tenant-1');
```

### 2. useRealtimeChat (`src/hooks/useRealtimeChat.ts`)

Hook que maneja los eventos de chat en tiempo real:

```typescript
const { isConnected, typingUsers } = useRealtimeChat({
  conversationId: 'conv-123',
  onMessageReceived: (message) => {
    // Se llama automáticamente cuando llega un mensaje
    console.log('Nuevo mensaje:', message);
  }
});
```

**Eventos que escucha:**
- `message:new` - Mensajes estándar
- `newMessage` - **Mensajes del backend (cuando se envía por API)**
- `message:status` - Actualizaciones de estado
- `typing:start` / `typing:stop` - Indicadores de escritura
- `user:status` - Estados de usuario
- `conversation:update` - Actualizaciones de conversación

### 3. RealtimeChatProvider (`src/components/inbox/RealtimeChatProvider.tsx`)

Provider que conecta el hook con el store:

```typescript
<RealtimeChatProvider userId="user-1" conversationId="conv-123">
  <ChatWindow />
</RealtimeChatProvider>
```

### 4. ChatWindow (`src/components/inbox/ChatWindow.tsx`)

Componente que muestra los mensajes y se actualiza automáticamente.

## Ejemplo de Implementación Completa

### Paso 1: Envolver la App con SocketIOProvider

```typescript
// app/layout.tsx
import { SocketIOProvider } from '@/contexts/SocketIOContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SocketIOProvider>
          {children}
        </SocketIOProvider>
      </body>
    </html>
  );
}
```

### Paso 2: Conectar al Tenant

```typescript
import { useSocket } from '@/contexts/SocketIOContext';
import { useEffect } from 'react';

function InboxPage() {
  const { connectToTenant, isConnected } = useSocket();
  const tenantId = 'tenant-1'; // Obtener del contexto de autenticación

  useEffect(() => {
    if (isConnected) {
      connectToTenant(tenantId);
    }
  }, [isConnected, tenantId]);

  // ... resto del componente
}
```

### Paso 3: Usar el Hook de Envío y Recepción

```typescript
import { useSendMessage } from '@/hooks/useSendMessage';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { useState } from 'react';

function ChatComponent({ conversationId }) {
  const [messages, setMessages] = useState<Message[]>([]);

  // Hook para enviar mensajes
  const { sendMessage, isLoading } = useSendMessage({
    onSuccess: (message) => {
      console.log('Mensaje enviado, esperando confirmación del backend...');
    }
  });

  // Hook para recibir mensajes en tiempo real
  useRealtimeChat({
    conversationId,
    onMessageReceived: (newMessage) => {
      console.log('✅ Mensaje recibido del backend:', newMessage);

      // Agregar mensaje al array
      setMessages(prev => {
        // Evitar duplicados
        const exists = prev.some(m => m.id === newMessage.id);
        if (exists) return prev;

        return [...prev, newMessage];
      });
    }
  });

  const handleSend = async (content: string) => {
    await sendMessage({
      conversationId,
      content,
      type: 'text'
    });
  };

  return (
    <div>
      <MessageList messages={messages} />
      <MessageInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
```

### Paso 4: Integración Completa con ChatWindow

```typescript
import { ChatWindow } from '@/components/inbox/ChatWindow';
import { useSendMessage } from '@/hooks/useSendMessage';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { useState } from 'react';

function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);

  // Envío de mensajes
  const { sendMessage } = useSendMessage();

  // Recepción de mensajes en tiempo real
  useRealtimeChat({
    conversationId: conversation?.id,
    onMessageReceived: (newMessage) => {
      // Agregar mensaje automáticamente
      setMessages(prev => {
        const exists = prev.some(m => m.id === newMessage.id);
        if (!exists) {
          return [...prev, newMessage];
        }
        return prev;
      });
    }
  });

  return (
    <ChatWindow
      chat={selectedChat}
      conversation={conversation}
      messages={messages}
      onSendMessage={sendMessage}
      onUpdateClient={(client) => {}}
    />
  );
}
```

## Debugging y Logs

El sistema incluye logs detallados en la consola:

### Conexión Exitosa
```
✅ SocketIO conectado exitosamente
🎯 Joined tenant room successfully: { tenantId: 'tenant-1' }
```

### Mensaje Recibido
```
📨 Backend new message received: { conversationId: '123', message: {...}, timestamp: '...' }
✅ Transformed message: { id: '456', content: 'Hola', ... }
```

### Errores
```
❌ Tenant error: { error: 'Invalid tenant' }
❌ Error transforming backend message: Error: ...
```

## Prevención de Duplicados

El sistema incluye lógica para prevenir mensajes duplicados:

```typescript
setMessages(prev => {
  // Verificar si el mensaje ya existe
  const exists = prev.some(m => m.id === newMessage.id);
  if (exists) {
    console.log('⚠️ Mensaje duplicado ignorado:', newMessage.id);
    return prev;
  }

  return [...prev, newMessage];
});
```

## Variables de Entorno

Asegúrate de configurar la URL del WebSocket:

```env
# .env.local
NEXT_PUBLIC_WS_URL=http://127.0.0.1:3330
```

## Solución de Problemas

### Los mensajes no llegan

1. **Verificar conexión WebSocket:**
   ```typescript
   const { isConnected } = useSocket();
   console.log('WebSocket conectado:', isConnected);
   ```

2. **Verificar conexión al tenant:**
   ```typescript
   const { currentTenantId } = useSocket();
   console.log('Tenant conectado:', currentTenantId);
   ```

3. **Verificar que el listener está registrado:**
   - Buscar en la consola: "Registering listener for event: newMessage"

### Mensajes duplicados

- El sistema incluye prevención de duplicados por ID
- Si persiste el problema, revisa que no estés registrando múltiples listeners

### Mensajes de otros usuarios

- Los mensajes se filtran por tenant
- Verifica que el backend esté emitiendo al tenant correcto

### Transformación de mensajes falla

- Revisa el formato del payload del backend
- Verifica que todos los campos requeridos estén presentes
- Mira los logs: "❌ Error transforming backend message"

## Archivos Relevantes

1. **Tipos**: `src/types/inbox.ts` - Definiciones de tipos
2. **Transformador**: `src/lib/utils/messageTransformer.ts` - Lógica de transformación
3. **Hook**: `src/hooks/useRealtimeChat.ts` - Manejo de eventos
4. **Contexto**: `src/contexts/SocketIOContext.tsx` - Conexión WebSocket
5. **Provider**: `src/components/inbox/RealtimeChatProvider.tsx` - Provider de chat

## Testing

### Simular un Mensaje del Backend

Puedes simular un mensaje del backend desde la consola del navegador:

```javascript
// En la consola del navegador
const socket = window.__socket; // Si expones el socket globalmente

socket.emit('newMessage', {
  conversationId: '123',
  message: {
    id: Math.random(),
    chatSessionId: 123,
    contactId: 789,
    content: 'Mensaje de prueba',
    messageType: 'text',
    direction: 'outgoing',
    status: 1,
    respondedBy: 1,
    responderType: 'agent',
    tenantId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  timestamp: new Date().toISOString()
});
```

## Próximos Pasos

1. ✅ Integración de envío de mensajes
2. ✅ Recepción de mensajes en tiempo real
3. ⏳ Actualización de estados de mensajes (entregado, leído)
4. ⏳ Indicadores de escritura
5. ⏳ Notificaciones push
6. ⏳ Persistencia de mensajes en caché local
