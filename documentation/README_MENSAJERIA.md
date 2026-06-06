# 📬 Sistema de Mensajería en Tiempo Real

## 🎯 Descripción

Sistema completo de mensajería que combina:
- **API REST** para envío de mensajes
- **WebSocket** para recepción en tiempo real
- **Transformación automática** de formatos backend ↔ frontend
- **Prevención de duplicados**
- **Manejo robusto de errores**

---

## 📚 Índice de Documentación

### 🚀 Para Empezar

1. **[QUICK_START.md](./QUICK_START.md)** ⭐ **COMIENZA AQUÍ**
   - Implementación en 3 pasos
   - Código completo copy-paste
   - Solución de problemas comunes

### 📖 Guías Detalladas

2. **[SEND_MESSAGE_GUIDE.md](./SEND_MESSAGE_GUIDE.md)**
   - Cómo enviar mensajes
   - Estructura del sistema
   - Tipos disponibles
   - Ejemplos de uso

3. **[WEBSOCKET_INTEGRATION.md](./WEBSOCKET_INTEGRATION.md)**
   - Flujo de funcionamiento
   - Estructura de payloads del backend
   - Arquitectura de componentes
   - Debugging y logs

4. **[RESUMEN_IMPLEMENTACION.md](./RESUMEN_IMPLEMENTACION.md)**
   - Resumen completo de la implementación
   - Archivos creados/modificados
   - Características implementadas
   - Próximos pasos

### 💻 Ejemplos de Código

5. **[INTEGRATION_EXAMPLE.tsx](./INTEGRATION_EXAMPLE.tsx)**
   - Ejemplos básicos de integración
   - Uso con MessageInput
   - Patrones recomendados

6. **[COMPLETE_INTEGRATION_EXAMPLE.tsx](./COMPLETE_INTEGRATION_EXAMPLE.tsx)**
   - 5 ejemplos completos
   - Manejo avanzado de estados
   - Hook personalizado combinado
   - Manejo de reconexión

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │  ChatWindow  │         │ MessageInput │                  │
│  └──────┬───────┘         └──────┬───────┘                  │
│         │                        │                           │
│         │                        │                           │
│  ┌──────▼────────────────────────▼───────┐                  │
│  │      useSendMessage Hook               │                  │
│  │  - sendMessage()                       │                  │
│  │  - sendMessageWithAttachments()        │                  │
│  └──────┬─────────────────────────────────┘                  │
│         │                                                     │
│         │ POST /api/chat/send-message                        │
│         ▼                                                     │
├─────────────────────────────────────────────────────────────┤
│                         BACKEND                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Recibe mensaje                                           │
│  2. Guarda en base de datos                                  │
│  3. Emite evento WebSocket                                   │
│     - Evento: 'newMessage'                                   │
│     - Canal: tenantId                                        │
│                                                               │
│         │                                                     │
│         │ WebSocket Event                                    │
│         ▼                                                     │
├─────────────────────────────────────────────────────────────┤
│                         FRONTEND                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────┐                   │
│  │     useRealtimeChat Hook             │                   │
│  │  Escucha evento 'newMessage'         │                   │
│  └──────┬───────────────────────────────┘                   │
│         │                                                     │
│         ▼                                                     │
│  ┌──────────────────────────────────────┐                   │
│  │   messageTransformer                 │                   │
│  │  Backend format → Frontend format    │                   │
│  └──────┬───────────────────────────────┘                   │
│         │                                                     │
│         ▼                                                     │
│  ┌──────────────────────────────────────┐                   │
│  │   onMessageReceived callback         │                   │
│  │  Agrega mensaje a la lista           │                   │
│  └──────────────────────────────────────┘                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Archivos del Sistema

### Código de Producción

```
src/
├── hooks/
│   ├── useSendMessage.ts          ⭐ Hook para enviar mensajes
│   ├── useRealtimeChat.ts          ✏️ Actualizado con evento 'newMessage'
│   └── useConversations.ts         Manejo de conversaciones
│
├── lib/
│   ├── api/
│   │   ├── services/
│   │   │   └── inbox.ts            ✏️ Agregado sendChatMessage()
│   │   └── client.ts               Cliente API base
│   │
│   └── utils/
│       └── messageTransformer.ts   ⭐ Transformación backend ↔ frontend
│
├── types/
│   └── inbox.ts                    ✏️ Agregados tipos del backend
│
├── contexts/
│   └── SocketIOContext.tsx         Contexto WebSocket
│
└── components/
    └── inbox/
        ├── ChatWindow.tsx          Ventana de chat
        ├── MessageInput.tsx        Input de mensajes
        └── RealtimeChatProvider.tsx Provider de tiempo real
```

⭐ = Nuevo archivo
✏️ = Archivo modificado

### Documentación

```
├── QUICK_START.md                    ⭐ Guía rápida (EMPIEZA AQUÍ)
├── SEND_MESSAGE_GUIDE.md            ⭐ Guía de envío de mensajes
├── WEBSOCKET_INTEGRATION.md         ⭐ Integración WebSocket
├── RESUMEN_IMPLEMENTACION.md        ⭐ Resumen completo
├── INTEGRATION_EXAMPLE.tsx          ⭐ Ejemplos básicos
├── COMPLETE_INTEGRATION_EXAMPLE.tsx ⭐ Ejemplos avanzados
└── README_MENSAJERIA.md             ⭐ Este archivo
```

---

## 🚀 Uso Rápido

### 1. Instalar Dependencias

```bash
npm install socket.io-client
```

### 2. Configurar Variables de Entorno

