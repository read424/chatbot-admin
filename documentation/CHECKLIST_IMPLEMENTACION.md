# ✅ Checklist de Implementación

## Sistema de Mensajería en Tiempo Real

---

## 📋 Implementación Básica

### 1. Configuración Inicial

- [ ] Variables de entorno configuradas
  ```env
  NEXT_PUBLIC_API_URL=http://api-tlm.localhost/api
  NEXT_PUBLIC_WS_URL=http://127.0.0.1:3330
  ```

- [ ] Dependencias instaladas
  ```bash
  npm install socket.io-client
  ```

### 2. Conexión al Tenant

- [ ] Implementado `useSocket()` en componente principal
- [ ] `connectToTenant()` llamado cuando `isConnected` es true
- [ ] TenantId obtenido correctamente (localStorage o auth context)
- [ ] Verificado en consola: `"🎯 Joined tenant room successfully"`

**Código de referencia:**
```typescript
const { connectToTenant, isConnected } = useSocket();

useEffect(() => {
  if (isConnected) {
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId) {
      connectToTenant(tenantId);
    }
  }
}, [isConnected, connectToTenant]);
```

### 3. Hook de Envío de Mensajes

- [ ] Importado `useSendMessage`
- [ ] Configurados callbacks `onSuccess` y `onError`
- [ ] Variable `sendMessage` extraída del hook
- [ ] Probado envío de mensaje de texto
- [ ] Verificado estado `isLoading`
- [ ] Manejados errores correctamente

**Código de referencia:**
```typescript
const { sendMessage, isLoading, error } = useSendMessage({
  onSuccess: (message) => {
    console.log('✅ Mensaje enviado:', message);
  },
  onError: (error) => {
    console.error('❌ Error:', error);
    alert(`Error: ${error.message}`);
  }
});
```

### 4. Hook de Recepción en Tiempo Real

- [ ] Importado `useRealtimeChat`
- [ ] Pasado `conversationId` correctamente
- [ ] Implementado callback `onMessageReceived`
- [ ] Prevención de duplicados implementada
- [ ] Mensajes agregados al estado correctamente

**Código de referencia:**
```typescript
useRealtimeChat({
  conversationId: conversation?.id,
  onMessageReceived: (newMessage) => {
    setMessages(prev => {
      // Prevenir duplicados
      if (prev.some(m => m.id === newMessage.id)) {
        return prev;
      }
      return [...prev, newMessage];
    });
  }
});
```

### 5. Integración con ChatWindow

- [ ] `ChatWindow` importado correctamente
- [ ] Prop `messages` conectada al estado
- [ ] Prop `onSendMessage` conectada a `sendMessage`
- [ ] Props `chat` y `conversation` pasadas correctamente
- [ ] ChatWindow renderiza mensajes correctamente

**Código de referencia:**
```typescript
<ChatWindow
  chat={selectedChat}
  conversation={conversation}
  messages={messages}
  onSendMessage={sendMessage}
  onUpdateClient={setSelectedChat}
/>
```

---

## 🧪 Pruebas Funcionales

### Envío de Mensajes

- [ ] Enviar mensaje de texto simple
  - [ ] Mensaje aparece en el chat
  - [ ] Estado cambia a "sending" → "sent"
  - [ ] Mensaje recibido vía WebSocket

- [ ] Enviar mensaje con archivos adjuntos
  - [ ] Archivos se suben correctamente
  - [ ] Mensaje aparece con archivos adjuntos
  - [ ] Validación de tamaño de archivo funciona (max 10MB)

- [ ] Responder a un mensaje
  - [ ] Indicador de respuesta aparece
  - [ ] Mensaje enviado con `replyTo` correcto

### Recepción de Mensajes

- [ ] Mensaje recibido aparece automáticamente
- [ ] No hay duplicados en la lista
- [ ] Mensajes se ordenan cronológicamente
- [ ] Transformación de datos funciona correctamente
  - [ ] `status` mapeado correctamente (0 → "sending", etc.)
  - [ ] `senderType` correcto (agent/bot/contact)

### WebSocket

- [ ] Indicador de conexión muestra "Conectado"
- [ ] Eventos aparecen en consola:
  - [ ] `"📨 Backend new message received"`
  - [ ] `"✅ Transformed message"`
- [ ] Reconexión automática funciona si se desconecta

---

## 🐛 Debugging

### Logs a Verificar

- [ ] Conexión WebSocket exitosa
  ```
  ✅ SocketIO conectado exitosamente
  🎯 Joined tenant room successfully: { tenantId: '...' }
  ```

