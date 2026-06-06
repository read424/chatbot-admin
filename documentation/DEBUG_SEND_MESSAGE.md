# 🐛 Debug: Error 401 al Enviar Mensaje

## Problema Detectado

La aplicación redirige al login (error 401) al intentar enviar un mensaje.

## Causas Posibles

### 1. Token de Autenticación

**Verificar:**
```javascript
// En la consola del navegador
console.log('Token:', localStorage.getItem('token'));
console.log('TenantId:', localStorage.getItem('tenantId'));
```

**Debe mostrar:**
- Token: Un string largo (JWT)
- TenantId: Un número o string

### 2. Formato del Body

El backend podría estar esperando un formato diferente. Vamos a verificar.

**Formato actual que enviamos:**
```json
{
  "conversationId": "123",
  "content": "Hola",
  "type": "text",
  "replyTo": null,
  "metadata": {}
}
```

**Posibles formatos que el backend podría esperar:**

**Opción A - Con chatSessionId:**
```json
{
  "chatSessionId": 123,  // En lugar de conversationId
  "content": "Hola",
  "messageType": "text",  // En lugar de type
}
```

**Opción B - Estructura anidada:**
```json
{
  "message": {
    "conversationId": "123",
    "content": "Hola",
    "type": "text"
  }
}
```

## 🔍 Cómo Debuggear

### Paso 1: Ver la Petición en el Network Tab

1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Filtra por **Fetch/XHR**
4. Intenta enviar un mensaje
5. Busca la petición `send-message`
6. Revisa:
   - **Headers** → Debe tener `Authorization: Bearer ...`
   - **Payload** → Ver qué se está enviando
   - **Response** → Ver el error exacto del backend

### Paso 2: Ver Logs en Consola

Abre la consola y busca:

```
📤 Sending message: {...}
❌ Error al enviar mensaje: {...}
```

### Paso 3: Verificar URL del Endpoint

El endpoint actual es:
```
POST /chat/send-message
```

URL completa:
```
http://api-tlm.localhost/api/chat/send-message
```

**Verificar:**
- ¿El endpoint correcto es `/chat/send-message` o `/api/chat/send-message`?
- ¿Necesita `/api/v1/chat/send-message`?

## 🔧 Soluciones

### Solución 1: Agregar Logs de Debug

Modifica temporalmente `useSendMessage.ts`:

```typescript
const sendMessage = useCallback(async (request: SendMessageRequest): Promise<Message | null> => {
  try {
    setIsLoading(true);
    setError(null);

    // 🔍 DEBUG: Ver qué se está enviando
    console.log('🔍 DEBUG - Request:', request);
    console.log('🔍 DEBUG - Token:', localStorage.getItem('token')?.substring(0, 20) + '...');
    console.log('🔍 DEBUG - TenantId:', localStorage.getItem('tenantId'));

    // Enviar mensaje
    const message = await inboxService.sendChatMessage(request);

    console.log('✅ DEBUG - Response:', message);

    options?.onSuccess?.(message);
    return message;
  } catch (err) {
    console.error('❌ DEBUG - Error completo:', err);
    // ... resto del código
  }
}, [options]);
```

### Solución 2: Verificar Formato del Backend

Si el backend espera `chatSessionId` en lugar de `conversationId`:

```typescript
// En inbox.ts
async sendChatMessage(request: SendMessageRequest): Promise<Message> {
  const response = await apiClient.post<{ data: Message }>(
    '/chat/send-message',
    {
      chatSessionId: parseInt(request.conversationId), // 👈 Cambiar aquí
      content: request.content,
      messageType: request.type || 'text', // 👈 messageType en vez de type
      // Agregar otros campos que el backend necesite
    }
  );
  return response.data.data;
}
```

### Solución 3: Usar el Endpoint Correcto

Si el endpoint real es diferente, actualizar en `inbox.ts`:

```typescript
// Opción A: Usar endpoint de inbox
async sendChatMessage(request: SendMessageRequest): Promise<Message> {
  const response = await apiClient.post<{ data: Message }>(
    `/inbox/conversations/${request.conversationId}/messages`, // 👈 Cambiar aquí
    {
      content: request.content,
      type: request.type || 'text',
    }
  );
  return response.data.data;
}

// Opción B: Usar endpoint específico
async sendChatMessage(request: SendMessageRequest): Promise<Message> {
  const response = await apiClient.post<{ data: Message }>(
    '/api/messages/send', // 👈 Cambiar aquí
    {
      // Formato que espera el backend
    }
  );
  return response.data.data;
}
```

### Solución 4: Headers Adicionales

Si el backend necesita headers específicos:

```typescript
async sendChatMessage(request: SendMessageRequest): Promise<Message> {
  const response = await apiClient.post<{ data: Message }>(
    '/chat/send-message',
    {
      conversationId: request.conversationId,
      content: request.content,
      type: request.type || 'text',
    },
    {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // Agregar otros headers si son necesarios
    }
  );
  return response.data.data;
}
```

## 📋 Checklist de Verificación

- [ ] Token existe en localStorage
- [ ] TenantId existe en localStorage
- [ ] URL del endpoint es correcta
- [ ] Formato del body coincide con lo que espera el backend
- [ ] Headers se envían correctamente
- [ ] El backend está corriendo y accesible

## 🎯 Información que Necesito

Para ayudarte mejor, necesito saber:

1. **¿Qué muestra el Network Tab?**
   - Request URL completa
   - Request Headers (especialmente Authorization)
   - Request Payload
   - Response Status
   - Response Body

2. **¿Qué formato espera el backend?**
   - ¿Cómo se llama el campo: `conversationId` o `chatSessionId`?
   - ¿Qué otros campos son requeridos?
   - ¿El tipo de mensaje se llama `type` o `messageType`?

3. **¿Cuál es el endpoint correcto?**
   - `/chat/send-message`
   - `/api/chat/send-message`
   - `/inbox/conversations/:id/messages`
   - Otro?

4. **¿Hay documentación del endpoint?**
   - Swagger/OpenAPI
   - Documentación interna
   - Ejemplo de curl

## 🚀 Siguiente Paso

1. Abre DevTools → Network
2. Intenta enviar un mensaje
3. Captura la información de la petición fallida
4. Compártela para ajustar el código

## 💡 Tip Rápido

Para probar el endpoint directamente:

```javascript
// En la consola del navegador
const token = localStorage.getItem('token');
const tenantId = localStorage.getItem('tenantId');

fetch('http://api-tlm.localhost/api/chat/send-message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Tenant-Id': tenantId
  },
  body: JSON.stringify({
    conversationId: "TU_CONVERSATION_ID_AQUI",
    content: "Test message",
    type: "text"
  })
})
.then(r => r.json())
.then(d => console.log('✅ Success:', d))
.catch(e => console.error('❌ Error:', e));
```

Si esto funciona, el problema está en cómo estamos llamando al endpoint.
Si esto falla con 401, el problema es de autenticación o formato de body.
