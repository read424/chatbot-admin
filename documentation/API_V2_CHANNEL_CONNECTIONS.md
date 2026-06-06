# API v2 - Channel Connections

## Descripción General

API RESTful para gestionar conexiones de canales de comunicación unificados. Soporta múltiples proveedores: WhatsApp Web, WhatsApp API, Instagram Direct, Facebook Messenger, Telegram y WebChat.

**Base URL**: `/api/v2/connections`

---

## 🔐 Autenticación y Headers

Todos los endpoints requieren los siguientes headers:

```http
Authorization: Bearer {JWT_TOKEN}
X-Tenant-Id: {TENANT_ID}
Content-Type: application/json
```

**Respuestas de error de autenticación:**

```json
// 401 Unauthorized
{
  "success": false,
  "message": "Token de autenticación inválido o expirado"
}

// 403 Forbidden
{
  "success": false,
  "message": "No tienes permisos para acceder a este recurso"
}
```

---

## 📋 Endpoints

### 1. Crear Conexión

**`POST /api/v2/connections`**

Crea una nueva conexión de canal. Por defecto, todas las conexiones se crean con `status: "inactive"`.

#### Request Headers
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-Id: 1
Content-Type: application/json
```

#### Request Body - WhatsApp Web

```json
{
  "connectionName": "WhatsApp Ventas Principal",
  "channelType": "whatsapp_web",
  "departmentId": 1,
  "welcomeMessage": "¡Hola! Bienvenido a nuestro servicio de atención",
  "goodbyeMessage": "Gracias por contactarnos. ¡Hasta pronto!",
  "chatbotTimeout": 30
}
```

#### Request Body - Instagram Direct

```json
{
  "connectionName": "Instagram Soporte Técnico",
  "channelType": "instagram_direct",
  "departmentId": 2,
  "welcomeMessage": "¡Hola! ¿En qué podemos ayudarte hoy?",
  "goodbyeMessage": "¡Gracias por escribirnos!",
  "chatbotTimeout": 30,
  "channelCredentials": {
    "accessToken": "EAAD...",
    "verifyToken": "instagram_verify_token_123",
    "pageId": "123456789",
    "instagramAccountId": "17841234567890"
  }
}
```

#### Request Body - Facebook Messenger

```json
{
  "connectionName": "Facebook Messenger Ventas",
  "channelType": "facebook_messenger",
  "departmentId": 1,
  "welcomeMessage": "¡Hola! Gracias por contactarnos",
  "goodbyeMessage": "¡Hasta pronto!",
  "chatbotTimeout": 30,
  "channelCredentials": {
    "accessToken": "EAAD...",
    "verifyToken": "facebook_verify_token_123",
    "pageId": "987654321",
    "pageAccessToken": "EAAD..."
  }
}
```

#### Request Body - Telegram

```json
{
  "connectionName": "Telegram Bot Soporte",
  "channelType": "telegram",
  "departmentId": 3,
  "welcomeMessage": "¡Bienvenido! ¿Cómo podemos ayudarte?",
  "goodbyeMessage": "¡Nos vemos pronto!",
  "chatbotTimeout": 30,
  "channelCredentials": {
    "botToken": "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
    "botUsername": "my_support_bot"
  }
}
```

#### Parámetros

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `connectionName` | string | ✅ | Nombre descriptivo de la conexión (max 100 caracteres) |
| `channelType` | string | ✅ | Tipo de canal: `whatsapp_web`, `whatsapp_api`, `instagram_direct`, `facebook_messenger`, `telegram`, `webchat` |
| `departmentId` | integer | ❌ | ID del departamento asignado |
| `welcomeMessage` | string | ❌ | Mensaje de bienvenida automático |
| `goodbyeMessage` | string | ❌ | Mensaje de despedida automático |
| `chatbotTimeout` | integer | ❌ | Tiempo en minutos para reinicio del chatbot (default: 30, min: 1, max: 1440) |
| `channelCredentials` | object | ⚠️ | Requerido solo para canales que necesitan credenciales (Meta, Telegram) |

#### Response 201 Created - WhatsApp Web

```json
{
  "success": true,
  "message": "Conexión creada exitosamente",
  "data": {
    "id": 1,
    "connectionName": "WhatsApp Ventas Principal",
    "channelType": "whatsapp_web",
    "tenantId": 1,
    "status": "inactive",
    "isActive": true,
    "departmentId": 1,
    "welcomeMessage": "¡Hola! Bienvenido a nuestro servicio de atención",
    "goodbyeMessage": "Gracias por contactarnos. ¡Hasta pronto!",
    "chatbotTimeout": 30,
    "channelConfig": {
      "clientId": "client-1-1730000000000-abc123",
      "sessionPath": "/sessions/client-1-1730000000000-abc123"
    },
    "connectionMetadata": {},
    "lastSeen": null,
    "lastError": null,
    "connectionAttempts": 0,
    "createdAt": "2025-10-25T14:30:00.000Z",
    "updatedAt": "2025-10-25T14:30:00.000Z"
  },
  "whatsappInfo": {
    "clientId": "client-1-1730000000000-abc123",
    "instructions": "Usa el endpoint /api/v2/connections/1/qr para obtener el código QR y conectar"
  }
}
```

#### Response 201 Created - Instagram/Facebook

```json
{
  "success": true,
  "message": "Conexión creada exitosamente",
  "data": {
    "id": 2,
    "connectionName": "Instagram Soporte Técnico",
    "channelType": "instagram_direct",
    "tenantId": 1,
    "status": "inactive",
    "isActive": true,
    "departmentId": 2,
    "welcomeMessage": "¡Hola! ¿En qué podemos ayudarte hoy?",
    "goodbyeMessage": "¡Gracias por escribirnos!",
    "chatbotTimeout": 30,
    "channelConfig": {
      "accessToken": "EAAD...",
      "verifyToken": "instagram_verify_token_123",
      "pageId": "123456789",
      "instagramAccountId": "17841234567890"
    },
    "connectionMetadata": {},
    "lastSeen": null,
    "lastError": null,
    "connectionAttempts": 0,
    "createdAt": "2025-10-25T14:30:00.000Z",
    "updatedAt": "2025-10-25T14:30:00.000Z"
  },
  "webhookInfo": {
    "webhookUrl": "https://api.tu-dominio.com/webhook/instagram/2",
    "verifyToken": "instagram_verify_token_123",
    "instructions": "Configura este webhook en el Portal de Desarrolladores de Facebook > Tu App > Productos > Webhooks > Instagram"
  }
}
```

#### Response 400 Bad Request

```json
{
  "success": false,
  "message": "connectionName is required and cannot be empty"
}
```

```json
{
  "success": false,
  "message": "Ya existe una conexión con el nombre \"WhatsApp Ventas Principal\" para este tenant"
}
```

```json
{
  "success": false,
  "message": "accessToken (PAGE_ACCESS_TOKEN) is required"
}
```

---

### 2. Listar Conexiones

**`GET /api/v2/connections`**

Obtiene todas las conexiones del tenant con filtros opcionales.

#### Request Headers
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-Id: 1
```

