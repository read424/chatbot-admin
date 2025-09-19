import { useSocket } from '@/contexts/SocketIOContext';
import { connectionsService } from '@/lib/api/services/connections';
import { AuthenticatedEventData, LoadingScreenEventData, QRCodeEventData, QRTimeoutEventData, WhatsAppDisconnectedEventData, WhatsAppReadyEventData } from '@/types/whatsapp-events';
import { WHATSAPP_EVENTS } from '@/utils/constants';
import { useCallback, useEffect, useState } from 'react';

interface UseWhatsAppConnectionProps {
  connectionId: string;
  connectionName: string;
  tenantId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useWhatsAppConnection = ({
    connectionId,
    connectionName,
    tenantId,
    onSuccess,
    onError
}: UseWhatsAppConnectionProps) => {
    const { emit, on, off, isConnected, connectToTenant, disconnectFromTenant, currentTenantId } = useSocket();
    
    const [clientId, setClientId] = useState<string>('');
    const [qrCode, setQrCode] = useState<string>('');
    const [status, setStatus] = useState<'idle' | 'creating' | 'waiting_qr' | 'qr_ready' | 'connecting' | 'connected' | 'error' | 'timeout'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const [qrAttempts, setQrAttempts] = useState<number>(0);
    const [maxQrAttempts, setMaxQrAttempts] = useState<number>(4);
    const [isQrTimeout, setIsQrTimeout] = useState<boolean>(false);

    // Crear nueva conexión
    const createConnection = useCallback(async () => {
        if (!isConnected) {
            setErrorMessage('No hay conexión Socket.IO');
            setStatus('error');
            return;
        }

        try {
            console.log('Enviando petición...');
            setStatus('creating');
            setErrorMessage('');
            setIsQrTimeout(false);
            setQrAttempts(0);
            
            const response = await connectionsService.createWhatsAppConnection({
                connectionId,
                connectionName,
                tenantId
            });

            if (response.success && response.clientId) {
                setClientId(response.clientId);
                setStatus('waiting_qr');
                console.log('Conexión creada exitosamente:', response);

                if (response.qr) {
                    setQrCode(response.qr);
                    setStatus('qr_ready');
                    setQrAttempts(response.qrAttempts || 0);
                    setMaxQrAttempts(response.maxQrAttempts || 4);
                }                
            } else {
                throw new Error(response.error || 'Error al crear la conexión');
            }
        } catch (error: any) {
            console.error('Error creating connection:', error);
            const errorMsg = error.message || 'Error al crear la conexión';
            setErrorMessage(errorMsg);
            setStatus('error');
            onError?.(errorMsg);
        }
    }, [isConnected, connectionId, connectionName, tenantId, onError]);

    const restartConnection = useCallback(async () => {
        if(!isConnected){
            setErrorMessage('No hay conexión Socket.IO');
            setStatus('error');
            return;
        }

        try {
            console.log('Reiniciando conexión...');
            setStatus('creating');
            setErrorMessage('');
            setIsQrTimeout(false);
            setQrAttempts(0);
            setQrCode('');

            const response = await connectionsService.restartWhatsAppConnection({
                clientId: clientId,
                tenantId: tenantId
            });

            if (response.success) {
                setStatus('waiting_qr');
                console.log('Conexion reiniciada exitosamente:', response);
            }else{
                throw new Error(response.error || 'Error al reiniciar la conexión');
            }
        }catch (error: any) {
            console.error('Error restarting connection:', error);
            const errorMsg = error.message || 'Error al reiniciar la conexión';
            setErrorMessage(errorMsg);
            onError?.(errorMsg);
        }
    }, [isConnected, clientId, tenantId, onError]);

    // Conectarse a la sala del tenant cuando se inicializa
    useEffect(() => {
        if (isConnected && tenantId) {
            connectToTenant(tenantId);
        }
    }, [isConnected, tenantId, connectToTenant]);

    // Escuchar eventos WebSocket
    useEffect(() => {
        if (!isConnected) return;
    
        const handleQRCode = (data: QRCodeEventData) => {
            console.log('QR Code received:', data);
        
            // Verificar que el evento sea para este cliente
            if (data.clientId === clientId) {
                setQrCode(data.qr);
                setStatus('qr_ready');
            }
        };

        const handleQRTimeout = (data: QRTimeoutEventData) => {
            console.log('QR Timeout received:', data);

            if (data.clientId === clientId) {
                setStatus('timeout');
                setIsQrTimeout(true);
                //setQrCode('');
                setErrorMessage(data.message || 'Se alcanzó el límite máximo de códigos QR. Haz clic en el botón para reintentar.');
                onError?.(data.message || 'Qr timeout');
            }
        };

        const handleLoadingScreen = (data: LoadingScreenEventData) => {
            if(data.clientId === clientId) {
                setStatus('connecting');
            }
        };

        const handleAuthenticated = (data: AuthenticatedEventData) => {
            if(data.clientId === clientId) {
                setStatus('connected');
            }
        };

        const handleWhatsAppReady = (data: WhatsAppReadyEventData) => {
            console.log('WhatsApp ready event received:', data);
            
            // Verificar que el evento sea para este cliente
            if (data.clientId === clientId) {
                setStatus('connected');
                onSuccess?.();
            }
        };
    
        const handleWhatsAppDisconnected = (data: WhatsAppDisconnectedEventData) => {
            console.log('WhatsApp disconnected event received:', data);
        
            // Verificar que el evento sea para este cliente
            if (data.clientId === clientId) {
                setErrorMessage('WhatsApp se ha desconectado');
                setStatus('error');
                onError?.('WhatsApp se ha desconectado');
            }
        };
    
        // Registrar listeners
        on(WHATSAPP_EVENTS.QR_CODE, handleQRCode);
        on(WHATSAPP_EVENTS.QR_TIMEOUT, handleQRTimeout);
        on(WHATSAPP_EVENTS.WHATSAPP_READY, handleWhatsAppReady);
        on(WHATSAPP_EVENTS.WHATSAPP_DISCONNECTED, handleWhatsAppDisconnected);
        on(WHATSAPP_EVENTS.LOADING_SCREEN, handleLoadingScreen);
        on(WHATSAPP_EVENTS.AUTHENTICATED, handleAuthenticated);
        console.log('Event listeners registered for client:', clientId);

        // Cleanup
        return () => {
            off(WHATSAPP_EVENTS.QR_CODE, handleQRCode);
            off(WHATSAPP_EVENTS.QR_TIMEOUT, handleQRTimeout);
            off(WHATSAPP_EVENTS.WHATSAPP_READY, handleWhatsAppReady);
            off(WHATSAPP_EVENTS.WHATSAPP_DISCONNECTED, handleWhatsAppDisconnected);
            off(WHATSAPP_EVENTS.LOADING_SCREEN, handleLoadingScreen);
            off(WHATSAPP_EVENTS.AUTHENTICATED, handleAuthenticated);
        };
    }, [isConnected, clientId, on, off, onSuccess, onError]);

    return {
        clientId,
        qrCode,
        status,
        errorMessage,
        isConnected,
        qrAttempts,
        maxQrAttempts,
        isQrTimeout,
        createConnection,
        restartConnection
    };
};
