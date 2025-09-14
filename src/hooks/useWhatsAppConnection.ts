import { useSocket } from '@/contexts/SocketIOContext';
import { connectionsService } from '@/lib/api/services/connections';
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
    const [status, setStatus] = useState<'idle' | 'creating' | 'waiting_qr' | 'qr_ready' | 'connecting' | 'connected' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Crear nueva conexión
    const createConnection = useCallback(async () => {
        if (!isConnected) {
            setErrorMessage('No hay conexión Socket.IO');
            setStatus('error');
            return;
        }

        try {
            console.log('📡 Enviando petición...');
            setStatus('creating');
            setErrorMessage('');
            
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

    // Conectarse a la sala del tenant cuando se inicializa
    useEffect(() => {
        if (isConnected && tenantId) {
            connectToTenant(tenantId);
        }
    }, [isConnected, tenantId, connectToTenant]);

    // Escuchar eventos WebSocket
    useEffect(() => {
        if (!isConnected) return;
    
        const handleQRCode = (data: any) => {
            console.log('QR Code received:', data);
        
            // Verificar que el evento sea para este cliente
            if (data.clientId === clientId) {
                setQrCode(data.qr);
                setStatus('qr_ready');
            }
        };

        const handleLoadingScreen = (data: any) => {
            if(data.clientId === clientId) {
                setStatus('connecting');
            }
        };

        const handleAuthenticated = (data: any) => {
            if(data.clientId === clientId) {
                setStatus('connected');
            }
        };

        const handleWhatsAppReady = (data: any) => {
            console.log('WhatsApp ready event received:', data);
            
            // Verificar que el evento sea para este cliente
            if (data.clientId === clientId) {
                setStatus('connected');
                onSuccess?.();
            }
        };
    
        const handleWhatsAppDisconnected = (data: any) => {
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
        on(WHATSAPP_EVENTS.WHATSAPP_READY, handleWhatsAppReady);
        on(WHATSAPP_EVENTS.WHATSAPP_DISCONNECTED, handleWhatsAppDisconnected);
        on(WHATSAPP_EVENTS.LOADING_SCREEN, handleLoadingScreen);
        on(WHATSAPP_EVENTS.AUTHENTICATED, handleAuthenticated);
        console.log('Event listeners registered for client:', clientId);

        // Cleanup
        return () => {
            off(WHATSAPP_EVENTS.QR_CODE, handleQRCode);
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
        createConnection
    };
};
