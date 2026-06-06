# Resumen de Implementación: Carga de Mensajes en ChatWindow

## Objetivo
Implementar la funcionalidad para cargar mensajes de una conversación desde el backend cuando el usuario hace clic en una conversación en el componente ChatList.

## Componentes Modificados

### 1. `/src/lib/api/index.ts`
- **Cambio**: Agregado export del `InboxService`
- **Razón**: Hacer disponible el servicio de inbox para ser usado por los hooks

### 2. `/src/app/dashboard/page.tsx`
- **Cambio**: Refactorización completa para usar el hook `useInbox`
- **Antes**: Usaba múltiples hooks (`useChat`, `useConversations`, `useRealtimeChat`, `useChatStore`)
- **Después**: Usa únicamente el hook `useInbox` que integra toda la funcionalidad

## Flujo de Datos

### 1. Selección de Conversación
```
Usuario hace clic en conversación
    ↓
ChatList.onSelectConversation(conversation)
    ↓
handleSelectConversation(conversation)
    ↓
useInbox.selectConversation(conversation.id)
```

### 2. Carga de Mensajes (dentro de useInbox)
```typescript
selectConversation(conversationId) {
    // 1. Buscar conversación en el estado
    const conversation = conversations.find(c => c.id === conversationId);

    // 2. Actualizar conversación seleccionada
    setSelectedConversation(conversation);

    // 3. Cargar mensajes desde el backend
    await loadMessages(conversationId);

    // 4. Marcar como leída si tiene mensajes no leídos
    if (conversation.unreadCount > 0) {
        await markAsRead(conversationId);
    }
}
```

### 3. Llamada al Backend
```typescript
loadMessages(conversationId, page = 1) {
    // Llamada al servicio
    const response = await inboxService.getMessages(conversationId, {
        page,
        limit: 50
    });

    // Endpoint: GET /api/inbox/conversations/{conversationId}/messages
    // Response: {
    //   messages: Message[],
    //   total: number,
    //   page: number,
    //   limit: number,
    //   hasMore: boolean
    // }

    // Actualizar estado con los mensajes
    setMessages(response.messages);
}
```

### 4. Renderización en ChatWindow
```
useInbox.messages (estado actualizado)
    ↓
ChatWindow.messages (prop)
    ↓
Renderiza cada mensaje en la interfaz
```

## Servicios Utilizados

### InboxService (`/src/lib/api/services/inbox.ts`)
Ya existente, contiene el método `getMessages`:

```typescript
async getMessages(
    conversationId: string,
    params: MessageQueryParams
): Promise<MessageListResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', params.page.toString());
    queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<MessageListResponse>(
        `/api/inbox/conversations/${conversationId}/messages?${queryParams}`
    );

    return response.data;
}
```

## Hooks Utilizados

### useInbox (`/src/hooks/useInbox.ts`)
Hook principal que gestiona:
- ✅ Carga de conversaciones
- ✅ Selección de conversaciones
- ✅ Carga automática de mensajes al seleccionar
- ✅ Envío de mensajes
- ✅ Eventos en tiempo real (WebSocket)
- ✅ Filtros y búsqueda
- ✅ Indicadores de escritura
- ✅ Paginación de mensajes

## Tipos Utilizados

### Message (`/src/types/inbox.ts`)
```typescript
interface Message {
    id: string;
    conversationId: string;
    content: string;
    type: MessageType;
    senderId: string;
    receiverId: string;
    senderName?: string;
    senderType: MessageSenderType;
    channel: ProviderType;
    status: MessageStatus;
    timestamp: string;
    metadata?: MessageMetadata;
    replyTo?: string;
    isEdited: boolean;
    editedAt?: string;
    createdAt: string;
    updatedAt: string;
    isRead: boolean;
}
```

### MessageListResponse
```typescript
interface MessageListResponse {
    messages: Message[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
```

## Beneficios de la Implementación

1. **Código más limpio**: Un solo hook en lugar de múltiples hooks dispersos
2. **Mejor rendimiento**: Carga mensajes solo cuando se selecciona una conversación
3. **Paginación lista**: El hook ya soporta `loadMoreMessages()` para scroll infinito
4. **Tiempo real**: Integración con WebSocket para mensajes en vivo
5. **Gestión de estado centralizada**: Todo el estado del inbox en un solo lugar
6. **Marcado automático como leído**: Cuando se selecciona una conversación con mensajes no leídos

## Próximos Pasos (Opcionales)

1. **Implementar scroll infinito**: Usar `loadMoreMessages()` cuando el usuario scrollea hacia arriba
2. **Optimizar carga inicial**: Considerar usar React Query para caché
3. **Añadir loading states**: Mostrar skeletons mientras cargan los mensajes
4. **Implementar retry logic**: Reintentar carga si falla
5. **Añadir toast notifications**: Mostrar errores al usuario de forma amigable

## Testing

Para probar la implementación:

1. **Iniciar el servidor backend** (debe estar corriendo en el puerto configurado)
2. **Iniciar la aplicación Next.js**: `npm run dev`
3. **Navegar al dashboard**: `/dashboard`
4. **Hacer clic en una conversación** en ChatList
5. **Verificar que**:
   - Los mensajes se cargan en ChatWindow
   - El endpoint correcto es llamado: `GET /api/inbox/conversations/{id}/messages`
   - Los mensajes se muestran ordenados correctamente
   - El contador de no leídos se actualiza

## Solución de Problemas

### Los mensajes no se cargan
- Verificar que el backend esté corriendo
- Revisar la consola del navegador para errores
- Verificar la respuesta del endpoint en Network tab
- Confirmar que el token de autenticación es válido

### Error de tipos de TypeScript
- Ejecutar `npm run build` para ver errores
- Verificar que todos los tipos estén correctamente importados

### WebSocket no conecta
- Revisar configuración de SocketIO en el contexto
- Verificar URL del servidor WebSocket
- Comprobar que el servidor soporte WebSocket

## Referencias

- Hook useInbox: `/src/hooks/useInbox.ts`
- Servicio Inbox: `/src/lib/api/services/inbox.ts`
- Tipos: `/src/types/inbox.ts`
- Componente ChatList: `/src/components/inbox/ChatList.tsx`
- Componente ChatWindow: `/src/components/inbox/ChatWindow.tsx`