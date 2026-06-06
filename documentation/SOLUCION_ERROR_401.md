# 🔧 Solución: Error 401 al Enviar Mensaje

## Pasos para Resolver

### 1. ️ Ver Logs de Debug

He agregado logs detallados en el hook `useSendMessage`. Ahora cuando envíes un mensaje verás en la consola:

```
🔍 DEBUG useSendMessage - Request: {...}
🔍 DEBUG useSendMessage - Token exists: true/false
🔍 DEBUG useSendMessage - TenantId: ...
📤 Enviando mensaje al backend...
```

**Si falla:**
```
❌ DEBUG useSendMessage - Error completo: {...}
❌ DEBUG useSendMessage - Error status: 401
❌ DEBUG useSendMessage - Error details: {...}
```

### 2. 🔍 Revisar el Network Tab

1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Limpia el log (icono 🚫)
4. Intenta enviar un mensaje
5. Busca la petición `send-message`

**Información que necesito:**

#### Request Headers
```
Authorization: Bearer eyJhbGc...  (debe existir)
X-Tenant-Id: 1  (debe existir)
Content-Type: application/json
```

#### Request Payload
```json
{
  "conversationId": "...",
  "content": "...",
  "type": "text"
}
```

#### Response
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### 3. 🧪 Test Rápido del Endpoint

Abre la consola del navegador (F12 → Console) y ejecuta:

```javascript
// Verificar token y tenantId
console.log('Token:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
console.log('TenantId:', localStorage.getItem('tenantId'));

// Test del endpoint
const token = localStorage.getItem('token');
const tenantId = localStorage.getItem('tenantId');

fetch('http://127.0.0.1:3330/api/chat/send-message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Tenant-Id': tenantId || ''
  },
  body: JSON.stringify({
    conversationId: "1", // Cambiar por un ID válido
    content: "Test message",
    type: "text"
  })
})
.then(async (response) => {
  console.log('Status:', response.status);
  const data = await response.json();
  console.log('Response:', data);
  return data;
})
.catch(error => {
  console.error('Error:', error);
});
```

**Posibles resultados:**

#### ✅ Si funciona (200 OK):
```json
{
  "data": {
    "id": 123,
    "content": "Test message",
    ...
  }
}
```
→ **El endpoint funciona, el problema está en el código**

#### ❌ Si falla con 401:
```json
{
  "message": "Token inválido",
  "statusCode": 401
}
```
→ **Problema de autenticación**

#### ❌ Si falla con 400:
```json
{
  "message": "chatSessionId is required",
  "statusCode": 400
}
```
→ **El formato del body es incorrecto**

#### ❌ Si falla con 404:
```json
{
  "message": "Cannot POST /api/chat/send-message",
  "statusCode": 404
}
```
→ **El endpoint no existe o la ruta es incorrecta**

---

## 💡 Soluciones Según el Error

### Caso 1: Token Missing

**Síntoma:** `Token exists: false`

**Solución:**
```typescript
// Verificar que el login guarde el token
localStorage.setItem('token', tokenFromBackend);
```

### Caso 2: Token Expirado

**Síntoma:** `Error 401 - Token expired`

**Solución:**
1. Hacer login de nuevo
2. Implementar refresh token
3. Verificar tiempo de expiración del token

### Caso 3: Endpoint Incorrecto

**Síntoma:** `Error 404 - Cannot POST`

**Solución:** Actualizar el endpoint en `src/lib/api/services/inbox.ts`:

```typescript
// Prueba con diferentes rutas:
'/chat/send-message'           // ← Actual
'/api/chat/send-message'       // Si la base URL no incluye /api
'/inbox/messages'              // Ruta alternativa
'/messages/send'               // Ruta alternativa
```

### Caso 4: Formato de Body Incorrecto

**Síntoma:** `Error 400 - Bad Request` o campo requerido missing

**Posibles formatos que el backend podría esperar:**

