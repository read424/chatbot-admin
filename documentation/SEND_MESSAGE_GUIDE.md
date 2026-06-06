# Guía de Envío de Mensajes

Esta guía explica cómo usar el sistema de envío de mensajes implementado en el proyecto.

## Estructura del Sistema

### 1. Tipos (`src/types/inbox.ts`)

Ya están definidos los siguientes tipos:

```typescript
// Solicitud básica para enviar un mensaje
export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type?: MessageType;
  replyTo?: string;
  metadata?: Partial<MessageMetadata>;
}

// Solicitud para enviar mensaje con archivos adjuntos
export interface SendMessageWithAttachmentsRequest extends SendMessageRequest {
  attachments?: File[];
}
```

### 2. Servicio API (`src/lib/api/services/inbox.ts`)

Se agregó un nuevo método `sendChatMessage` que usa el endpoint `/api/chat/send-message`:

```typescript
/**
 * Send a message via chat endpoint
 * Endpoint: POST /api/chat/send-message
 */
async sendChatMessage(request: SendMessageRequest): Promise<Message>
```

### 3. Hook `useSendMessage` (`src/hooks/useSendMessage.ts`)

Hook personalizado para manejar el envío de mensajes con estado de loading y manejo de errores.

## Cómo Usar

### Opción 1: Usando el Hook (Recomendado)

```typescript
import { useSendMessage } from '@/hooks/useSendMessage';
import type { SendMessageRequest } from '@/types/inbox';

function ChatComponent() {
  const { sendMessage, sendMessageWithAttachments, isLoading, error } = useSendMessage({
    onSuccess: (message) => {
      console.log('Mensaje enviado exitosamente:', message);
      // Actualizar UI, agregar mensaje a la lista, etc.
    },
    onError: (error) => {
      console.error('Error al enviar mensaje:', error);
      // Mostrar notificación de error al usuario
    }
  });

  const handleSendTextMessage = async () => {
    const request: SendMessageRequest = {
      conversationId: 'conv-123',
      content: 'Hola, ¿cómo estás?',
      type: 'text'
    };

    await sendMessage(request);
  };

  const handleSendMessageWithAttachments = async (files: File[]) => {
    const request = {
      conversationId: 'conv-123',
      content: 'Te envío estos archivos',
      type: 'file',
      attachments: files
    };

    await sendMessageWithAttachments(request);
  };

  return (
    <div>
      {isLoading && <p>Enviando mensaje...</p>}
      {error && <p>Error: {error.message}</p>}
      {/* Tu UI aquí */}
    </div>
  );
}
```

### Opción 2: Usando el Servicio Directamente

```typescript
import { inboxService } from '@/lib/api/services/inbox';
import type { SendMessageRequest } from '@/types/inbox';

async function sendMessage() {
  try {
    const request: SendMessageRequest = {
      conversationId: 'conv-123',
      content: 'Hola mundo',
      type: 'text'
    };

    const message = await inboxService.sendChatMessage(request);
    console.log('Mensaje enviado:', message);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Opción 3: Integración con MessageInput (Ya implementado)

El componente `MessageInput` ya está preparado para usar el sistema:

```typescript
import { MessageInput } from '@/components/inbox/MessageInput';
import { useSendMessage } from '@/hooks/useSendMessage';

function ChatWindow() {
  const { sendMessage, sendMessageWithAttachments } = useSendMessage({
    onSuccess: (message) => {
      // Agregar mensaje a la lista de mensajes
      setMessages(prev => [...prev, message]);
    }
  });

  return (
    <MessageInput
      conversationId="conv-123"
      onSendMessage={sendMessage}
      onSendMessageWithAttachments={sendMessageWithAttachments}
    />
  );
}
```

## Ejemplos de Uso

### Enviar Mensaje de Texto Simple

```typescript
const request: SendMessageRequest = {
  conversationId: 'abc-123',
  content: '¡Hola! ¿En qué puedo ayudarte?',
  type: 'text'
};

await sendMessage(request);
```

### Enviar Mensaje en Respuesta a Otro

```typescript
const request: SendMessageRequest = {
  conversationId: 'abc-123',
  content: 'Respondiendo a tu pregunta...',
  type: 'text',
  replyTo: 'message-id-456' // ID del mensaje al que se responde
};