- [ ] Envío de mensaje
  ```
  ✅ Mensaje enviado: { id: '...', content: '...', ... }
  ```

- [ ] Recepción de mensaje
  ```
  📨 Backend new message received: {...}
  ✅ Transformed message: {...}
  ```

### Problemas Comunes

- [ ] Si mensajes no llegan:
  - [ ] Verificar `isConnected === true`
  - [ ] Verificar `currentTenantId` no es null
  - [ ] Revisar consola del navegador para errores

- [ ] Si hay mensajes duplicados:
  - [ ] Verificar lógica de prevención de duplicados
  - [ ] Asegurar que no se agregan mensajes manualmente sin validar

- [ ] Si falla el envío:
  - [ ] Verificar que `conversationId` es válido
  - [ ] Verificar autenticación (token en localStorage)
  - [ ] Revisar error específico en `error.message`

---

## 📊 Verificación de Datos

### Formato de Mensaje Recibido

Verificar que el mensaje transformado tenga:

- [ ] `id` (string)
- [ ] `content` (string)
- [ ] `senderType` (contact | agent | bot | system)
- [ ] `conversationId` (string)
- [ ] `type` (text | image | file | audio | video | location | contact)
- [ ] `status` (sending | sent | delivered | read | failed)
- [ ] `timestamp` (ISO string)

### Mapeo de Estados

Verificar mapeo correcto:

| Backend | Frontend |
|---------|----------|
| 0       | sending  |
| 1       | sent     |
| 2       | delivered|
| 3       | read     |
| 4       | failed   |

---

## 🎨 UI/UX

- [ ] Indicador de "Conectado/Desconectado" visible
- [ ] Indicador de "Enviando mensaje..." mientras `isLoading`
- [ ] Mensajes propios alineados a la derecha
- [ ] Mensajes del contacto alineados a la izquierda
- [ ] Estados de mensaje visibles (✓, ✓✓, ✓✓ azul)
- [ ] Scroll automático al último mensaje
- [ ] Banner de error visible cuando falla el envío

---

## 🚀 Optimizaciones (Opcional)

- [ ] Implementar lazy loading de historial
- [ ] Agregar virtualización para listas largas
- [ ] Implementar caché local (IndexedDB)
- [ ] Agregar retry automático en caso de fallo
- [ ] Implementar indicadores de escritura
- [ ] Agregar notificaciones push
- [ ] Agregar sonidos de notificación

---

## 📚 Documentación Consultada

- [ ] Leído `QUICK_START.md`
- [ ] Consultado `SEND_MESSAGE_GUIDE.md` para detalles
- [ ] Revisado `WEBSOCKET_INTEGRATION.md` para WebSocket
- [ ] Ejemplos revisados en `COMPLETE_INTEGRATION_EXAMPLE.tsx`

---

## ✅ Checklist Final

### Desarrollo

- [ ] Código implementado según `QUICK_START.md`
- [ ] Pruebas funcionales completadas
- [ ] Logs de debug verificados
- [ ] Sin errores en consola

### Producción

- [ ] Variables de entorno de producción configuradas
- [ ] WebSocket URL apunta a servidor de producción
- [ ] Manejo de errores implementado
- [ ] Indicadores de conexión visibles al usuario

### Documentación

- [ ] Equipo informado de nuevas funcionalidades
- [ ] Documentación de API actualizada si es necesario
- [ ] README del proyecto actualizado

---

## 🎯 Criterios de Aceptación

El sistema está listo cuando:

✅ Un usuario puede enviar un mensaje y este aparece inmediatamente en su chat
✅ El mensaje se recibe en tiempo real vía WebSocket sin duplicados
✅ Los estados de los mensajes se actualizan correctamente
✅ Los errores se manejan y muestran al usuario de forma clara
✅ La conexión WebSocket se mantiene estable y reconecta automáticamente
✅ El indicador de conexión refleja el estado real
✅ No hay errores en la consola del navegador

---

## 📝 Notas

- Este checklist cubre la implementación básica
- Para funcionalidades avanzadas, consultar la documentación completa
- Si encuentras problemas, revisa `WEBSOCKET_INTEGRATION.md` sección "Troubleshooting"

---

## ✨ ¡Éxito!

Una vez completado este checklist, tu sistema de mensajería en tiempo real
está completamente funcional y listo para producción.

**Siguiente paso:** Implementar optimizaciones según las necesidades de tu aplicación.
