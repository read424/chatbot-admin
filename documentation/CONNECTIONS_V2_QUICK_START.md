# Quick Start: Connections V2

## 🚀 Inicio Rápido en 5 Minutos

### 1. Importar el Hook

```typescript
import { useConnectionsV2 } from '@/hooks/useConnectionsV2';
```

### 2. Usar en tu Componente

```typescript
'use client';

import { useConnectionsV2 } from '@/hooks/useConnectionsV2';

export default function ConnectionsPage() {
  const {
    connections,
    isLoading,
    error,
    fetchConnections,
  } = useConnectionsV2({ autoFetch: true });

  if (isLoading) return <p>Cargando conexiones...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Mis Conexiones</h1>
      <button onClick={() => fetchConnections()}>Refrescar</button>

      <ul>
        {connections.map(conn => (
          <li key={conn.id}>
            {conn.connectionName} - {conn.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 3. Filtrar Conexiones

```typescript
// Solo WhatsApp Web activas
const { connections } = useConnectionsV2({
  autoFetch: true,
  initialFilters: {
    channelType: 'whatsapp_web',
    status: 'active'
  }
});
```

### 4. Crear Nueva Conexión

```typescript
const { createConnection, isCreating } = useConnectionsV2();

const handleCreate = async () => {
  const newConn = await createConnection({
    connectionName: "WhatsApp Ventas",
    channelType: "whatsapp_web",
    departmentId: 1,
    welcomeMessage: "¡Hola! Bienvenido",
    chatbotTimeout: 30
  });

  if (newConn) {
    alert('Conexión creada: ' + newConn.id);
  }
};

return (
  <button onClick={handleCreate} disabled={isCreating}>
    {isCreating ? 'Creando...' : 'Nueva Conexión'}
  </button>
);
```

### 5. Activar y Obtener QR

```typescript
const { activateConnection, getQRCode } = useConnectionsV2();

const handleActivate = async (connectionId: number) => {
  // Activar conexión
  const success = await activateConnection(connectionId);

  if (success) {
    // Obtener QR
    const qrCode = await getQRCode(connectionId);

    if (qrCode) {
      // Mostrar QR
      setQrImage(qrCode);
    }
  }
};
```

---

## 📦 Ejemplo Completo: Componente de Tabla

```typescript
'use client';

import { useConnectionsV2 } from '@/hooks/useConnectionsV2';
import { useState } from 'react';
import type { ChannelType, ConnectionStatus } from '@/types/connectionsV2';

