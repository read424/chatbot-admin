/**
 * useConnectionsV2 Hook
 * Hook personalizado para gestionar conexiones de canales v2
 *
 * @example
 * const {
 *   connections,
 *   isLoading,
 *   fetchConnections,
 *   createConnection,
 *   activateConnection
 * } = useConnectionsV2();
 */

import { useState, useCallback, useEffect } from 'react';
import { connectionsV2Service } from '@/lib/api/services/connectionsV2';
import type {
  ConnectionV2,
  ConnectionsQueryParams,
  CreateConnectionRequest,
  UpdateConnectionRequest,
  TestConnectionRequest,
  DeactivateConnectionRequest,
  ConnectionStatsQueryParams,
} from '@/types/connectionsV2';

interface UseConnectionsV2Options {
  autoFetch?: boolean;
  initialFilters?: ConnectionsQueryParams;
}

interface UseConnectionsV2Return {
  // Estado
  connections: ConnectionV2[];
  selectedConnection: ConnectionV2 | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  } | null;

  // Métodos de listado
  fetchConnections: (params?: ConnectionsQueryParams) => Promise<void>;
  refreshConnections: () => Promise<void>;

  // Métodos de detalle
  selectConnection: (connectionId: number) => Promise<void>;
  clearSelection: () => void;

  // Métodos CRUD
  createConnection: (data: CreateConnectionRequest) => Promise<ConnectionV2 | null>;
  updateConnection: (
    connectionId: number,
    data: UpdateConnectionRequest
  ) => Promise<ConnectionV2 | null>;
  deleteConnection: (connectionId: number, permanent?: boolean) => Promise<boolean>;

  // Métodos de control
  activateConnection: (connectionId: number) => Promise<boolean>;
  deactivateConnection: (
    connectionId: number,
    data?: DeactivateConnectionRequest
  ) => Promise<boolean>;
  testConnection: (connectionId: number, data: TestConnectionRequest) => Promise<boolean>;

  // Métodos de QR (WhatsApp Web)
  getQRCode: (connectionId: number) => Promise<string | null>;

  // Métodos de estadísticas
  getConnectionStats: (
    connectionId: number,
    params?: ConnectionStatsQueryParams
  ) => Promise<any>;
  getSummary: () => Promise<any>;

  // Utilidades
  clearError: () => void;
  findConnectionById: (connectionId: number) => ConnectionV2 | undefined;
}