#### Query Parameters

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `channelType` | string | Filtrar por tipo de canal | `?channelType=whatsapp_web` |
| `status` | string | Filtrar por estado | `?status=active` |
| `isActive` | boolean | Filtrar por activo/inactivo | `?isActive=true` |
| `departmentId` | integer | Filtrar por departamento | `?departmentId=1` |
| `page` | integer | Número de página (default: 1) | `?page=2` |
| `limit` | integer | Items por página (default: 20, max: 100) | `?limit=50` |

#### Request Examples

```http
GET /api/v2/connections
GET /api/v2/connections?channelType=whatsapp_web
GET /api/v2/connections?status=active&isActive=true
GET /api/v2/connections?departmentId=1&page=1&limit=20
```

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "connections": [
      {
        "id": 1,
        "connectionName": "WhatsApp Ventas Principal",
        "channelType": "whatsapp_web",
        "status": "authenticated",
        "isActive": true,
        "departmentId": 1,
        "lastSeen": "2025-10-25T14:25:00.000Z",
        "connectionAttempts": 0,
        "createdAt": "2025-10-25T10:00:00.000Z",
        "updatedAt": "2025-10-25T14:25:00.000Z"
      },
      {
        "id": 2,
        "connectionName": "Instagram Soporte",
        "channelType": "instagram_direct",
        "status": "active",
        "isActive": true,
        "departmentId": 2,
        "lastSeen": "2025-10-25T14:30:00.000Z",
        "connectionAttempts": 0,
        "createdAt": "2025-10-25T11:00:00.000Z",
        "updatedAt": "2025-10-25T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 2,
      "totalPages": 1
    }
  }
}
```

---

### 3. Obtener Detalles de Conexión

**`GET /api/v2/connections/:id`**

Obtiene los detalles completos de una conexión específica.

#### Request Headers
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-Id: 1
```

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | integer | ID de la conexión |

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "id": 1,
    "connectionName": "WhatsApp Ventas Principal",
    "channelType": "whatsapp_web",
    "tenantId": 1,
    "status": "authenticated",
    "isActive": true,
    "departmentId": 1,
    "welcomeMessage": "¡Hola! Bienvenido a nuestro servicio de atención",
    "goodbyeMessage": "Gracias por contactarnos. ¡Hasta pronto!",
    "chatbotTimeout": 30,
    "channelConfig": {
      "clientId": "client-1-1730000000000-abc123",
      "phoneNumber": "5551234567",
      "sessionPath": "/sessions/client-1-1730000000000-abc123"
    },
    "connectionMetadata": {
      "lastActivity": "2025-10-25T14:25:00.000Z",
      "messagesCount": 1523,
      "activeConversations": 12,
      "deviceInfo": {
        "platform": "android",
        "manufacturer": "Samsung",
        "model": "Galaxy S21"
      }
    },
    "lastSeen": "2025-10-25T14:25:00.000Z",
    "lastError": null,
    "connectionAttempts": 0,
    "createdAt": "2025-10-25T10:00:00.000Z",
    "updatedAt": "2025-10-25T14:25:00.000Z"
  }
}
```

#### Response 404 Not Found

```json
{
  "success": false,
  "message": "Conexión no encontrada"
}
```

---

### 4. Obtener Código QR (WhatsApp Web)

**`GET /api/v2/connections/:id/qr`**

Obtiene el código QR para escanear y autenticar una conexión de WhatsApp Web. Este endpoint es exclusivo para conexiones de tipo `whatsapp_web`.

#### Request Headers
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-Id: 1
```

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | integer | ID de la conexión WhatsApp Web |

