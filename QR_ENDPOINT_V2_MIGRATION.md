# Migración de Endpoint QR a V2

## ✅ Cambio Implementado

Se ha migrado la funcionalidad de **generación de código QR para WhatsApp Web** del endpoint antiguo al nuevo endpoint v2.

---

## 🔄 Endpoints: Antes vs Ahora

### ❌ Endpoints Antiguos (v1):

```
POST /api/whatsapp/connect
POST /api/whatsapp/restart-connection
```

**Flujo anterior:**
1. Frontend envía POST con datos de conexión
2. Backend crea sesión y genera clientId
3. Backend devuelve clientId + QR code
4. Frontend usa clientId para reiniciar

### ✅ Endpoint Nuevo (v2):

```
GET /api/v2/connections/:id/qr
```

**Flujo nuevo:**
1. Frontend solicita QR usando el ID de conexión
2. Backend genera/recupera QR para esa conexión
3. Backend devuelve QR directamente
4. Mismo endpoint para obtener QR inicial y reintentar

---

## 📝 Cambios Realizados

### 1. Hook `useWhatsAppConnection` (`src/hooks/useWhatsAppConnection.ts`)

#### Cambio en Import:
```typescript
// ANTES
import { connectionsService } from '@/lib/api/services/connections';

// AHORA
import { connectionsV2Service } from '@/lib/api/services/connectionsV2';
```

#### Cambio en Interface:
```typescript
interface UseWhatsAppConnectionProps {
  connectionId: number; // ← Cambio de string a number
  connectionName: string;
  tenantId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}
```

#### Función `createConnection` - ANTES:
```typescript
const createConnection = useCallback(async () => {
    setStatus('creating');

    const response = await connectionsService.createWhatsAppConnection({
        connectionId,
        connectionName,
        tenantId
    });

    if (response.success && response.clientId) {
        setClientId(response.clientId);
        clientIdRef.current = response.clientId;
        setStatus('waiting_qr');

        if (response.qr) {
            setQrCode(response.qr);
            setStatus('qr_ready');
        }
    }
}, [isConnected, connectionId, connectionName, tenantId, onError]);
```

#### Función `createConnection` - AHORA:
```typescript
const createConnection = useCallback(async () => {
    setStatus('creating');

    // Usar nuevo endpoint v2: GET /api/v2/connections/:id/qr
    const response = await connectionsV2Service.getQRCode(connectionId);

    if (response.success && response.data) {
        // Generar clientId para compatibilidad con WebSocket
        const generatedClientId = `client-${connectionId}-${Date.now()}`;
        setClientId(generatedClientId);
        clientIdRef.current = generatedClientId;

        if (response.data.qrCode) {
            setQrCode(response.data.qrCode);
            setStatus('qr_ready');
        } else if (response.data.message) {
            // Ya está autenticado
            setStatus('connected');
            onSuccess?.();
        }
    }
}, [isConnected, connectionId, onSuccess, onError]);
```

#### Función `restartConnection` - ANTES:
```typescript
const restartConnection = useCallback(async () => {
    setStatus('waiting_qr');

    const response = await connectionsService.restartWhatsAppConnection({
        clientId: clientId,
        tenantId: tenantId
    });

    if (response.success) {
        console.log('Conexión reiniciada exitosamente');
    }
}, [isConnected, clientId, tenantId, onError]);
```

#### Función `restartConnection` - AHORA:
```typescript
const restartConnection = useCallback(async () => {
    setStatus('waiting_qr');

    // Volver a obtener el QR usando el mismo endpoint v2
    const response = await connectionsV2Service.getQRCode(connectionId);

    if (response.success && response.data) {
        if (response.data.qrCode) {
            setQrCode(response.data.qrCode);
            setStatus('qr_ready');
        } else if (response.data.message) {
            // Ya está autenticado
            setStatus('connected');
            onSuccess?.();
        }
    }
}, [isConnected, connectionId, onSuccess, onError]);
```

---

### 2. Componente QRModal (`src/components/connections/QRModal.tsx`)

#### Cambio en Interface:
```typescript
interface QRModalProps {
    isOpen: boolean;
    onClose: () => void;
    connectionId: number; // ← Cambio de string a number
    connectionName: string;
    connectionType: ProviderType;
    tenantId: string;
}
```

---

### 3. ConnectionsPage (`src/components/connections/ConnectionsPage.tsx`)

#### ANTES:
```typescript
<QRModal
    connectionId={String(qrConnection.id)}  // ← Convertía a string
    connectionName={qrConnection.connectionName}
    connectionType={qrConnection.channelType}
    tenantId="1"
/>
```

#### AHORA:
```typescript
<QRModal
    connectionId={qrConnection.id}  // ← Pasa directamente como number
    connectionName={qrConnection.connectionName}
    connectionType={qrConnection.channelType}
    tenantId="1"
/>
```

---

## 🔌 Endpoint V2 Utilizado

### Request:
```http
GET /api/v2/connections/:id/qr
Authorization: Bearer {token}
X-Tenant-Id: {tenantId}
```

### Response Esperado (QR Disponible):
```json
{
  "success": true,
  "data": {
    "connectionId": 1,
    "connectionName": "WhatsApp Ventas",
    "status": "connecting",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "qrCodeText": "2@abc123xyz...",
    "expiresAt": "2025-10-25T15:30:00.000Z",
    "instructions": [
      "Abre WhatsApp en tu teléfono",
      "Ve a Configuración > Dispositivos vinculados",
      "Escanea este código QR"
    ]
  }
}
```