export default function ConnectionsTable() {
  const [channelFilter, setChannelFilter] = useState<ChannelType | undefined>();
  const [statusFilter, setStatusFilter] = useState<ConnectionStatus | undefined>();

  const {
    connections,
    pagination,
    isLoading,
    error,
    fetchConnections,
    deleteConnection,
    activateConnection,
    deactivateConnection,
    clearError
  } = useConnectionsV2({
    autoFetch: true,
    initialFilters: { page: 1, limit: 20 }
  });

  const handleFilter = () => {
    fetchConnections({
      channelType: channelFilter,
      status: statusFilter,
      page: 1,
      limit: 20
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Eliminar esta conexión?')) {
      await deleteConnection(id);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Conexiones</h1>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <select
          value={channelFilter || ''}
          onChange={(e) => setChannelFilter(e.target.value as ChannelType || undefined)}
        >
          <option value="">Todos los canales</option>
          <option value="whatsapp_web">WhatsApp Web</option>
          <option value="instagram_direct">Instagram Direct</option>
          <option value="facebook_messenger">Facebook Messenger</option>
          <option value="telegram">Telegram</option>
        </select>

        <select
          value={statusFilter || ''}
          onChange={(e) => setStatusFilter(e.target.value as ConnectionStatus || undefined)}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="authenticated">Autenticado</option>
          <option value="error">Error</option>
        </select>

        <button onClick={handleFilter} className="px-4 py-2 bg-blue-500 text-white">
          Filtrar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={clearError} className="ml-4 font-bold">×</button>
        </div>
      )}

      {/* Loading */}
      {isLoading && <p>Cargando conexiones...</p>}

      {/* Tabla */}
      {!isLoading && (
        <>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">ID</th>
                <th className="border p-2">Nombre</th>
                <th className="border p-2">Canal</th>
                <th className="border p-2">Estado</th>
                <th className="border p-2">Departamento</th>
                <th className="border p-2">Última Actividad</th>
                <th className="border p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {connections.map(conn => (
                <tr key={conn.id}>
                  <td className="border p-2">{conn.id}</td>
                  <td className="border p-2">{conn.connectionName}</td>
                  <td className="border p-2">{conn.channelType}</td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded ${
                      conn.status === 'active' || conn.status === 'authenticated'
                        ? 'bg-green-200'
                        : 'bg-gray-200'
                    }`}>
                      {conn.status}
                    </span>
                  </td>
                  <td className="border p-2">{conn.departmentId || '-'}</td>
                  <td className="border p-2">
                    {conn.lastSeen
                      ? new Date(conn.lastSeen).toLocaleString()
                      : 'Nunca'}
                  </td>
                  <td className="border p-2">
                    <div className="flex gap-2">
                      {conn.status === 'inactive' && (
                        <button
                          onClick={() => activateConnection(conn.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded"
                        >
                          Activar
                        </button>
                      )}

                      {(conn.status === 'active' || conn.status === 'authenticated') && (
                        <button
                          onClick={() => deactivateConnection(conn.id)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded"
                        >
                          Desactivar
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(conn.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          {pagination && (
            <div className="flex justify-between items-center mt-4">
              <p>
                Mostrando {connections.length} de {pagination.totalItems} conexiones
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => fetchConnections({ page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                >
                  Anterior
                </button>

                <span className="px-4 py-2">
                  Página {pagination.page} de {pagination.totalPages}
                </span>

                <button
                  onClick={() => fetchConnections({ page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

---

## 🎯 Casos de Uso Comunes

### Listar solo conexiones activas de WhatsApp

```typescript
const { connections } = useConnectionsV2({
  autoFetch: true,
  initialFilters: {
    channelType: 'whatsapp_web',
    isActive: true
  }
});
```

### Crear conexión de Instagram con credenciales

```typescript
const { createConnection } = useConnectionsV2();

const newInstagram = await createConnection({
  connectionName: "Instagram Soporte",
  channelType: "instagram_direct",
  departmentId: 2,
  channelCredentials: {
    accessToken: "EAAD...",
    verifyToken: "instagram_verify_123",
    pageId: "123456789",
    instagramAccountId: "17841234567890"
  }
});
```

### Actualizar mensaje de bienvenida

```typescript
const { updateConnection } = useConnectionsV2();

await updateConnection(1, {
  welcomeMessage: "¡Hola! Bienvenido a nuestro nuevo servicio",
  chatbotTimeout: 45
});
```

### Obtener estadísticas de la última semana

```typescript
const { getConnectionStats } = useConnectionsV2();

const stats = await getConnectionStats(1, {
  period: 'week',
  timezone: 'America/Mexico_City'
});

console.log('Total mensajes:', stats.stats.totalMessages);
console.log('Uptime:', stats.stats.uptime);
```

### Ver resumen de todas las conexiones

```typescript
const { getSummary } = useConnectionsV2();

const summary = await getSummary();

console.log('Total:', summary.summary.totalConnections);
console.log('Activas:', summary.summary.activeConnections);
console.log('Por canal:', summary.summary.byChannelType);
```

---

## 📚 Recursos

- **Documentación completa**: `documentation/CONNECTIONS_V2_USAGE_GUIDE.md`
- **API Reference**: `documentation/API_V2_CHANNEL_CONNECTIONS.md`
- **Tipos**: `src/types/connectionsV2.ts`

---

¡Listo para usar! 🎉