#### Response 200 OK - QR Disponible

```json
{
  "success": true,
  "data": {
    "connectionId": 1,
    "connectionName": "WhatsApp Ventas Principal",
    "status": "connecting",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "qrCodeText": "1@ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnop...",
    "expiresAt": "2025-10-25T14:35:00.000Z",
    "instructions": [
      "1. Abre WhatsApp en tu teléfono",
      "2. Ve a Ajustes > Dispositivos vinculados",
      "3. Toca 'Vincular un dispositivo'",
      "4. Escanea este código QR",
      "5. El código expira en 60 segundos"
    ]
  }
}
```

#### Response 200 OK - Ya Autenticado

```json
{
  "success": true,
  "data": {
    "connectionId": 1,
    "connectionName": "WhatsApp Ventas Principal",
    "status": "authenticated",
    "message": "Esta conexión ya está autenticada y activa",
    "phoneNumber": "5551234567",
    "lastSeen": "2025-10-25T14:25:00.000Z",
    "deviceInfo": {
      "platform": "android",
      "manufacturer": "Samsung",
      "model": "Galaxy S21"
    }
  }
}
```

#### Response 400 Bad Request

```json
{
  "success": false,
  "message": "Esta conexión no es de tipo WhatsApp Web"
}
```

#### Response 408 Request Timeout

```json
{
  "success": false,
  "message": "Tiempo de espera agotado para generar el código QR. Intenta nuevamente."
}
```

#### Response 503 Service Unavailable

```json
{
  "success": false,
  "message": "El servicio de WhatsApp no está disponible en este momento. Intenta más tarde."
}
```

---

### 5. Actualizar Conexión

**`PUT /api/v2/connections/:id`**

Actualiza los datos de una conexión existente. No se pueden actualizar `channelType` ni `tenantId`.