### Response Esperado (Ya Autenticado):
```json
{
  "success": true,
  "data": {
    "connectionId": 1,
    "connectionName": "WhatsApp Ventas",
    "status": "authenticated",
    "message": "Esta conexión ya está autenticada",
    "phoneNumber": "5551234567",
    "lastSeen": "2025-10-25T15:25:00.000Z",
    "deviceInfo": {
      "platform": "android",
      "manufacturer": "Samsung",
      "model": "Galaxy S21"
    }
  }
}
```

---

## 🎯 Ventajas del Nuevo Enfoque

### ✅ Más Simple y RESTful
- Un solo endpoint GET en lugar de dos POST
- No necesita crear "cliente" explícitamente
- Usa el ID de la conexión directamente

### ✅ Stateless
- No depende de mantener clientId entre requests
- El backend maneja el estado de la conexión

### ✅ Idempotente
- Múltiples llamadas al mismo endpoint son seguras
- Reintentar es tan simple como volver a llamar

### ✅ Mejor Experiencia
- Si ya está autenticado, lo indica inmediatamente
- Instrucciones incluidas en la respuesta
- Información de expiración del QR

---

## 🔄 Flujo Completo Paso a Paso

### 1. Usuario hace click en "Conectar" para WhatsApp Web
```typescript
<button onClick={() => handleConnectWhatsApp(connection)}>
    Conectar
</button>
```

### 2. Se abre el modal QRModal
```typescript
setQRConnection(connection);
setShowQRModal(true);
```

### 3. Modal llama a `createConnection` del hook
```typescript
useEffect(() => {
    if (isOpen) {
        createConnection();
    }
}, [isOpen, createConnection]);
```

### 4. Hook llama al servicio v2
```typescript
const response = await connectionsV2Service.getQRCode(connectionId);
// Internamente hace: GET /api/v2/connections/:id/qr
```

### 5. Backend responde con QR
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,..."
  }
}
```

### 6. Hook actualiza estado y renderiza QR
```typescript
setQrCode(response.data.qrCode);
setStatus('qr_ready');
```

### 7. Modal muestra QR al usuario
```jsx
{status === 'qr_ready' && qrCode && (
    <img src={qrCode} alt="QR Code" />
)}
```

### 8. Usuario escanea QR con WhatsApp

### 9. WebSocket notifica autenticación
```typescript
// Evento: WHATSAPP_READY
handleWhatsAppReady(data);
setStatus('connected');
onSuccess?.();
```

---

## 🧪 Cómo Verificar

### 1. Abrir DevTools (F12) → Network

### 2. Ir a `/dashboard/connections`

### 3. Click en "Conectar" en una conexión WhatsApp Web

### 4. Verificar Request en Network:
```
Request URL: http://127.0.0.1:3330/api/v2/connections/1/qr
Request Method: GET
Status Code: 200 OK
```

### 5. Verificar Response:
```json
{
  "success": true,
  "data": {
    "connectionId": 1,
    "qrCode": "data:image/png;base64,iVBORw0KG..."
  }
}
```

### 6. Verificar UI:
- ✅ Se muestra modal con QR
- ✅ QR es una imagen válida
- ✅ Botón "Reintentar" funciona
- ✅ Al escanear, cambia a estado "conectado"

---

## 📊 Comparación de Flujos

| Característica | V1 (Antiguo) | V2 (Nuevo) |
|----------------|--------------|------------|
| **Endpoint crear** | POST /whatsapp/connect | GET /v2/connections/:id/qr |
| **Endpoint reintentar** | POST /whatsapp/restart-connection | GET /v2/connections/:id/qr |
| **Identificador** | clientId generado | connectionId existente |
| **Método HTTP** | POST | GET |
| **Datos requeridos** | connectionId, name, tenantId | Solo connectionId en URL |
| **Idempotencia** | No | Sí |
| **Estado ya auth** | Error o QR vacío | Mensaje descriptivo |
| **Instrucciones** | No incluidas | Incluidas en response |

---

## ⚠️ Compatibilidad con WebSocket

El hook sigue usando **clientId** internamente para compatibilidad con eventos WebSocket:

```typescript
const generatedClientId = `client-${connectionId}-${Date.now()}`;
```

Esto permite que los eventos de Socket.IO sigan funcionando:
- `WHATSAPP_EVENTS.QR_CODE`
- `WHATSAPP_EVENTS.WHATSAPP_READY`
- `WHATSAPP_EVENTS.AUTHENTICATED`
- `WHATSAPP_EVENTS.WHATSAPP_DISCONNECTED`

El backend debe configurar estos eventos para usar el `connectionId` en lugar del `clientId` generado.

---

## 📁 Archivos Modificados

- **`src/hooks/useWhatsAppConnection.ts`**
  - Cambio de import: `connectionsService` → `connectionsV2Service`
  - Cambio de tipo: `connectionId: string` → `number`
  - Actualización de `createConnection()` para usar v2
  - Actualización de `restartConnection()` para usar v2
  - Generación de clientId para compatibilidad WebSocket

- **`src/components/connections/QRModal.tsx`**
  - Cambio de tipo: `connectionId: string` → `number`

- **`src/components/connections/ConnectionsPage.tsx`**
  - Removido conversión: `String(qrConnection.id)` → `qrConnection.id`

---

## ✅ Resumen

| Cambio | Estado |
|--------|--------|
| Migrar endpoint de POST a GET v2 | ✅ Completado |
| Actualizar hook useWhatsAppConnection | ✅ Completado |
| Actualizar tipo connectionId (string → number) | ✅ Completado |
| Actualizar QRModal interface | ✅ Completado |
| Actualizar ConnectionsPage props | ✅ Completado |
| Mantener compatibilidad WebSocket | ✅ Completado |
| Documentación | ✅ Completado |

---

**Fecha**: 2025-10-25
**Estado**: ✅ COMPLETADO

**Endpoint V2 Usado**: `GET /api/v2/connections/:id/qr`