```env
# .env.local
NEXT_PUBLIC_API_URL=http://api-tlm.localhost/api
NEXT_PUBLIC_WS_URL=http://127.0.0.1:3330
```

### 3. Implementar en tu Componente

Ver **[QUICK_START.md](./QUICK_START.md)** para código completo.

```typescript
import { useSendMessage } from '@/hooks/useSendMessage';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';

// Enviar
const { sendMessage } = useSendMessage();
await sendMessage({ conversationId, content, type: 'text' });

// Recibir
useRealtimeChat({
  conversationId,
  onMessageReceived: (msg) => setMessages(prev => [...prev, msg])
});
```

---

## ✨ Características

### ✅ Envío de Mensajes
- [x] Mensajes de texto
- [x] Mensajes con archivos (hasta 10MB)
- [x] Responder a mensajes
- [x] Metadata personalizada
- [x] Validaciones automáticas
- [x] Manejo de errores

### ✅ Recepción en Tiempo Real
- [x] WebSocket con Socket.IO
- [x] Escucha evento `newMessage`
- [x] Transformación automática
- [x] Prevención de duplicados
- [x] Multi-tenant (por tenantId)

### ✅ UI/UX
- [x] Estados de loading
- [x] Indicadores de error
- [x] Actualización automática
- [x] Mensajes ordenados
- [x] Estados de mensaje (enviado, entregado, leído)

---

## 🔄 Flujo de Datos

### Envío de Mensaje

```
Usuario escribe → useSendMessage → POST /api/chat/send-message
                                            ↓
                                    Backend guarda mensaje
                                            ↓
                              WebSocket emit 'newMessage'
```

### Recepción de Mensaje

```
WebSocket 'newMessage' → useRealtimeChat → messageTransformer
                                                  ↓
                                        Frontend Message
                                                  ↓
                                        Append to messages[]
                                                  ↓
                                          UI actualizada
```

---

## 🎯 Estructura de Datos

### Mensaje del Backend (WebSocket)

```typescript
{
  conversationId: "123",
  message: {
    id: 456,
    content: "Hola",
    messageType: "text",
    direction: "outgoing",
    status: 0,  // 0=sending, 1=sent, 2=delivered, 3=read
    responderType: "agent",
    // ... más campos
  },
  timestamp: "2025-01-15T10:30:00.000Z"
}
```

### Mensaje del Frontend (Transformado)

```typescript
{
  id: "456",
  content: "Hola",
  senderType: "agent",
  conversationId: "123",
  type: "text",
  status: "sending",
  // ... más campos
}
```

---

## 🧪 Testing

### Test Manual

1. Abrir la aplicación en el navegador
2. Abrir la consola del navegador
3. Enviar un mensaje
4. Verificar logs:
   ```
   ✅ Mensaje enviado: {...}
   📨 Backend new message received: {...}
   ✅ Transformed message: {...}
   ```

### Test de Duplicados

El sistema automáticamente previene duplicados comparando IDs.

---

## 🐛 Troubleshooting

### Problema: Mensajes no llegan

**Solución:**
1. Verificar conexión WebSocket (debe mostrar 🟢 Conectado)
2. Verificar que estés conectado al tenant correcto
3. Revisar consola del navegador para errores

### Problema: Mensajes duplicados

**Solución:**
- El sistema ya previene duplicados
- Si persiste, verificar que no agregues mensajes manualmente sin validar

### Problema: Error al enviar

**Solución:**
1. Verificar que `conversationId` sea válido
2. Verificar autenticación del usuario
3. Revisar error específico en consola

---

## 📊 Mapeo de Estados

| Backend (number) | Frontend (string) |
|------------------|-------------------|
| 0                | sending           |
| 1                | sent              |
| 2                | delivered         |
| 3                | read              |
| 4                | failed            |

---

## 🎨 Componentes Principales

1. **useSendMessage** - Hook para enviar mensajes
2. **useRealtimeChat** - Hook para recibir mensajes en tiempo real
3. **messageTransformer** - Utilidad de transformación
4. **SocketIOContext** - Contexto de conexión WebSocket
5. **ChatWindow** - Componente visual del chat
6. **MessageInput** - Input para escribir mensajes

---

## 🚧 Próximos Pasos

### Implementado ✅
- [x] Envío de mensajes
- [x] Recepción en tiempo real
- [x] Transformación de datos
- [x] Prevención de duplicados
- [x] Manejo de errores

### Por Implementar 🔜
- [ ] Actualización de estados (entregado → leído)
- [ ] Indicadores de escritura
- [ ] Notificaciones push
- [ ] Caché local de mensajes
- [ ] Retry automático en caso de fallo

---

## 👥 Soporte

Si tienes problemas:

1. **Lee QUICK_START.md** - Implementación paso a paso
2. **Revisa la consola** - Logs detallados de cada evento
3. **Verifica la conexión** - WebSocket debe estar conectado
4. **Valida el tenant** - Debe coincidir con el backend

---

## 📝 Notas Importantes

- El sistema está listo para producción
- Incluye manejo de errores robusto
- Previene duplicados automáticamente
- Logs detallados para debugging
- Documentación completa

---

## 🎉 ¡Listo para usar!

El sistema está completamente implementado y documentado.

**Empieza con:** [QUICK_START.md](./QUICK_START.md)

**¿Dudas?** Revisa los ejemplos en:
- [INTEGRATION_EXAMPLE.tsx](./INTEGRATION_EXAMPLE.tsx)
- [COMPLETE_INTEGRATION_EXAMPLE.tsx](./COMPLETE_INTEGRATION_EXAMPLE.tsx)
