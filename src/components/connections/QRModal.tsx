'use client';

import { useWhatsAppConnection } from '@/hooks/useWhatsAppConnection';
import { ProviderType } from '@/types/connections';
import { AlertCircle, CheckCircle, Loader2, QrCode, RefreshCw, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface QRModalProps {
    isOpen: boolean;
    onClose: () => void;
    connectionId: string;
    connectionName: string;
    connectionType: ProviderType;
    tenantId: string;
}

interface QRStatus {
    status: 'loading' | 'qr_ready' | 'connecting' | 'connected' | 'error' | 'timeout';
    qrCode?: string;
    message?: string;
    showRetry?: boolean;
}

export const QRModal: React.FC<QRModalProps> = ({
    isOpen,
    onClose,
    connectionId,
    connectionName,
    connectionType,
    tenantId
})=>{
    const {
        qrCode,
        status,
        errorMessage,
        isConnected,
        qrAttempts,
        maxQrAttempts,
        isQrTimeout,
        createConnection,
        restartConnection
    } = useWhatsAppConnection({
        connectionId,
        connectionName,
        tenantId,
        onSuccess: () => {
            // WhatsApp conectado exitosamente
            console.log('WhatsApp conectado exitosamente');
        },
        onError: (error) => {
            console.error('Connection error:', error);
        }
    });

    const hasStartedConnection = useRef(false);

    useEffect(() => {
        console.log('[MODAL] useEffect ejecutado', { isOpen, status, isConnected });
        if (isOpen && isConnected && !hasStartedConnection.current) {
            hasStartedConnection.current = true;
            createConnection();
        }
        
        // Reset cuando se cierre el modal
        if (!isOpen) {
            hasStartedConnection.current = false;
        }
    }, [isOpen, isConnected]);

    useEffect(() => {
        if(status === 'connected') {
            const timer = setTimeout(()=>{
                onClose();
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [status, onClose]);

    // Mapear el status del hook al formato del componente
    const getQRStatus = (): QRStatus => {
        switch (status) {
            case 'creating':
            case 'waiting_qr':
                return { status: 'loading', message: 'Creando conexión de WhatsApp...' };
            case 'qr_ready':
                return { 
                    status: 'qr_ready', 
                    qrCode: qrCode, 
                    message: `Escanea el código QR con WhatsApp` 
                };
            case 'connecting':
                return { status: 'connecting', message: 'QR escaneado, conectando WhatsApp...' };
            case 'connected':
                return { status: 'connected', message: '¡WhatsApp conectado exitosamente!' };
            case 'timeout':
                return { 
                    status: 'timeout', 
                    message: 'Se alcanzó el límite máximo de códigos QR. Haz clic en el botón para reintentar.',
                    showRetry: true
                };
            case 'error':
                return { status: 'error', message: errorMessage };
            default:
                return { status: 'loading', message: 'Iniciando...' };
        }
    };

    const qrStatus = getQRStatus();

    const handleRetryConnection = async () => {
        console.log('Intentando reiniciar conexión...');
        await restartConnection();
    };

    const getStatusContent = () => {
        switch (qrStatus.status) {
            case 'loading':
              return (
                <div className="flex flex-col items-center py-8">
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">{qrStatus.message}</p>
                </div>
              );
      
            case 'qr_ready':
              return (
                <div className="flex flex-row items-center gap-6">
                    {/* QR Code a la izquierda */}
                    <div className="flex-shrink-0">
                        <div className="bg-white p-4 rounded-lg shadow-lg">
                            {qrStatus.qrCode ? (
                                <>
                                <img
                                    src={`${qrStatus.qrCode}`} 
                                    alt="QR Code"
                                    className={`w-48 h-48 ${status === 'connecting' ? 'opacity-30' : ''}`}
                                    onError={(e) => {
                                        console.error('Error cargando imagen QR:', e);
                                    }}
                                />
                                {/* Overlay cuando está connecting */}
                                {status === 'connecting' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                                      <CheckCircle className="w-12 h-12 text-green-500" />
                                    </div>
                                )}
                                </>
                            ) : (
                                <div className="w-48 h-48 bg-gray-100 flex items-center justify-center relative">
                                    <QrCode className="w-16 h-16 text-gray-400" />
                                    <div className="absolute bottom-2 text-xs text-red-500">
                                        Debug: QR ausente
                                    </div>                                    
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Instrucciones a la derecha */}
                    <div className="flex-1">
                        <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg font-medium">
                            {qrStatus.message}
                        </p>
                        <div className="text-sm text-gray-500 dark:text-gray-500 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">1</span>
                                <span>Abre WhatsApp en tu teléfono</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">2</span>
                                <span>Ve a Configuración → Dispositivos vinculados</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">3</span>
                                <span>Toca "Vincular un dispositivo"</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">4</span>
                                <span>Escanea este código QR</span>
                            </div>
                        </div>
                    </div>
                </div>
              );
      
            case 'connecting':
              return (
                <div className="flex flex-col items-center py-8">
                  <div className="relative">
                    <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                    <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{qrStatus.message}</p>
                </div>
              );
      
            case 'connected':
              return (
                <div className="flex flex-col items-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                  <p className="text-green-600 dark:text-green-400 font-medium">{qrStatus.message}</p>
                  <p className="text-sm text-gray-500 mt-2">Este modal se cerrará automáticamente...</p>
                </div>
              );

            case 'timeout':
                return (
                    <div className="flex flex-col items-center py-8">
                        {/* QR Container con overlay */}
                        <div className="relative mb-6">
                            <div className="bg-white p-4 rounded-lg shadow-lg">
                                <div className="w-48 h-48 bg-gray-100 flex items-center justify-center relative">
                                    {/* Mostrar el último QR si existe, sino mostrar placeholder */}
                                    {qrCode ? (
                                        <img
                                            src={qrCode}
                                            alt="QR Code"
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <QrCode className="w-16 h-16 text-gray-300" />
                                    )}
                                    
                                    {/* Overlay semitransparente */}
                                    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded">
                                        <button
                                            onClick={handleRetryConnection}
                                            disabled={status === 'creating'}
                                            className="flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 transition-colors rounded-lg border-2 border-dashed border-blue-300 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {status === 'creating' ? (
                                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                                            ) : (
                                                <RefreshCw className="w-8 h-8 text-blue-500 mb-2" />
                                            )}
                                            <span className="text-blue-600 font-medium text-xs text-center">
                                                {status === 'creating' ? 'Generando...' : 'Refresh QR code'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
      
            case 'error':
                return (
                    <div className="flex flex-col items-center py-8">
                        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                        <p className="text-red-600 dark:text-red-400 text-center mb-4">{qrStatus.message}</p>
                        {qrStatus.showRetry && (
                            <button
                                onClick={handleRetryConnection}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Reintentar
                            </button>
                        )}
                    </div>
                );                
      
            default:
              return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Conectar {connectionName}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Vincula tu cuenta de WhatsApp
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
    
            {/* Content */}
            <div className="p-6">
                {!isConnected ? (
                <div className="flex flex-col items-center py-8">
                    <AlertCircle className="w-12 h-12 text-orange-500 mb-4" />
                    <p className="text-orange-600 dark:text-orange-400 text-center">
                        No hay conexión WebSocket. Verifica tu conexión.
                    </p>
                </div>
                ) : (
                getStatusContent()
                )}
            </div>
    
            {/* Footer - Siempre visible */}
            <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-600">
                <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                Cerrar
                </button>
            </div>
            </div>
      </div>
    );
}