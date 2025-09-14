import {
    connectionsService,
    type IConnectionsService
} from '@/lib/api/services/connections';
import { useCallback, useEffect, useState } from 'react';

import type {
    Connection,
    ConnectionFilters,
    CreateConnectionRequest,
    UpdateConnectionRequest
} from '@/types/connections';

interface UseConnectionsState {
    connections: Connection[];
    loading: boolean;
    error: string | null;
}

interface UseConnectionsActions {
    fetchConnections: (filters?: ConnectionFilters) => Promise<void>;
    createConnection: (data: CreateConnectionRequest) => Promise<void>;
    updateConnection: (data: UpdateConnectionRequest) => Promise<void>;
    updateConnectionStatus: (id: string, status: string) => Promise<void>;
    refreshConnections: () => Promise<void>;
    clearError: () => void;
}

export interface UseConnectionsReturn extends UseConnectionsState, UseConnectionsActions {}

export const useConnections = (
    service: IConnectionsService = connectionsService,
    autoFetch: boolean = true
): UseConnectionsReturn => {
    
    const [state, setState] = useState<UseConnectionsState>({
        connections: [],
        loading: false,
        error: null,
    });

    const setLoading = useCallback((loading: boolean) => {
        setState(prev => ({ ...prev, loading }));
    }, []);

    const setError = useCallback((error: string | null) => {
        setState(prev => ({ ...prev, error, loading: false }));
    }, []);

    const setConnections = useCallback((connections: Connection[]) => {
        setState(prev => ({ ...prev, connections, loading: false, error: null }));
    }, []);

    const fetchConnections = useCallback(async (filters?: ConnectionFilters) => {
        setLoading(true);
        setError(null);
        
        try {
          const connections = await service.getConnections(filters);
          setConnections(connections);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al cargar conexiones';
          setError(errorMessage);
        }
    }, [service, setLoading, setError, setConnections]);

    const createConnection = useCallback(async (data: CreateConnectionRequest) => {
        setLoading(true);
        setError(null);
        
        try {
          await service.createConnection(data);
          // Refrescar la lista después de crear
          await fetchConnections();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al crear conexión';
          setError(errorMessage);
          throw error; // Re-throw para que el componente pueda manejar el error
        }
    }, [service, setLoading, setError, fetchConnections]);

    const updateConnection = useCallback(async (data: UpdateConnectionRequest) => {
        setLoading(true);
        setError(null);
        
        try {
          const updatedConnection = await service.updateConnection(data);
          
          // Actualizar la conexión en el estado local
          setState(prev => ({
            ...prev,
            connections: prev.connections.map(conn => 
              conn.id === updatedConnection.id ? updatedConnection : conn
            ),
            loading: false,
            error: null
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al actualizar conexión';
          setError(errorMessage);
          throw error;
        }
    }, [service, setError]);

    const updateConnectionStatus = useCallback(async (id: string, status: string) => {
        setError(null);
        
        try {
          await service.updateConnectionStatus(id, status);
          
          // Actualizar solo el status en el estado local
          setState(prev => ({
            ...prev,
            connections: prev.connections.map(conn => 
              conn.id === id ? { ...conn, status: status as Connection['status'] } : conn
            ),
            error: null
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error al actualizar estado';
          setError(errorMessage);
          throw error;
        }
    }, [service, setError]);

    const refreshConnections = useCallback(() => {
        return fetchConnections();
    }, [fetchConnections]);

    const clearError = useCallback(() => {
        setError(null);
    }, [setError]);

    // Auto-fetch al montar el componente
    useEffect(() => {
        if (autoFetch) {
            fetchConnections();
        }
    }, [autoFetch, fetchConnections]);    

    return {
        ...state,
        fetchConnections,
        createConnection,
        updateConnection,
        updateConnectionStatus,
        refreshConnections,
        clearError,
    };
};

export const useConnection = (id: number, service: IConnectionsService = connectionsService) => {
    const [connection, setConnection] = useState<Connection | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    const fetchConnection = useCallback(async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const conn = await service.getConnectionById(id);
        setConnection(conn);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al cargar conexión';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }, [id, service]);
  
    useEffect(() => {
      fetchConnection();
    }, [fetchConnection]);
  
    return {
      connection,
      loading,
      error,
      refetch: fetchConnection,
    };
};