#### Request Headers
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-Id: 1
Content-Type: application/json
```

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | integer | ID de la conexión |

#### Request Body

```json
{
  "connectionName": "WhatsApp Ventas Principal Actualizado",
  "departmentId": 2,
  "welcomeMessage": "¡Hola! Nuevo mensaje de bienvenida",
  "goodbyeMessage": "¡Hasta luego!",
  "chatbotTimeout": 45
}
```

#### Request Body - Actualizar Credenciales (Meta/Telegram)

```json
{
  "channelCredentials": {
    "accessToken": "NEW_TOKEN_EAAD...",
    "verifyToken": "new_verify_token_456"
  }
}
```

#### Parámetros Actualizables

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `connectionName` | string | Nuevo nombre descriptivo |
| `departmentId` | integer | Nuevo departamento |
| `welcomeMessage` | string | Nuevo mensaje de bienvenida |
| `goodbyeMessage` | string | Nuevo mensaje de despedida |
| `chatbotTimeout` | integer | Nuevo timeout en minutos |
| `channelCredentials` | object | Actualizar tokens/credenciales |

#### Response 200 OK

```json
{
  "success": true,
  "message": "Conexión actualizada exitosamente",
  "data": {
    "id": 1,
    "connectionName": "WhatsApp Ventas Principal Actualizado",
    "channelType": "whatsapp_web",
    "tenantId": 1,
    "status": "authenticated",
    "isActive": true,
    "departmentId": 2,
    "welcomeMessage": "¡Hola! Nuevo mensaje de bienvenida",
    "goodbyeMessage": "¡Hasta luego!",
    "chatbotTimeout": 45,
    "updatedAt": "2025-10-25T15:00:00.000Z"
  }
}
```

#### Response 404 Not Found

```json
{
  "success": false,
  "message": "Conexión no encontrada"
}
```

---

### 6. Activar Conexión

**`POST /api/v2/connections/:id/activate`**

Activa una conexión desactivada. Para WhatsApp Web, iniciará el proceso de conexión.

#### Request Headers
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-Id: 1
```

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | integer | ID de la conexión |

#### Response 200 OK - WhatsApp Web

```json
{
  "success": true,
  "message": "Conexión activada. Escanea el código QR para autenticar",
  "data": {
    "id": 1,
    "connectionName": "WhatsApp Ventas Principal",
    "status": "connecting",
    "isActive": true,
    "nextStep": {
      "action": "scan_qr",
      "endpoint": "/api/v2/connections/1/qr",
      "instructions": "Obtén el código QR desde el endpoint indicado"
    }
  }
}
```

#### Response 200 OK - Meta/Telegram

```json
{
  "success": true,
  "message": "Conexión activada exitosamente",
  "data": {
    "id": 2,
    "connectionName": "Instagram Soporte",
    "status": "active",
    "isActive": true,
    "webhookStatus": "configured",
    "webhookUrl": "https://api.tu-dominio.com/webhook/instagram/2"
  }
}
```

#### Response 400 Bad Request

```json
{
  "success": false,
  "message": "La conexión ya está activa"
}
```

---

### 7. Desactivar Conexión

**`POST /api/v2/connections/:id/deactivate`**

Desactiva una conexión activa. Para WhatsApp Web, cerrará la sesión.

#### Request Headers
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-Id: 1
```

#### Request Body (Opcional)

```json
{
  "reason": "Mantenimiento programado"
}
```

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | integer | ID de la conexión |

#### Response 200 OK

```json
{
  "success": true,
  "message": "Conexión desactivada exitosamente",
  "data": {
    "id": 1,
    "connectionName": "WhatsApp Ventas Principal",
    "status": "disconnected",
    "isActive": false,
    "deactivatedAt": "2025-10-25T15:30:00.000Z"
  }
}
```

---

### 8. Eliminar Conexión

**`DELETE /api/v2/connections/:id`**

Elimina (desactiva permanentemente) una conexión. Esta acción es reversible si se necesita.

#### Request Headers
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-Id: 1
```

#### Query Parameters

| Parámetro | Tipo | Descripción | Default |
|-----------|------|-------------|---------|
| `permanent` | boolean | Eliminar permanentemente (sin recuperación) | `false` |

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | integer | ID de la conexión |

#### Response 200 OK - Soft Delete

```json
{
  "success": true,
  "message": "Conexión eliminada exitosamente",
  "data": {
    "id": 1,
    "connectionName": "WhatsApp Ventas Principal",
    "isActive": false,
    "deletedAt": "2025-10-25T16:00:00.000Z",
    "recoverable": true
  }
}
```

#### Response 200 OK - Hard Delete

