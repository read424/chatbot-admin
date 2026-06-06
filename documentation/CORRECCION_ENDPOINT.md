# ✅ Corrección: Endpoint Incorrecto

## Problema Encontrado

Al hacer click en "Enviar mensaje", se estaba llamando a:
```
POST /api/inbox/conversations/1/messages  ❌ (incorrecto)
```

En lugar de:
```
POST /api/chat/send-message  ✅ (correcto)
```

## Causa del Problema

En `src/lib/api/services/inbox.ts` existen **DOS métodos** para enviar mensajes:

### Método 1: sendMessage() ❌
```typescript
async sendMessage(request: SendMessageRequest): Promise<Message> {
  const response = await apiClient.post<{ data: Message }>(
    `${this.basePath}/conversations/${request.conversationId}/messages`,
    // ...
  );
  return response.data.data;
}
```
**Endpoint:** `/inbox/conversations/:id/messages`

### Método 2: sendChatMessage() ✅
```typescript
async sendChatMessage(request: SendMessageRequest): Promise<Message> {
  const response = await apiClient.post<{ data: Message }>(
    '/chat/send-message',
    // ...
  );
  return response.data.data;
}
```
**Endpoint:** `/chat/send-message`

## Corrección Aplicada

### Archivo: `src/hooks/useInbox.ts` (línea 242)

**Antes:**
```typescript
const sendMessage = useCallback(async (request: SendMessageRequest) => {
  try {
    await inboxService.sendMessage(request);  // ❌ Método incorrecto
    // ...
  }
});
```

**Después:**
```typescript
const sendMessage = useCallback(async (request: SendMessageRequest) => {
  try {
    // Usar sendChatMessage que apunta a /api/chat/send-message
    await inboxService.sendChatMessage(request);  // ✅ Método correcto
    // ...
  }
});
```

## Verificación

Ahora cuando envíes un mensaje, deberías ver en el Network Tab:

```
Request URL: http://127.0.0.1:3330/api/chat/send-message
Method: POST
```

## Archivos Modificados

✅ `src/hooks/useInbox.ts` - Línea 242

## Próximos Pasos

1. Recarga la aplicación (Ctrl+R o Cmd+R)
2. Intenta enviar un mensaje nuevamente
3. Verifica en Network Tab que use `/api/chat/send-message`
4. Debería funcionar correctamente ahora

## Notas

- **`sendMessage()`** se mantiene para compatibilidad con otros endpoints
- **`sendChatMessage()`** es el método correcto para tu caso de uso
- Ambos métodos están en `src/lib/api/services/inbox.ts`

## ¿Por qué existían dos métodos?

- `sendMessage()` es el endpoint estándar RESTful de inbox
- `sendChatMessage()` es el endpoint específico que creamos para tu backend

La confusión ocurrió porque `useInbox.ts` estaba usando el método antiguo.

---

**Estado:** ✅ Corregido y listo para probar
