# Connections V2 - Sistema de Gestión de Canales

## 🚀 Nuevo Recurso Implementado

Se ha implementado el sistema completo para gestionar conexiones de canales multi-plataforma usando el **API v2** del backend.

---

## 📦 ¿Qué incluye?

### 1. **Servicio API Completo**
- 11 endpoints implementados
- Listar, crear, actualizar, eliminar conexiones
- Activar/desactivar, obtener QR, probar conexión
- Estadísticas y resúmenes

### 2. **Hook Personalizado**
- Gestión de estado completa
- Auto-fetch opcional
- Filtros y paginación
- Manejo de errores

### 3. **Tipos TypeScript**
- Type-safe al 100%
- Interfaces completas
- Type guards incluidos

### 4. **Documentación**
- Guía completa de uso
- Quick start guide
- Ejemplos funcionales

### 5. **Componente de Ejemplo**
- Tabla completa con filtros
- CRUD funcional
- Paginación integrada

---

## 🎯 Uso Rápido

### Importar y usar el hook:

```typescript
import { useConnectionsV2 } from '@/hooks/useConnectionsV2';

function ConnectionsPage() {
  const { connections, isLoading, fetchConnections } = useConnectionsV2({
    autoFetch: true
  });

  if (isLoading) return <p>Cargando...</p>;

  return (
    <div>
      {connections.map(conn => (
        <div key={conn.id}>{conn.connectionName}</div>
      ))}
    </div>
  );
}
```

### O usar el servicio directamente:

```typescript
import { connectionsV2Service } from '@/lib/api';

const { data } = await connectionsV2Service.getConnections({
  channelType: 'whatsapp_web',
  status: 'active'
});
```

---

## 📁 Archivos Principales

```
src/
├── types/connectionsV2.ts                     # Tipos TypeScript
├── lib/api/services/connectionsV2.ts          # Servicio API
├── hooks/useConnectionsV2.ts                  # Hook personalizado
└── components/examples/ConnectionsV2Example.tsx  # Componente ejemplo

documentation/
├── API_V2_CHANNEL_CONNECTIONS.md              # API backend
├── CONNECTIONS_V2_USAGE_GUIDE.md              # Guía completa
├── CONNECTIONS_V2_QUICK_START.md              # Inicio rápido
└── CONNECTIONS_V2_IMPLEMENTATION_SUMMARY.md   # Resumen
```

---

## 📚 Documentación

1. **Quick Start**: `documentation/CONNECTIONS_V2_QUICK_START.md`
2. **Guía Completa**: `documentation/CONNECTIONS_V2_USAGE_GUIDE.md`
3. **API Reference**: `documentation/API_V2_CHANNEL_CONNECTIONS.md`

---

## ✅ Todo está listo para usar

El sistema está completamente implementado y documentado. Solo necesitas:

1. Importar el hook o servicio
2. Usar en tus componentes
3. ¡Disfrutar! 🎉

---

**Backend API**: `http://127.0.0.1:3330/api/v2/connections`