```json
{
  "success": true,
  "message": "Conexión eliminada permanentemente",
  "data": {
    "id": 1,
    "recoverable": false
  }
}
```

---

### 9. Probar Conexión

**`POST /api/v2/connections/:id/test`**

Envía un mensaje de prueba para verificar que la conexión está funcionando correctamente.

#### Request Headers
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-Id: 1
Content-Type: application/json
```

#### Request Body

```json
{
  "testPhoneNumber": "5551234567",
  "testMessage": "Este es un mensaje de prueba desde el sistema"
}
```

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | integer | ID de la conexión |

#### Response 200 OK

```json
{
  "success": true,
  "message": "Mensaje de prueba enviado exitosamente",
  "data": {
    "connectionId": 1,
    "testPhoneNumber": "5551234567",
    "messageId": "3EB0ABCD1234567890",
    "status": "sent",
    "sentAt": "2025-10-25T16:15:00.000Z"
  }
}
```

#### Response 400 Bad Request

```json
{
  "success": false,
  "message": "La conexión debe estar activa para realizar pruebas"
}
```

---

### 10. Obtener Estadísticas

**`GET /api/v2/connections/:id/stats`**

Obtiene estadísticas de uso y rendimiento de una conexión.

#### Request Headers
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-Id: 1
```

#### Query Parameters

| Parámetro | Tipo | Descripción | Default |
|-----------|------|-------------|---------|
| `period` | string | Período: `today`, `week`, `month`, `year` | `week` |
| `timezone` | string | Zona horaria (ej: `America/Mexico_City`) | `UTC` |

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | integer | ID de la conexión |

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "connectionId": 1,
    "connectionName": "WhatsApp Ventas Principal",
    "period": "week",
    "stats": {
      "totalMessages": 1523,
      "incomingMessages": 892,
      "outgoingMessages": 631,
      "activeConversations": 12,
      "totalConversations": 245,
      "averageResponseTime": "00:02:34",
      "uptime": "99.8%",
      "lastDowntime": "2025-10-24T03:15:00.000Z",
      "messagesPerDay": [
        { "date": "2025-10-19", "count": 187 },
        { "date": "2025-10-20", "count": 234 },
        { "date": "2025-10-21", "count": 289 },
        { "date": "2025-10-22", "count": 312 },
        { "date": "2025-10-23", "count": 256 },
        { "date": "2025-10-24", "count": 198 },
        { "date": "2025-10-25", "count": 47 }
      ],
      "peakHours": [
        { "hour": "10:00", "count": 145 },
        { "hour": "14:00", "count": 189 },
        { "hour": "16:00", "count": 167 }
      ]
    },
    "generatedAt": "2025-10-25T16:30:00.000Z"
  }
}
```

---

### 11. Obtener Resumen de Conexiones del Tenant

**`GET /api/v2/connections/summary`**

Obtiene un resumen de todas las conexiones del tenant con métricas agregadas.

#### Request Headers
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-Id: 1
```

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "tenantId": 1,
    "summary": {
      "totalConnections": 5,
      "activeConnections": 4,
      "inactiveConnections": 1,
      "byChannelType": [
        { "channelType": "whatsapp_web", "count": 2, "active": 2 },
        { "channelType": "instagram_direct", "count": 1, "active": 1 },
        { "channelType": "facebook_messenger", "count": 1, "active": 1 },
        { "channelType": "telegram", "count": 1, "active": 0 }
      ],
      "byStatus": [
        { "status": "authenticated", "count": 2 },
        { "status": "active", "count": 2 },
        { "status": "inactive", "count": 1 }
      ],
      "totalMessages24h": 3421,
      "activeConversations": 45,
      "averageResponseTime": "00:03:12"
    },
    "generatedAt": "2025-10-25T16:45:00.000Z"
  }
}
```

---

## 📊 Estados de Conexión

| Estado | Descripción | Aplicable a |
|--------|-------------|-------------|
| `inactive` | Conexión creada pero no activada | Todos |
| `connecting` | Intentando establecer conexión | WhatsApp Web |
| `authenticated` | Autenticado exitosamente (QR escaneado) | WhatsApp Web |
| `active` | Conexión activa y funcionando | Meta, Telegram, WebChat |
| `disconnected` | Conexión perdida o desconectada | Todos |
| `error` | Error en la conexión | Todos |

---

## 🔄 Flujo de Trabajo - WhatsApp Web

### 1. Crear Conexión
```http
POST /api/v2/connections
```
↓ Respuesta: `status: "inactive"`

### 2. Activar Conexión
```http
POST /api/v2/connections/:id/activate
```
↓ Respuesta: `status: "connecting"`

### 3. Obtener Código QR
```http
GET /api/v2/connections/:id/qr
```
↓ Escanear QR con WhatsApp

### 4. Verificar Estado (Polling o WebSocket)
```http
GET /api/v2/connections/:id
```
↓ Respuesta: `status: "authenticated"` ✅

### 5. Enviar Mensajes
```http
POST /api/chat/send-message
```

---

## 🔄 Flujo de Trabajo - Instagram/Facebook

### 1. Crear Conexión
```http
POST /api/v2/connections
Body: { channelCredentials: { accessToken, verifyToken, ... } }
```
↓ Respuesta: `webhookUrl`

### 2. Configurar Webhook en Facebook
- Ir al Portal de Desarrolladores de Facebook
- Configurar webhook URL
- Usar `verifyToken` proporcionado

### 3. Activar Conexión
```http
POST /api/v2/connections/:id/activate
```
↓ Respuesta: `status: "active"` ✅

### 4. Recibir Mensajes
- Facebook enviará mensajes al webhook
- Sistema procesará automáticamente

---

## ⚠️ Códigos de Error Comunes

| Código | Mensaje | Solución |
|--------|---------|----------|
| 400 | `connectionName is required` | Proporcionar nombre de conexión |
| 400 | `Invalid channelType` | Usar uno de los tipos válidos |
| 400 | `accessToken is required` | Proporcionar credenciales para Meta |
| 401 | `Token inválido` | Renovar token de autenticación |
| 403 | `Sin permisos` | Verificar permisos del usuario |
| 404 | `Conexión no encontrada` | Verificar que el ID existe |
| 408 | `Timeout generando QR` | Reintentar obtener QR |
| 409 | `Conexión ya existe` | Usar nombre diferente |
| 500 | `Error interno` | Contactar soporte |
| 503 | `Servicio no disponible` | Reintentar más tarde |

---

## 🎯 Ejemplos de Uso con cURL

### Crear Conexión WhatsApp Web
```bash
curl -X POST http://localhost:3000/api/v2/connections \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Tenant-Id: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "connectionName": "WhatsApp Ventas",
    "channelType": "whatsapp_web",
    "departmentId": 1,
    "welcomeMessage": "¡Hola!",
    "goodbyeMessage": "Adiós",
    "chatbotTimeout": 30
  }'