#### Formato A: Con chatSessionId
```typescript
// En src/lib/api/services/inbox.ts
async sendChatMessage(request: SendMessageRequest): Promise<Message> {
  const response = await apiClient.post<{ data: Message }>(
    '/chat/send-message',
    {
      chatSessionId: parseInt(request.conversationId),  // 👈 Número
      content: request.content,
      messageType: request.type || 'text'  // 👈 messageType
    }
  );
  return response.data.data;
}
```

#### Formato B: Estructura anidada
```typescript
async sendChatMessage(request: SendMessageRequest): Promise<Message> {
  const response = await apiClient.post<{ data: Message }>(
    '/chat/send-message',
    {
      message: {  // 👈 Objeto anidado
        conversationId: request.conversationId,
        content: request.content,
        type: request.type || 'text'
      }
    }
  );
  return response.data.data;
}
```

#### Formato C: Con campos adicionales
```typescript
async sendChatMessage(request: SendMessageRequest): Promise<Message> {
  const response = await apiClient.post<{ data: Message }>(
    '/chat/send-message',
    {
      conversationId: request.conversationId,
      content: request.content,
      messageType: request.type || 'text',
      direction: 'outgoing',  // 👈 Campo adicional
      status: 0,  // 👈 Campo adicional
      // Agregar otros campos que el backend necesite
    }
  );
  return response.data.data;
}
```

### Caso 5: Headers Faltantes

**Síntoma:** Error 401 pero el token existe

**Verificar:** Que el backend no requiera headers adicionales

```typescript
// En src/lib/api/services/inbox.ts
async sendChatMessage(request: SendMessageRequest): Promise<Message> {
  const response = await apiClient.post<{ data: Message }>(
    '/chat/send-message',
    {
      conversationId: request.conversationId,
      content: request.content,
      type: request.type || 'text'
    },
    {
      // Headers adicionales si son necesarios
      'X-Request-ID': crypto.randomUUID(),
      'X-Client-Version': '1.0.0',
    }
  );
  return response.data.data;
}
```

---

## 📋 Checklist de Diagnóstico

Ejecuta este checklist en orden:

- [ ] **Paso 1:** Intenta enviar un mensaje
- [ ] **Paso 2:** Abre la consola y copia los logs que empiezan con 🔍 y ❌
- [ ] **Paso 3:** Abre Network tab y busca la petición `send-message`
- [ ] **Paso 4:** Verifica Request Headers (debe tener Authorization)
- [ ] **Paso 5:** Verifica Request Payload
- [ ] **Paso 6:** Verifica Response Status y Body
- [ ] **Paso 7:** Ejecuta el test rápido del endpoint en consola
- [ ] **Paso 8:** Comparte la información recopilada

---

## 🎯 Información que Necesito de Ti

Para darte la solución exacta, copia y pega:

### 1. Logs de la Consola
```
🔍 DEBUG useSendMessage - Request: {...}
🔍 DEBUG useSendMessage - Token exists: ...
❌ DEBUG useSendMessage - Error completo: {...}
```

### 2. Request del Network Tab
```
URL: ...
Method: POST
Headers:
  Authorization: ...
  X-Tenant-Id: ...
Payload:
  {...}
```

### 3. Response del Backend
```
Status: 401
Body:
  {...}
```

### 4. Resultado del Test Manual
```
Test con fetch(): ...
```

---

## 🚀 Siguiente Paso

1. Intenta enviar un mensaje
2. Abre la consola del navegador
3. Copia los logs de debug
4. Abre Network tab
5. Copia la información de la petición
6. Compártela conmigo

Con esa información podré darte la solución exacta.

---

## 💡 Tip: Evitar el Redirect al Login

Si quieres evitar que te redirija al login mientras debuggeas, comenta temporalmente estas líneas en `src/lib/api/client.ts`:

```typescript
// Líneas 106-113
if (response.status === 401 && typeof window !== 'undefined') {
  // COMENTAR TEMPORALMENTE:
  // localStorage.removeItem('token');
  // window.location.href = '/login';

  // Solo loguear el error
  console.error('❌ Error 401 - No autorizado');
}
```

Así podrás ver el error completo sin ser redirigido.
