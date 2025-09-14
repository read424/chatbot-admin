import { useCallback, useEffect, useRef, useState } from "react";

export interface WebSocketMessage {
    type: string;
    data: any;
    timestamp?: number;
}

export interface UseWebSocketOptions {
    reconnectAttempts?: number;
    reconnectInterval?: number;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
    onMessage?: (message: WebSocketMessage) => void;
    protocols?: string[];
    shouldReconnect?: (closeEvent: CloseEvent) => boolean;
}

export interface UseWebSocketReturn {
    sendMessage: (message: WebSocketMessage) => void;
    sendRaw: (data: string) => void;
    lastMessage: WebSocketMessage | null;
    readyState: number;
    isConnected: boolean;
    isConnecting: boolean;
    reconnectCount: number;
    disconnect: () => void;
    connect: () => void;
}

export const useWebSocket = (
    url: string | null,
    options: UseWebSocketOptions = {}
): UseWebSocketReturn => {
    const {
        reconnectAttempts = 5,
        reconnectInterval = 3000,
        onOpen,
        onClose,
        onError,
        onMessage,
        protocols,
        shouldReconnect = (closeEvent) => closeEvent.code !== 1000,
    } = options;
    const [isClient, setIsClient] = useState(false);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
    const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
    const [reconnectCount, setReconnectCount] = useState(0);

    const webSocketRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const urlRef = useRef(url);
    
    useEffect(()=>{
        urlRef.current = url;
    }, [url]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const isConnected = readyState === WebSocket.OPEN;
    const isConnecting = readyState === WebSocket.CONNECTING;

    const clearReconnectTimeout = useCallback(() => {
        if(reconnectTimeoutRef.current){
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
    }, []);

    const connect = useCallback(()=>{
        if(!isClient || !urlRef.current || webSocketRef.current?.readyState === WebSocket.OPEN){
            return;
        }

        try {
            const ws = new WebSocket(urlRef.current, protocols);
            webSocketRef.current = ws;

            setReadyState(WebSocket.CONNECTING);

            ws.onopen = () => {
                setReadyState(WebSocket.OPEN);
                setReconnectCount(reconnectAttemptsRef.current);
                reconnectAttemptsRef.current = 0;// Reset counter on successful connection
                onOpen?.();
            };

            ws.onclose = (event) => {
                setReadyState(WebSocket.CLOSED);
                onClose?.();

                if(
                    shouldReconnect(event) && 
                    reconnectAttemptsRef.current < reconnectAttempts &&
                    urlRef.current //Solo reconectar si aún hay URL
                ){
                    reconnectAttemptsRef.current++;
                    setReconnectCount(reconnectAttemptsRef.current);

                    reconnectTimeoutRef.current = setTimeout(()=>{
                        connect();
                    }, reconnectInterval);
                }
            };

            ws.onerror = (error) => {
                setReadyState(WebSocket.CLOSED);
                onError?.(error);
              };

            ws.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    message.timestamp = Date.now();
                    setLastMessage(message);
                    onMessage?.(message);
                } catch(error){
                    // Si no es JSON válido, crear un mensaje con el string raw
                    const message: WebSocketMessage = {
                        type: 'raw',
                        data: event.data,
                        timestamp: Date.now()
                    };
                    setLastMessage(message);
                    onMessage?.(message);
                }
            };

        }catch(error){
            console.error('WebSocket connection error:', error);
            setReadyState(WebSocket.CLOSED);
        }
    }, [isClient, protocols, onOpen, onClose, onError, onMessage, shouldReconnect, reconnectAttempts, reconnectInterval]);

    const disconnect = useCallback(()=>{
        clearReconnectTimeout();
        reconnectAttemptsRef.current = reconnectAttempts;

        if (webSocketRef.current){
            webSocketRef.current.close(1000, 'Manual disconnection');
            webSocketRef.current = null;
        }

        setReadyState(WebSocket.CLOSED);
    }, [clearReconnectTimeout, reconnectAttempts]);

    const sendMessage = useCallback((message: WebSocketMessage)=>{
        if(webSocketRef.current?.readyState === WebSocket.OPEN){
            try {
                const messageToSend = {
                    ...message,
                    timestamp: Date.now()
                };
                webSocketRef.current.send(JSON.stringify(messageToSend));
            }catch(error){
                console.error('Error sending WebSocket message:', error);
            }
        }else{
            console.warn('WebSocket is not connected. Message not sent:', message);
        }
    }, []);

    const sendRaw = useCallback((data: string)=>{
        if(webSocketRef.current?.readyState === WebSocket.OPEN){
            try {
                webSocketRef.current.send(data);
            }catch(error){
                console.error('Error sending raw WebSocket data:', error);
            }
        }else{
            console.warn('WebSocket is not connected. Raw data not sent:', data);
        }
    }, []);

    // Conectar automáticamente cuando hay URL
    useEffect(()=>{
        if (url) {
            connect();
        }else{
            disconnect();
        }

        // Cleanup al desmontar
        return () => {
            disconnect();
        };
    }, [url, connect, disconnect]);

    // Actualizar readyState
    useEffect(()=>{
        if(webSocketRef.current){
            const updateReadyState = () => {
                setReadyState(webSocketRef.current?.readyState ?? WebSocket.CLOSED);
            };

            const interval = setInterval(updateReadyState, 100);

            return () => clearInterval(interval);
        }
    }, [webSocketRef.current]);

    return {
        sendMessage,
        sendRaw,
        lastMessage,
        readyState,
        isConnected,
        isConnecting,
        reconnectCount,
        disconnect,
        connect
    };
};