```

### Obtener Código QR
```bash
curl -X GET http://localhost:3000/api/v2/connections/1/qr \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Tenant-Id: 1"
```

### Listar Conexiones Activas
```bash
curl -X GET "http://localhost:3000/api/v2/connections?status=active&isActive=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Tenant-Id: 1"
```

### Actualizar Conexión
```bash
curl -X PUT http://localhost:3000/api/v2/connections/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-Tenant-Id: 1" \
  -H "Content-Type: application/json" \
  -d '{
    "welcomeMessage": "Nuevo mensaje de bienvenida",
    "chatbotTimeout": 45
  }'
```

---

## 📝 Notas Importantes

1. **WhatsApp Web**: Todas las conexiones se crean con `status: "inactive"` porque requieren escanear QR
2. **Autenticación**: Todos los endpoints requieren JWT válido en header `Authorization`
3. **Multitenancy**: El `X-Tenant-Id` header es obligatorio y determina el alcance de datos
4. **Rate Limiting**: Límite de 100 peticiones por minuto por tenant
5. **Webhooks**: Los webhooks de Meta/Telegram se configuran automáticamente al activar la conexión
6. **Seguridad**: Los `channelConfig` (tokens, credentials) se ofuscan en respuestas GET

---

## 🚀 Roadmap de Endpoints Futuros

- `POST /api/v2/connections/:id/restart` - Reiniciar conexión
- `GET /api/v2/connections/:id/logs` - Ver logs de conexión
- `POST /api/v2/connections/:id/webhook/verify` - Verificar webhook
- `GET /api/v2/connections/:id/health` - Health check de conexión
- `POST /api/v2/connections/bulk-activate` - Activar múltiples conexiones