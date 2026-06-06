# Guía de Uso: Connections V2 Service

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Instalación](#instalación)
3. [Uso Básico](#uso-básico)
4. [Uso con Hook](#uso-con-hook)
5. [Ejemplos Completos](#ejemplos-completos)
6. [Referencia de API](#referencia-de-api)
7. [Manejo de Errores](#manejo-de-errores)

---

## Descripción General

El servicio **Connections V2** proporciona una interfaz completa para gestionar conexiones de canales multi-plataforma (WhatsApp, Instagram, Facebook, Telegram, etc).

### Características:
- ✅ Listar conexiones con filtros y paginación
- ✅ Crear, actualizar y eliminar conexiones
- ✅ Activar/desactivar conexiones
- ✅ Obtener código QR para WhatsApp Web
- ✅ Probar conexiones
- ✅ Estadísticas de uso
- ✅ Resumen de todas las conexiones

### Archivos del Sistema:
```
src/
├── types/connectionsV2.ts              # Tipos TypeScript
├── lib/api/services/connectionsV2.ts   # Servicio API
└── hooks/useConnectionsV2.ts           # Hook personalizado
```

---

## Instalación

Los archivos ya están integrados en el proyecto. Para usarlos:

```typescript
// Importar servicio directo
import { connectionsV2Service } from '@/lib/api/services/connectionsV2';

// O importar hook
import { useConnectionsV2 } from '@/hooks/useConnectionsV2';

// O importar tipos
import type { ConnectionV2, ChannelType } from '@/types/connectionsV2';
```

---

## Uso Básico

### 1. Listar Conexiones

```typescript
import { connectionsV2Service } from '@/lib/api';

// Obtener todas las conexiones
async function loadConnections() {
  try {
    const response = await connectionsV2Service.getConnections();

    console.log('Total:', response.data.pagination.totalItems);
    console.log('Conexiones:', response.data.connections);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### 2. Filtrar Conexiones

```typescript
// Filtrar por tipo de canal
const { data } = await connectionsV2Service.getConnections({
  channelType: 'whatsapp_web'
});

// Filtrar conexiones activas
const { data } = await connectionsV2Service.getConnections({
  status: 'active',
  isActive: true
});

// Filtrar por departamento con paginación
const { data } = await connectionsV2Service.getConnections({
  departmentId: 1,
  page: 1,
  limit: 20
});

// Combinar múltiples filtros
const { data } = await connectionsV2Service.getConnections({
  channelType: 'instagram_direct',
  status: 'active',
  departmentId: 2,
  page: 1,
  limit: 50
});
```

### 3. Crear Conexión

```typescript
// WhatsApp Web (no requiere credenciales)
const whatsappConnection = await connectionsV2Service.createConnection({
  connectionName: "WhatsApp Ventas",
  channelType: "whatsapp_web",
  departmentId: 1,
  welcomeMessage: "¡Hola! Bienvenido",
  goodbyeMessage: "¡Hasta pronto!",
  chatbotTimeout: 30
});

// Instagram Direct (requiere credenciales)
const instagramConnection = await connectionsV2Service.createConnection({
  connectionName: "Instagram Soporte",
  channelType: "instagram_direct",
  departmentId: 2,
  channelCredentials: {
    accessToken: "EAAD...",
    verifyToken: "instagram_verify_token_123",
    pageId: "123456789",
    instagramAccountId: "17841234567890"
  }
});

console.log('ID de conexión:', instagramConnection.data.id);
```

### 4. Obtener Detalles de Conexión

```typescript
const { data } = await connectionsV2Service.getConnection(1);

console.log('Nombre:', data.connectionName);
console.log('Estado:', data.status);
console.log('Último mensaje:', data.lastSeen);
console.log('Metadata:', data.connectionMetadata);
```

### 5. Activar/Desactivar Conexión

```typescript
// Activar
const activateResponse = await connectionsV2Service.activateConnection(1);

if (activateResponse.data.nextStep?.action === 'scan_qr') {
  console.log('Escanea QR en:', activateResponse.data.nextStep.endpoint);
}

// Desactivar
const deactivateResponse = await connectionsV2Service.deactivateConnection(1, {
  reason: "Mantenimiento programado"
});
```

### 6. Obtener Código QR (WhatsApp Web)

```typescript
const { data } = await connectionsV2Service.getQRCode(1);

if (data.qrCode) {
  // Mostrar en imagen
  return <img src={data.qrCode} alt="QR Code" />;
} else if (data.message) {
  // Ya está autenticado
  console.log('Autenticado como:', data.phoneNumber);
}
```

---

## Uso con Hook

El hook `useConnectionsV2` facilita la gestión de estado en componentes React.

### Ejemplo Básico

```typescript
import { useConnectionsV2 } from '@/hooks/useConnectionsV2';

function ConnectionsPage() {
  const {
    connections,
    isLoading,
    error,
    fetchConnections,
    createConnection,
    activateConnection
  } = useConnectionsV2({ autoFetch: true });

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Conexiones ({connections.length})</h1>
      {connections.map(conn => (
        <div key={conn.id}>
          {conn.connectionName} - {conn.status}
        </div>
      ))}
    </div>
  );
}
```

### Filtrado con Hook

```typescript
function FilteredConnections() {
  const {
    connections,
    isLoading,
    fetchConnections
  } = useConnectionsV2({
    autoFetch: true,
    initialFilters: {
      channelType: 'whatsapp_web',
      status: 'active'
    }
  });

  // Cambiar filtros
  const handleFilterChange = (newFilters) => {
    fetchConnections(newFilters);
  };

  return (
    <div>
      <button onClick={() => handleFilterChange({ status: 'active' })}>
        Solo Activas
      </button>
      <button onClick={() => handleFilterChange({ channelType: 'instagram_direct' })}>
        Solo Instagram
      </button>

      {connections.map(conn => (
        <ConnectionCard key={conn.id} connection={conn} />
      ))}
    </div>
  );
}
```

### CRUD Completo con Hook

```typescript
function ConnectionManager() {
  const {
    connections,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createConnection,
    updateConnection,
    deleteConnection,
    activateConnection,
    clearError
  } = useConnectionsV2({ autoFetch: true });

  const handleCreate = async () => {
    const newConnection = await createConnection({
      connectionName: "Nueva Conexión",
      channelType: "whatsapp_web",
      departmentId: 1
    });

    if (newConnection) {
      alert('Conexión creada: ' + newConnection.id);
    }
  };

  const handleUpdate = async (id: number) => {
    const updated = await updateConnection(id, {
      welcomeMessage: "Mensaje actualizado"
    });

    if (updated) {
      alert('Conexión actualizada');
    }
  };

  const handleDelete = async (id: number) => {
    const success = await deleteConnection(id);

    if (success) {
      alert('Conexión eliminada');
    }
  };

  const handleActivate = async (id: number) => {
    const success = await activateConnection(id);

    if (success) {
      alert('Conexión activada');
    }
  };

  return (
    <div>
      {error && (
        <div className="error">
          {error}
          <button onClick={clearError}>Cerrar</button>
        </div>
      )}

      <button onClick={handleCreate} disabled={isCreating}>
        {isCreating ? 'Creando...' : 'Nueva Conexión'}
      </button>

      {connections.map(conn => (
        <div key={conn.id}>
          <h3>{conn.connectionName}</h3>
          <p>Estado: {conn.status}</p>

          <button onClick={() => handleUpdate(conn.id)} disabled={isUpdating}>
            Actualizar
          </button>

          <button onClick={() => handleActivate(conn.id)}>
            Activar
          </button>

          <button onClick={() => handleDelete(conn.id)} disabled={isDeleting}>
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Ejemplos Completos

### Ejemplo 1: Página de Conexiones con Tabla

```typescript
import { useConnectionsV2 } from '@/hooks/useConnectionsV2';
import { useState } from 'react';

function ConnectionsTable() {
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const {
    connections,
    pagination,
    isLoading,
    fetchConnections,
    deleteConnection
  } = useConnectionsV2({
    autoFetch: true,
    initialFilters: filters
  });

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    fetchConnections(newFilters);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar conexión?')) {
      await deleteConnection(id);
    }
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Canal</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {connections.map(conn => (
            <tr key={conn.id}>
              <td>{conn.id}</td>
              <td>{conn.connectionName}</td>
              <td>{conn.channelType}</td>
              <td>{conn.status}</td>
              <td>
                <button onClick={() => handleDelete(conn.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && (
        <div>
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Anterior
          </button>

          <span>Página {pagination.page} de {pagination.totalPages}</span>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
```

### Ejemplo 2: Modal de WhatsApp QR

```typescript
import { useState } from 'react';
import { useConnectionsV2 } from '@/hooks/useConnectionsV2';

function WhatsAppQRModal({ connectionId }: { connectionId: number }) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const { getQRCode } = useConnectionsV2();

  const loadQR = async () => {
    const qr = await getQRCode(connectionId);
    setQrCode(qr);
  };

  return (
    <div className="modal">
      <h2>Escanea el Código QR</h2>

      {!qrCode ? (
        <button onClick={loadQR}>Generar QR</button>
      ) : (
        <>
          <img src={qrCode} alt="QR Code" width={300} />
          <p>Escanea este código con WhatsApp</p>
          <button onClick={loadQR}>Refrescar QR</button>
        </>
      )}
    </div>
  );
}
```

### Ejemplo 3: Dashboard de Resumen

```typescript
import { useConnectionsV2 } from '@/hooks/useConnectionsV2';
import { useEffect, useState } from 'react';

function ConnectionsDashboard() {
  const [summary, setSummary] = useState(null);
  const { getSummary } = useConnectionsV2();

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    const data = await getSummary();
    setSummary(data?.summary);
  };

  if (!summary) return <div>Cargando resumen...</div>;

  return (
    <div>
      <h1>Dashboard de Conexiones</h1>

      <div className="stats">
        <div>
          <h3>Total Conexiones</h3>
          <p>{summary.totalConnections}</p>
        </div>

        <div>
          <h3>Activas</h3>
          <p>{summary.activeConnections}</p>
        </div>

        <div>
          <h3>Inactivas</h3>
          <p>{summary.inactiveConnections}</p>
        </div>
      </div>

      <h2>Por Canal</h2>
      {summary.byChannelType.map(channel => (
        <div key={channel.channelType}>
          {channel.channelType}: {channel.count} ({channel.active} activas)
        </div>
      ))}

      <h2>Métricas 24h</h2>
      <p>Mensajes: {summary.totalMessages24h}</p>
      <p>Conversaciones activas: {summary.activeConversations}</p>
      <p>Tiempo de respuesta: {summary.averageResponseTime}</p>
    </div>
  );
}
```

---

## Referencia de API

### Métodos del Servicio

| Método | Descripción | Endpoint |
|--------|-------------|----------|
| `getConnections(params?)` | Listar conexiones con filtros | `GET /api/v2/connections` |
| `getConnection(id)` | Obtener detalles de una conexión | `GET /api/v2/connections/:id` |
| `createConnection(data)` | Crear nueva conexión | `POST /api/v2/connections` |
| `updateConnection(id, data)` | Actualizar conexión | `PUT /api/v2/connections/:id` |
| `deleteConnection(id, permanent?)` | Eliminar conexión | `DELETE /api/v2/connections/:id` |
| `activateConnection(id)` | Activar conexión | `POST /api/v2/connections/:id/activate` |
| `deactivateConnection(id, data?)` | Desactivar conexión | `POST /api/v2/connections/:id/deactivate` |
| `getQRCode(id)` | Obtener código QR (WhatsApp Web) | `GET /api/v2/connections/:id/qr` |
| `testConnection(id, data)` | Probar conexión | `POST /api/v2/connections/:id/test` |
| `getConnectionStats(id, params?)` | Obtener estadísticas | `GET /api/v2/connections/:id/stats` |
| `getConnectionsSummary()` | Obtener resumen de todas | `GET /api/v2/connections/summary` |

### Métodos del Hook

| Método | Descripción |
|--------|-------------|
| `fetchConnections(params?)` | Cargar lista de conexiones |
| `refreshConnections()` | Recargar con los mismos filtros |
| `selectConnection(id)` | Seleccionar y cargar detalles |
| `clearSelection()` | Limpiar selección |
| `createConnection(data)` | Crear nueva conexión |
| `updateConnection(id, data)` | Actualizar conexión |
| `deleteConnection(id, permanent?)` | Eliminar conexión |
| `activateConnection(id)` | Activar conexión |
| `deactivateConnection(id, data?)` | Desactivar conexión |
| `testConnection(id, data)` | Probar conexión |
| `getQRCode(id)` | Obtener código QR |
| `getConnectionStats(id, params?)` | Obtener estadísticas |
| `getSummary()` | Obtener resumen |
| `clearError()` | Limpiar error |
| `findConnectionById(id)` | Buscar en lista actual |

---

## Manejo de Errores

### Con Servicio Directo

```typescript
try {
  const { data } = await connectionsV2Service.getConnections();
  console.log('Conexiones:', data.connections);
} catch (error: any) {
  console.error('Error:', error.message);

  if (error.status === 401) {
    // Token expirado, redirigir a login
    window.location.href = '/login';
  } else if (error.status === 403) {
    // Sin permisos
    alert('No tienes permisos para ver conexiones');
  } else {
    // Otro error
    alert('Error al cargar conexiones');
  }
}
```

### Con Hook

```typescript
const { connections, error, clearError } = useConnectionsV2();

// Mostrar error en UI
{error && (
  <div className="error-banner">
    {error}
    <button onClick={clearError}>Cerrar</button>
  </div>
)}
```

---

## Tipos de Canales

```typescript
type ChannelType =
  | 'whatsapp_web'          // WhatsApp Web (QR)
  | 'whatsapp_api'          // WhatsApp Business API
  | 'instagram_direct'      // Instagram Direct Messages
  | 'facebook_messenger'    // Facebook Messenger
  | 'telegram'              // Telegram Bot
  | 'webchat';              // Chat Web personalizado
```

## Estados de Conexión

```typescript
type ConnectionStatus =
  | 'inactive'        // Creada pero no activada
  | 'connecting'      // Intentando conectar (WhatsApp Web)
  | 'authenticated'   // Autenticada - QR escaneado
  | 'active'          // Activa y funcionando
  | 'disconnected'    // Desconectada
  | 'error';          // Error
```

---

## Notas Importantes

1. **Autenticación**: Todos los endpoints requieren token JWT en header `Authorization`
2. **Multi-tenant**: El `X-Tenant-Id` header es obligatorio
3. **WhatsApp Web**: Requiere escanear QR después de activar
4. **Meta Channels**: Instagram/Facebook requieren `channelCredentials`
5. **Paginación**: Default es 20 items por página, máximo 100
6. **Rate Limiting**: 100 peticiones por minuto por tenant

---

## Recursos

- **Documentación API**: `documentation/API_V2_CHANNEL_CONNECTIONS.md`
- **Tipos**: `src/types/connectionsV2.ts`
- **Servicio**: `src/lib/api/services/connectionsV2.ts`
- **Hook**: `src/hooks/useConnectionsV2.ts`

---

¡Listo para usar! 🚀
