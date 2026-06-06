# Editar Conexión con Datos del Backend

## ✅ Cambio Implementado

Se ha actualizado la funcionalidad de **Editar Conexión** para que cargue los datos completos desde el backend usando el endpoint `GET /api/v2/connections/:id` antes de abrir el modal.

---

## 🔄 Flujo Anterior vs Nuevo

### ❌ Flujo Anterior:
```
Click en "Editar"
    ↓
Modal se abre con datos de la lista (parciales)
    ↓
Usuario edita
    ↓
Se guardan cambios
```

**Problema**: Los datos en la lista pueden estar incompletos (no incluyen credenciales, metadata completa, etc.)

### ✅ Flujo Nuevo:
```
Click en "Editar"
    ↓
Mostrar loading overlay
    ↓
Llamar a GET /api/v2/connections/:id
    ↓
Cargar datos completos del backend
    ↓
Modal se abre con datos completos
    ↓
Usuario edita
    ↓
Se guardan cambios
```

**Ventaja**: El modal siempre tiene los datos más recientes y completos del backend

---

## 📝 Cambios en el Código

### 1. Agregar Estado de Loading

```typescript
const [isLoadingConnection, setIsLoadingConnection] = useState(false);
```

### 2. Usar `selectConnection` del Hook

```typescript
const {
    connections,
    selectConnection,      // ← NUEVO
    selectedConnection,    // ← NUEVO
    updateConnection,
    // ... otros métodos
} = useConnectionsV2({ autoFetch: true });
```

### 3. Actualizar `handleEditConnection`

**ANTES**:
```typescript
const handleEditConnection = (connection: ConnectionV2) => {
    setEditingConnection(connection);
    setSelectedConnectionType(connection.channelType);
    setShowModal(true);
    setOpenMenuId(null);
};
```

**DESPUÉS**:
```typescript
const handleEditConnection = async (connection: ConnectionV2) => {
    setOpenMenuId(null);
    setIsLoadingConnection(true);

    try {
        // Cargar datos completos desde el backend
        await selectConnection(connection.id);

        // selectedConnection se actualiza automáticamente por el hook
        // Esperar un tick para que se actualice el estado
        setTimeout(() => {
            setSelectedConnectionType(connection.channelType);
            setShowModal(true);
            setIsLoadingConnection(false);
        }, 100);
    } catch (error) {
        console.error('Error loading connection details:', error);
        alert('Error al cargar los detalles de la conexión');
        setIsLoadingConnection(false);
    }
};
```

### 4. Actualizar `handleSaveConnection`

**ANTES**:
```typescript
if (editingConnection) {
    await updateConnection(editingConnection.id, connectionData);
}
```

**DESPUÉS**:
```typescript
// Usar selectedConnection si existe (viene del backend), sino editingConnection
const connectionToEdit = selectedConnection || editingConnection;

if (connectionToEdit) {
    await updateConnection(connectionToEdit.id, connectionData);
}
```

### 5. Actualizar Render del Modal

**ANTES**:
```typescript
<ConnectionModal
    editingConnection={editingConnection}
    onSave={handleSaveConnection}
/>
```

**DESPUÉS**:
```typescript
<ConnectionModal
    editingConnection={selectedConnection || editingConnection}
    onSave={handleSaveConnection}
/>
```

### 6. Agregar Loading Overlay

```typescript
{/* Indicador de carga al obtener detalles de conexión */}
{isLoadingConnection && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-700 dark:text-gray-300">Cargando detalles de la conexión...</p>
        </div>
    </div>
)}
```

---

## 🔌 Endpoint Utilizado

### Request:
```http
GET /api/v2/connections/:id
Authorization: Bearer {token}
X-Tenant-Id: {tenantId}
```

### Response Esperado:
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

---

## 🎯 Flujo Completo Paso a Paso

### 1. Usuario hace click en "Editar"
```typescript
<button onClick={() => handleEditConnection(connection)}>
    <Edit2 /> Editar
</button>
```

### 2. Se muestra loading overlay
```
┌────────────────────────────────┐
│                                │
│    ⏳ Loading spinner          │
│    Cargando detalles de la    │
│    conexión...                 │
│                                │
└────────────────────────────────┘
```

