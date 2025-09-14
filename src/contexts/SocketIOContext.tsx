'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface SocketIOContextType {
    socket: Socket | null;
    isConnected: boolean;
    currentTenantId: string | null;
    connectToTenant: (tenantId: string) => void;
    disconnectFromTenant: () => void;
    emit: (event: string, data: any) => void;
    on: (event: string, callback: (data: any) => void) => void;
    off: (event: string, callback?: (data: any) => void) => void;
}


const SocketIOContext = createContext<SocketIOContextType | undefined>({
    socket: null,
    isConnected: false,
    currentTenantId: null,
    connectToTenant: () => {},
    disconnectFromTenant: () => {},
    emit: () => {},
    on: () => {},
    off: () => {}
});

export const SocketIOProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);

    useEffect(() => {
        const socketInstance = io(process.env.NEXT_PUBLIC_WS_URL || "http://127.0.0.1:3330", {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            timeout: 10000,
            forceNew: true
        });

        socketInstance.on("connect", () => {
            console.log("✅ SocketIO conectado exitosamente");
            setIsConnected(true);
        });

        socketInstance.on("disconnect", () => {
            console.log("❌ SocketIO desconectado");
            setIsConnected(false);
            setCurrentTenantId(null);
        });

        // Listener para errores de tenant
        socketInstance.on("tenant_error", (data) => {
            console.error("❌ Tenant error:", data);
            setCurrentTenantId(null);
        });
        
        // Listener para confirmación de unión a tenant
        socketInstance.on("tenant_joined", (data) => {
            console.log("🎯 Joined tenant room successfully:", data);
            setCurrentTenantId(data.tenantId);
        });

        setSocket(socketInstance);

        return () => {
            console.log("Cleaning up socket connection");
            socketInstance.disconnect();
        };    
    }, []);

    const connectToTenant = (tenantId: string) => {
        if (socket && isConnected) {
            // Unirse al namespace del tenant
            socket.emit('join', tenantId);
            
            //setCurrentTenantId(tenantId);

            console.log(`Conectado a la sala del tenant: ${tenantId}`);
        }else{
            console.warn('Cannot join tenant - Socket not connected', { 
                hasSocket: !!socket, 
                isConnected 
            });
        }
    };

    const disconnectFromTenant = () => {
        if (socket && currentTenantId) {
            // Salir del namespace del tenant
            console.log(`Leaving tenant: ${currentTenantId}`);
            socket.emit('leave');
            setCurrentTenantId(null);
        }
    };

    const emit = (event: string, data: any) => {
        if (socket && isConnected) {
            console.log(`Emitting event: ${event}`, data);

            // Si tenemos un tenant activo, incluirlo en los datos
            const eventData = currentTenantId ? { ...data, tenantId: currentTenantId } : data;
            socket.emit(event, eventData);
        }else{
            console.warn('Cannot emit - Socket not connected', { event, data });
        }
    };

    const on = (event: string, callback: (data: any) => void) => {
        if (socket) {
            console.log(`Registering listener for event: ${event}`);
            socket.on(event, callback);
        }
    };

    const off = (event: string, callback?: (data: any) => void) => {
        if (socket) {
            console.log(`Removing listener for event: ${event}`);
            if (callback) {
                socket.off(event, callback);
            } else {
                socket.off(event);
            }
        }
    };

    return (
        <SocketIOContext.Provider value={{ 
            socket, 
            isConnected, 
            currentTenantId,
            connectToTenant,
            disconnectFromTenant,
            emit, 
            on, 
            off 
        }}>
            {children}
        </SocketIOContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketIOContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketIOProvider');
    }
    return context;
};