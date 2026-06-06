# 🔗 Conexiones de WhatsApp - Documentación

## 📋 Descripción

Este módulo implementa la funcionalidad para crear y gestionar conexiones de WhatsApp usando la librería `whatsapp-web.js` en el backend y SocketIO para la comunicación en tiempo real.

## 🏗️ Arquitectura

### Frontend (React + Next.js)
- **ConnectionsPage**: Lista y gestiona las conexiones
- **QRModal**: Modal para mostrar el código QR y manejar la conexión
- **useWhatsAppConnection**: Hook personalizado para la lógica de conexión
- **SocketIOContext**: Contexto para manejar la conexión WebSocket

### Backend (Node.js + SocketIO)
- **Endpoint**: `POST /api/whatsapp/new-connection`
- **WebSocket Events**: `qrCode`, `connection_ready`, `connection_error`

## 🚀 Flujo de Conexión

### 1. Usuario hace clic en "Conectar"
```typescript
const handleConnectQR = async (connection: Connection) => {
  // Solo permitir conexiones de WhatsApp
  if (connection.type !== 'whatsapp' && connection.type !== 'whatsapp_business') {
    return;
  }
  
  setQRConnection(connection);
  setShowQRModal(true);
};
```

### 2. Se abre el QRModal y se crea la conexión
```typescript
useEffect(() => {
  if (isOpen && isConnected) {
    createConnection();
  }
}, [isOpen, isConnected, createConnection]);
```

### 3. Se envía petición al backend
```typescript
const response = await ConnectionsService.createWhatsAppConnection({
  clientId: newClientId,
  connectionName: connectionName,
  department: 'General'
});
```

### 4. Backend genera código QR y emite evento
```javascript
// En el backend
this.webSocketAdapter.emit('qrCode', { 
  qr: base64Q, 
  clientId: this.clientId,
  tenantId: this.tenantId
});
```

### 5. Frontend recibe el código QR
```typescript
const handleQRCode = (data: any) => {
  if (data.clientId === clientId) {
    setQrCode(data.qr);
    setStatus('qr_ready');
  }
};
```

## 🔧 Configuración

### Variables de Entorno
```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://127.0.0.1:3330

# WebSocket URL (SocketIO)
NEXT_PUBLIC_WS_URL=http://127.0.0.1:3330
```

### Endpoints del Backend
- `POST /api/whatsapp/new-connection` - Crear nueva conexión
- `GET /api/whatsapp/connection-status/:id` - Estado de la conexión

### Eventos WebSocket
- `qrCode` - Código QR generado
- `connection_ready` - Conexión establecida
- `connection_error` - Error en la conexión

## 📱 Uso del Usuario

1. **Ir a la página de Conexiones**
2. **Seleccionar una conexión de WhatsApp**
3. **Hacer clic en "Conectar"**
4. **Escanear el código QR con WhatsApp**
5. **Esperar confirmación de conexión**

## 🛠️ Componentes Principales

### ConnectionsPage
- Lista todas las conexiones disponibles
- Permite crear nuevas conexiones
- Botón "Conectar" para conexiones de WhatsApp

### QRModal
- Muestra el código QR generado
- Maneja estados de la conexión
- Proporciona instrucciones de escaneo

### useWhatsAppConnection Hook
- Gestiona el estado de la conexión
- Escucha eventos WebSocket
- Maneja errores y reintentos

## 🔍 Estados de la Conexión

- `idle` - Estado inicial
- `creating` - Creando conexión en el backend
- `waiting_qr` - Esperando código QR
- `qr_ready` - Código QR disponible
- `connecting` - QR escaneado, conectando
- `connected` - Conexión establecida
- `error` - Error en la conexión

## 🚨 Manejo de Errores

- **Error de WebSocket**: Muestra mensaje de conexión perdida
- **Error del Backend**: Muestra mensaje específico del error
- **Timeout**: Permite reintentar la conexión
- **Validación**: Solo permite conexiones de WhatsApp

## 🔄 Reintentos

El usuario puede reintentar la conexión en caso de:
- Error en la creación
- Expiración del código QR
- Problemas de conectividad

## 📊 Logs y Debugging

- Console logs para eventos WebSocket
- Console logs para errores de API
- Estado visible en la UI
- Mensajes de error descriptivos

## 🎯 Próximos Pasos

1. **Persistencia**: Guardar estado de conexiones en base de datos
2. **Múltiples Dispositivos**: Soporte para múltiples conexiones simultáneas
3. **Notificaciones**: Alertas push para cambios de estado
4. **Métricas**: Dashboard de conexiones activas/inactivas
5. **Configuración Avanzada**: Parámetros personalizables por conexión