### 3. Se llama al endpoint del backend
```typescript
await selectConnection(connection.id);
// Internamente llama a:
// GET /api/v2/connections/:id
```

### 4. El hook actualiza `selectedConnection`
```typescript
// useConnectionsV2 internamente hace:
setSelectedConnection(response.data);
```

### 5. Se abre el modal con datos completos
```typescript
setTimeout(() => {
    setShowModal(true);
    setIsLoadingConnection(false);
}, 100);
```

### 6. Modal se renderiza con datos del backend
```typescript
<ConnectionModal
    editingConnection={selectedConnection} // ← Datos completos
    ...
/>
```

---

## 🧪 Cómo Verificar

### 1. Abrir DevTools (F12) → Network

### 2. Ir a `/dashboard/connections`

### 3. Click en ⋮ → "Editar" en cualquier conexión

### 4. Verificar Request en Network:
```
Request URL: http://127.0.0.1:3330/api/v2/connections/1
Request Method: GET
Status Code: 200 OK
```

### 5. Verificar Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "connectionName": "...",
    "channelConfig": { ... },  // ← Datos completos
    "connectionMetadata": { ... } // ← Metadata completa
  }
}
```

### 6. Verificar UI:
- ✅ Se muestra overlay de loading
- ✅ Loading desaparece después de cargar
- ✅ Modal se abre con todos los datos
- ✅ Campos del modal están pre-llenados con datos del backend

---

## 📊 Beneficios

### ✅ Datos Siempre Actualizados
El modal siempre tiene los datos más recientes del backend, no datos en caché de la lista.

### ✅ Datos Completos
Incluye toda la información que el backend proporciona:
- `channelConfig` completo (tokens, credenciales, etc.)
- `connectionMetadata` completo (estadísticas, device info, etc.)
- Todos los campos opcionales

### ✅ Sincronización Garantizada
Si otro usuario modificó la conexión, verás los cambios más recientes.

### ✅ Mejor UX
El usuario ve un indicador de carga mientras se obtienen los datos.

---

## ⚠️ Consideraciones

### 1. Timeout
Si el backend tarda mucho en responder, el usuario verá el loading indefinidamente. Se puede agregar un timeout:

```typescript
const timeoutId = setTimeout(() => {
    setIsLoadingConnection(false);
    alert('Tiempo de espera agotado');
}, 10000); // 10 segundos

await selectConnection(connection.id);
clearTimeout(timeoutId);
```

### 2. Error Handling
Si el backend devuelve error, se muestra un alert. Se puede mejorar con un toast notification:

```typescript
catch (error) {
    // En lugar de alert(), usar un toast
    showToast('Error al cargar los detalles', 'error');
}
```

### 3. Delay de 100ms
Se usa un `setTimeout` de 100ms para asegurar que el estado se actualice antes de abrir el modal. Esto es necesario porque React puede agrupar actualizaciones de estado.

---

## 🔄 Flujo del Hook `useConnectionsV2`

### Cuando se llama `selectConnection(id)`:
```typescript
// 1. Actualizar estado
setIsLoading(true);
setError(null);

// 2. Llamar al servicio
const response = await connectionsV2Service.getConnection(connectionId);

// 3. Actualizar selectedConnection
if (response.success) {
    setSelectedConnection(response.data);
}

// 4. Finalizar loading
setIsLoading(false);
```

---

## 📁 Archivos Modificados

- **`src/components/connections/ConnectionsPage.tsx`**
  - Agregado estado `isLoadingConnection`
  - Agregado uso de `selectConnection` y `selectedConnection`
  - Actualizado `handleEditConnection` para cargar datos del backend
  - Actualizado `handleSaveConnection` para usar `selectedConnection`
  - Agregado loading overlay
  - Actualizado modal para usar datos del backend

---

## ✅ Resumen

| Cambio | Estado |
|--------|--------|
| Cargar datos con GET /api/v2/connections/:id | ✅ Completado |
| Mostrar loading mientras carga | ✅ Completado |
| Abrir modal con datos del backend | ✅ Completado |
| Usar selectedConnection en guardar | ✅ Completado |
| Manejo de errores | ✅ Completado |

---

**Fecha**: 2025-10-25
**Estado**: ✅ COMPLETADO