await sendMessage(request);
```

### Enviar Mensaje con Imágenes

```typescript
const request: SendMessageWithAttachmentsRequest = {
  conversationId: 'abc-123',
  content: 'Aquí están las imágenes que solicitaste',
  type: 'image',
  attachments: [file1, file2] // Array de objetos File
};

await sendMessageWithAttachments(request);
```

### Enviar Mensaje con Metadata Personalizada

```typescript
const request: SendMessageRequest = {
  conversationId: 'abc-123',
  content: 'Mensaje con metadata',
  type: 'text',
  metadata: {
    mentions: ['user-123', 'user-456'],
    originalChannel: 'whatsapp'
  }
};

await sendMessage(request);
```

## Manejo de Errores

El hook `useSendMessage` maneja automáticamente los errores y proporciona:

1. **Validaciones automáticas**:
   - Verifica que `conversationId` esté presente
   - Verifica que el contenido no esté vacío
   - Valida el tamaño de archivos (máximo 10MB)

2. **Estados de error**:
   ```typescript
   const { error } = useSendMessage();

   if (error) {
     console.log(error.message); // Mensaje descriptivo del error
   }
   ```

3. **Callbacks personalizados**:
   ```typescript
   const { sendMessage } = useSendMessage({
     onError: (error) => {
       // Manejo personalizado del error
       toast.error(error.message);
       logErrorToSentry(error);
     }
   });
   ```

## Endpoint de Backend

El sistema usa el endpoint:
- **URL**: `POST /api/chat/send-message`
- **Body**:
  ```json
  {
    "conversationId": "string",
    "content": "string",
    "type": "text" | "image" | "file" | "audio" | "video" | "location" | "contact",
    "replyTo": "string (opcional)",
    "metadata": {
      // Metadata opcional
    }
  }
  ```
- **Response**:
  ```json
  {
    "data": {
      "id": "string",
      "content": "string",
      "conversationId": "string",
      "timestamp": "string",
      "status": "sending" | "sent" | "delivered" | "read" | "failed",
      // ... otros campos del mensaje
    }
  }
  ```

## Notas Importantes

1. **Autenticación**: El `apiClient` automáticamente agrega el token de autenticación desde `localStorage`
2. **Tenant ID**: Se agrega automáticamente el header `X-Tenant-Id` en todas las peticiones
3. **Validación de archivos**: El tamaño máximo por archivo es 10MB
4. **Tipos de archivo permitidos**: Imágenes, PDFs, documentos de Word, archivos de texto
5. **Timeout**: Las peticiones tienen un timeout de 10 segundos por defecto

## Integración con WebSocket (Opcional)

Para recibir actualizaciones en tiempo real del estado del mensaje:

```typescript
import { useSocket } from '@/contexts/SocketIOContext';

function ChatComponent() {
  const { socket } = useSocket();
  const { sendMessage } = useSendMessage();

  useEffect(() => {
    if (!socket) return;

    // Escuchar actualizaciones de estado del mensaje
    socket.on('message_sent', (data) => {
      console.log('Mensaje enviado:', data);
    });

    socket.on('message_delivered', (data) => {
      console.log('Mensaje entregado:', data);
    });

    socket.on('message_read', (data) => {
      console.log('Mensaje leído:', data);
    });

    return () => {
      socket.off('message_sent');
      socket.off('message_delivered');
      socket.off('message_read');
    };
  }, [socket]);

  // ... resto del componente
}
```

## Archivos Modificados/Creados

1. **Creado**: `src/hooks/useSendMessage.ts` - Hook para envío de mensajes
2. **Modificado**: `src/lib/api/services/inbox.ts` - Agregado método `sendChatMessage`
3. **Sin cambios**: `src/types/inbox.ts` - Los tipos ya estaban correctamente definidos
4. **Sin cambios**: `src/components/inbox/MessageInput.tsx` - Ya estaba preparado para usar el sistema

## Troubleshooting

### El mensaje no se envía
- Verifica que el `conversationId` sea válido
- Asegúrate de que el usuario esté autenticado
- Revisa la consola del navegador para ver errores específicos

### Error 401 (No autorizado)
- El token de autenticación expiró o es inválido
- El sistema redirigirá automáticamente a `/login`

### Error 413 (Archivo muy grande)
- Los archivos exceden el tamaño máximo de 10MB
- Comprime las imágenes o divide los archivos

### Timeout en la petición
- La conexión es lenta o el servidor no responde
- Verifica la conectividad de red