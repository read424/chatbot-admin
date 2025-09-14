'use client';

import { useWebSocket, UseWebSocketReturn } from '@/hooks/useWebSocket';
import React, { createContext, ReactNode, useContext } from 'react';

interface WebSocketContextType extends UseWebSocketReturn {

}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
    children: ReactNode;
    url?: string;
    enabled?: boolean;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
    children,
    url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3330',
    enabled = true
}) => {
    const wsUrl = enabled && url ? url : null;

    const WebSocketData = useWebSocket(wsUrl, {
        reconnectAttempts: 5,
        reconnectInterval: 3000,
        onOpen: () => {
            console.log('✅ WebSocket conectado exitosamente');
        },
        onClose: () => {
            console.log('❌ WebSocket desconectado:');
        },
        onError: (error) => {
            console.error('🔴 Error detallado en WebSocket:', {
                error,
                url: wsUrl
            });
        },
        onMessage: (message) => {
            console.log('📨 Mensaje recibido:', message);
        },
        shouldReconnect: (closeEvent) => {
            return closeEvent.code !== 1000;
        }
    });

    return (
        <WebSocketContext.Provider value={WebSocketData}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocketContext = (): WebSocketContextType => {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error('useWebSocketContext debe estar dentro de un WebSocketProvider');
    }
    return context;
};