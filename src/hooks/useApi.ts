// hooks/useApi.ts
import type { ApiError } from '@/lib/api';
import { useCallback, useEffect, useState } from 'react';

// Hook genérico para manejar estado de APIs
export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Hook para mutaciones (POST, PUT, DELETE)
export interface UseMutationState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  mutate: (variables?: any) => Promise<T>;
  reset: () => void;
}

export function useMutation<T, V = any>(
  mutationFn: (variables: V) => Promise<T>
): UseMutationState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const mutate = useCallback(async (variables: V): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutationFn(variables);
      setData(result);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, mutate, reset };
}

// Hook específico para paginación
export interface UsePaginationState<T> extends UseApiState<T> {
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  previousPage: () => void;
}

export function usePagination<T>(
  apiCall: (page: number, limit: number, ...args: any[]) => Promise<T>,
  initialPage = 1,
  initialLimit = 10,
  dependencies: any[] = []
): UsePaginationState<T> {
  const [page, setPageState] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);

  const { data, loading, error, refetch } = useApi(
    () => apiCall(page, limit, ...dependencies),
    [page, limit, ...dependencies]
  );

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPageState(1); // Reset to first page when changing limit
  }, []);

  const nextPage = useCallback(() => {
    setPageState(prev => prev + 1);
  }, []);

  const previousPage = useCallback(() => {
    setPageState(prev => Math.max(1, prev - 1));
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    page,
    limit,
    setPage,
    setLimit,
    nextPage,
    previousPage,
  };
}