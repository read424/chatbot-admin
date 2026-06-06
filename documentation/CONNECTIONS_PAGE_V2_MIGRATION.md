# Migración de ConnectionsPage a API V2

## ✅ Cambios Realizados

Se ha actualizado exitosamente la página de conexiones (`/dashboard/connections`) para usar el nuevo servicio **Connections V2** con el endpoint `GET /api/v2/connections`.

---

## 📝 Archivo Modificado

**`src/components/connections/ConnectionsPage.tsx`**

### Cambios Principales:

#### 1. **Imports Actualizados**
```typescript
// ANTES
import { connectionsService } from '@/lib/api/services/connections';
import { Connection, CreateConnectionRequest, UpdateConnectionRequest, ProviderType } from '@/types/connections';
import { useEffect, useState } from 'react';

// DESPUÉS
import { useConnectionsV2 } from '@/hooks/useConnectionsV2';
import type { ChannelType, ConnectionV2 } from '@/types/connectionsV2';
import { useState } from 'react';
```

#### 2. **Uso del Hook useConnectionsV2**
```typescript
// ANTES: Fetch manual con useEffect
const [connections, setConnections] = useState<Connection[]>([]);
const [loading, setLoading] = useState(false);

const fetchConnections = async () => {
    setLoading(true);
    const connections = await connectionsService.getConnections();
    setConnections(connections);
    setLoading(false);
};

useEffect(() => {
    fetchConnections();
}, []);

// DESPUÉS: Hook con auto-fetch
const {
    connections,
    isLoading: loading,
    error,
    fetchConnections,
    createConnection,
    updateConnection,
    deleteConnection,
    activateConnection,
    deactivateConnection,
    clearError
} = useConnectionsV2({ autoFetch: true });
```

#### 3. **Tipos de Canal Actualizados**
```typescript
// ANTES: ProviderType
type ProviderType = 'whatsapp' | 'facebook' | 'instagram' | 'telegram' | 'whatsapp_api' | 'chatweb';

// DESPUÉS: ChannelType (API v2)
type ChannelType =
  | 'whatsapp_web'          // ← NUEVO (antes era solo 'whatsapp')
  | 'whatsapp_api'
  | 'instagram_direct'      // ← NUEVO (antes era 'instagram')
  | 'facebook_messenger'    // ← NUEVO (antes era 'facebook')
  | 'telegram'
  | 'webchat';              // ← NUEVO (antes era 'chatweb')
```

#### 4. **Estados de Conexión Actualizados**
```typescript
// ANTES
'active' | 'inactive' | 'error'

// DESPUÉS (API v2)
'inactive' | 'connecting' | 'authenticated' | 'active' | 'disconnected' | 'error'
```

#### 5. **Campos de ConnectionV2**
```typescript
// ANTES (Connection)
{
  id: string;
  name: string;
  providerType: ProviderType;
  department: string;
  status: ConnectionStatus;
  ...
}

// DESPUÉS (ConnectionV2)
{
  id: number;                    // ← number en lugar de string
  connectionName: string;        // ← antes era 'name'
  channelType: ChannelType;      // ← antes era 'providerType'
  departmentId: number | null;   // ← antes era 'department' (string)
  status: ConnectionStatus;
  ...
}
```

#### 6. **Handlers Actualizados**
```typescript
// Crear conexión - ANTES
await connectionsService.createConnection(connectionData);
const updatedConnection = await connectionsService.getConnections();
setConnections(updatedConnection);

// Crear conexión - DESPUÉS
await createConnection(connectionData);
// El hook actualiza automáticamente el estado
```

#### 7. **Banner de Errores**
Se agregó un banner para mostrar errores del API:
```typescript
{error && (
    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex justify-between items-center">
        <span>{error}</span>
        <button onClick={clearError}>×</button>
    </div>
)}
```

---

## 🔄 Endpoint Actualizado

### ANTES:
- **Servicio viejo**: `connectionsService`
- **Endpoint**: Probablemente `/api/connections` (v1)

### DESPUÉS:
- **Hook nuevo**: `useConnectionsV2`
- **Servicio nuevo**: `connectionsV2Service`
- **Endpoint**: **`GET /api/v2/connections`** ✅

---

## ✨ Mejoras Obtenidas

### 1. **Auto-fetch**
```typescript
// Ya no necesitas useEffect, el hook lo hace automáticamente
useConnectionsV2({ autoFetch: true })
```

### 2. **Manejo de Errores Integrado**
```typescript
const { error, clearError } = useConnectionsV2();
// Mostrar errores en UI automáticamente
```

### 3. **Estados de Loading Granulares**
```typescript
const {
    isLoading,      // General
    isCreating,     // Crear
    isUpdating,     // Actualizar
    isDeleting      // Eliminar
} = useConnectionsV2();
```

### 4. **Actualización Optimista**
El hook actualiza el estado local automáticamente después de operaciones CRUD.

### 5. **Type Safety Completo**
Todos los tipos están sincronizados con el API v2.

---

## 🧪 Verificación

### 1. Verificar el Request
Abre las DevTools del navegador (F12) → Network → ve a `/dashboard/connections`:

Deberías ver:
```
Request URL: http://127.0.0.1:3330/api/v2/connections
Request Method: GET
Status Code: 200 OK
```

### 2. Headers Enviados
```http
Authorization: Bearer {JWT_TOKEN}
X-Tenant-Id: {TENANT_ID}
```

### 3. Respuesta Esperada
```json
{
  "success": true,
  "data": {
    "connections": [
      {
        "id": 1,
        "connectionName": "WhatsApp Ventas",
        "channelType": "whatsapp_web",
        "status": "inactive",
        "isActive": true,
        ...
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 5,
      "totalPages": 1
    }
  }
}
```

---

## 🔧 Troubleshooting

### Problema: No se hace la petición al backend

**Solución**:
1. Verifica que estés autenticado (`localStorage.getItem('token')`)
2. Verifica que tengas `tenantId` (`localStorage.getItem('tenantId')`)
3. Revisa la consola del navegador para errores
4. Verifica que el backend esté corriendo en `http://127.0.0.1:3330`

### Problema: Error 401 Unauthorized

**Solución**:
1. El token JWT expiró → vuelve a hacer login
2. El token no está en localStorage → verifica el login
3. El header `Authorization` no se envía → revisa `apiClient`

### Problema: Error 404 Not Found

**Solución**:
1. El endpoint `/api/v2/connections` no existe en el backend
2. Verifica que el backend tenga la ruta implementada
3. Revisa la configuración de `NEXT_PUBLIC_API_URL`

### Problema: Conexiones no se muestran

**Solución**:
1. Revisa la consola del navegador
2. Verifica que el response tenga el formato correcto
3. Revisa que `connections` tenga datos: `console.log(connections)`

---

## 📚 Archivos Relacionados

- **Hook**: `src/hooks/useConnectionsV2.ts`
- **Servicio**: `src/lib/api/services/connectionsV2.ts`
- **Tipos**: `src/types/connectionsV2.ts`
- **Página**: `src/components/connections/ConnectionsPage.tsx`
- **Ruta**: `src/app/dashboard/connections/page.tsx`

---

## ✅ Estado Final

**La página de conexiones ahora usa el API v2** y hará la petición correcta:

```
GET http://127.0.0.1:3330/api/v2/connections
```

Cuando hagas click en "Conexiones" en el menú, deberías ver el request en el Network tab de las DevTools.

---

**Fecha de Migración**: 2025-10-25
**Estado**: ✅ COMPLETADO