export function useConnectionsV2(
  options: UseConnectionsV2Options = {}
): UseConnectionsV2Return {
  const { autoFetch = false, initialFilters } = options;

  // Estado
  const [connections, setConnections] = useState<ConnectionV2[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<ConnectionV2 | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  } | null>(null);
  const [lastFilters, setLastFilters] = useState<ConnectionsQueryParams | undefined>(
    initialFilters
  );

  // Auto-fetch al montar
  useEffect(() => {
    if (autoFetch) {
      fetchConnections(initialFilters);
    }
  }, [autoFetch]);

  /**
   * Obtener lista de conexiones con filtros
   */
  const fetchConnections = useCallback(async (params?: ConnectionsQueryParams) => {
    setIsLoading(true);
    setError(null);
    setLastFilters(params);

    try {
      const response = await connectionsV2Service.getConnections(params);

      if (response.success) {
        setConnections(response.data.connections);
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar conexiones';
      setError(errorMessage);
      console.error('Error fetching connections:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refrescar conexiones con los mismos filtros
   */
  const refreshConnections = useCallback(async () => {
    await fetchConnections(lastFilters);
  }, [fetchConnections, lastFilters]);

  /**
   * Seleccionar una conexión y cargar detalles
   */
  const selectConnection = useCallback(async (connectionId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await connectionsV2Service.getConnection(connectionId);

      if (response.success) {
        setSelectedConnection(response.data);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar detalles de la conexión';
      setError(errorMessage);
      console.error('Error fetching connection details:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Limpiar selección
   */
  const clearSelection = useCallback(() => {
    setSelectedConnection(null);
  }, []);

  /**
   * Crear nueva conexión
   */
  const createConnection = useCallback(
    async (data: CreateConnectionRequest): Promise<ConnectionV2 | null> => {
      setIsCreating(true);
      setError(null);

      try {
        const response = await connectionsV2Service.createConnection(data);

        if (response.success) {
          // Agregar la nueva conexión a la lista
          setConnections((prev) => [response.data, ...prev]);
          return response.data;
        }

        return null;
      } catch (err: any) {
        const errorMessage = err.message || 'Error al crear conexión';
        setError(errorMessage);
        console.error('Error creating connection:', err);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  /**
   * Actualizar conexión existente
   */
  const updateConnection = useCallback(
    async (
      connectionId: number,
      data: UpdateConnectionRequest
    ): Promise<ConnectionV2 | null> => {
      setIsUpdating(true);
      setError(null);

      try {
        const response = await connectionsV2Service.updateConnection(connectionId, data);

        if (response.success) {
          // Actualizar en la lista
          setConnections((prev) =>
            prev.map((conn) => (conn.id === connectionId ? response.data : conn))
          );

          // Actualizar selección si está activa
          if (selectedConnection?.id === connectionId) {
            setSelectedConnection(response.data);
          }

          return response.data;
        }

        return null;
      } catch (err: any) {
        const errorMessage = err.message || 'Error al actualizar conexión';
        setError(errorMessage);
        console.error('Error updating connection:', err);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [selectedConnection]
  );

  /**
   * Eliminar conexión
   */
  const deleteConnection = useCallback(
    async (connectionId: number, permanent: boolean = false): Promise<boolean> => {
      setIsDeleting(true);
      setError(null);

      try {
        const response = await connectionsV2Service.deleteConnection(
          connectionId,
          permanent
        );

        if (response.success) {
          // Remover de la lista
          setConnections((prev) => prev.filter((conn) => conn.id !== connectionId));

          // Limpiar selección si era la conexión eliminada
          if (selectedConnection?.id === connectionId) {
            setSelectedConnection(null);
          }

          return true;
        }

        return false;
      } catch (err: any) {
        const errorMessage = err.message || 'Error al eliminar conexión';
        setError(errorMessage);
        console.error('Error deleting connection:', err);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [selectedConnection]
  );

  /**
   * Activar una conexión
   */
  const activateConnection = useCallback(async (connectionId: number): Promise<boolean> => {
    setError(null);

    try {
      const response = await connectionsV2Service.activateConnection(connectionId);

      if (response.success) {
        // Actualizar estado en la lista
        setConnections((prev) =>
          prev.map((conn) =>
            conn.id === connectionId
              ? { ...conn, status: response.data.status, isActive: response.data.isActive }
              : conn
          )
        );

        // Actualizar selección si está activa
        if (selectedConnection?.id === connectionId) {
          await selectConnection(connectionId);
        }

        return true;
      }

      return false;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al activar conexión';
      setError(errorMessage);
      console.error('Error activating connection:', err);
      return false;
    }
  }, [selectedConnection, selectConnection]);

  /**
   * Desactivar una conexión
   */
  const deactivateConnection = useCallback(
    async (
      connectionId: number,
      data?: DeactivateConnectionRequest
    ): Promise<boolean> => {
      setError(null);

      try {
        const response = await connectionsV2Service.deactivateConnection(
          connectionId,
          data
        );

        if (response.success) {
          // Actualizar estado en la lista
          setConnections((prev) =>
            prev.map((conn) =>
              conn.id === connectionId
                ? { ...conn, status: response.data.status, isActive: response.data.isActive }
                : conn
            )
          );

          // Actualizar selección si está activa
          if (selectedConnection?.id === connectionId) {
            await selectConnection(connectionId);
          }

          return true;
        }

        return false;
      } catch (err: any) {
        const errorMessage = err.message || 'Error al desactivar conexión';
        setError(errorMessage);
        console.error('Error deactivating connection:', err);
        return false;
      }
    },
    [selectedConnection, selectConnection]
  );

  /**
   * Probar conexión
   */
  const testConnection = useCallback(
    async (connectionId: number, data: TestConnectionRequest): Promise<boolean> => {
      setError(null);

      try {
        const response = await connectionsV2Service.testConnection(connectionId, data);
        return response.success;
      } catch (err: any) {
        const errorMessage = err.message || 'Error al probar conexión';
        setError(errorMessage);
        console.error('Error testing connection:', err);
        return false;
      }
    },
    []
  );

  /**
   * Obtener código QR (WhatsApp Web)
   */
  const getQRCode = useCallback(async (connectionId: number): Promise<string | null> => {
    setError(null);

    try {
      const response = await connectionsV2Service.getQRCode(connectionId);

      if (response.success && response.data.qrCode) {
        return response.data.qrCode;
      }

      return null;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener código QR';
      setError(errorMessage);
      console.error('Error fetching QR code:', err);
      return null;
    }
  }, []);

  /**
   * Obtener estadísticas de conexión
   */
  const getConnectionStats = useCallback(
    async (connectionId: number, params?: ConnectionStatsQueryParams) => {
      setError(null);

      try {
        const response = await connectionsV2Service.getConnectionStats(
          connectionId,
          params
        );

        if (response.success) {
          return response.data;
        }

        return null;
      } catch (err: any) {
        const errorMessage = err.message || 'Error al obtener estadísticas';
        setError(errorMessage);
        console.error('Error fetching stats:', err);
        return null;
      }
    },
    []
  );

  /**
   * Obtener resumen de todas las conexiones
   */
  const getSummary = useCallback(async () => {
    setError(null);

    try {
      const response = await connectionsV2Service.getConnectionsSummary();

      if (response.success) {
        return response.data;
      }

      return null;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener resumen';
      setError(errorMessage);
      console.error('Error fetching summary:', err);
      return null;
    }
  }, []);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Buscar conexión por ID en la lista actual
   */
  const findConnectionById = useCallback(
    (connectionId: number): ConnectionV2 | undefined => {
      return connections.find((conn) => conn.id === connectionId);
    },
    [connections]
  );

  return {
    // Estado
    connections,
    selectedConnection,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    pagination,

    // Métodos de listado
    fetchConnections,
    refreshConnections,

    // Métodos de detalle
    selectConnection,
    clearSelection,

    // Métodos CRUD
    createConnection,
    updateConnection,
    deleteConnection,

    // Métodos de control
    activateConnection,
    deactivateConnection,
    testConnection,

    // Métodos de QR
    getQRCode,

    // Métodos de estadísticas
    getConnectionStats,
    getSummary,

    // Utilidades
    clearError,
    findConnectionById,
  };
}
