import { apiClient } from '@/lib/api/client';
import { Conversation, ConversationFilters } from '@/types/inbox';
import { useCallback, useEffect, useState } from 'react';

interface UseConversationsOptions {
  tenantId: string | number;
  filters?: ConversationFilters;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useConversations = ({
  tenantId,
  filters = {},
  autoRefresh = false,
  refreshInterval = 30000
}: UseConversationsOptions) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!tenantId) {
      setError('tenantId is required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Construir query params igual que InboxService.getConversations()
      const params: Record<string, string> = {
        tenantId: tenantId.toString(),
        page: '1',
        limit: '50'
      };

      // Aplicar filtros
      if (filters.status && filters.status !== 'all') {
        params.status = filters.status;
      }
      if (filters.assignedTo && filters.assignedTo !== 'all') {
        params.assignedTo = filters.assignedTo;
      }
      if (filters.priority && filters.priority !== 'all') {
        params.priority = filters.priority;
      }
      if (filters.channel && filters.channel !== 'all') {
        params.channel = filters.channel;
      }
      if (filters.department && filters.department !== 'all') {
        params.department = filters.department;
      }
      if (filters.hasUnread) {
        params.hasUnread = 'true';
      }

      const response = await apiClient.get('/inbox/conversations', params, {
        'X-Tenant-Id': tenantId.toString()
      });

      // El backend devuelve { conversations, total, page, ... }
      setConversations(response.data.conversations || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, filters]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!autoRefresh || !refreshInterval) return;

    const intervalId = setInterval(fetchConversations, refreshInterval);
    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, fetchConversations]);

  return {
    conversations,
    isLoading,
    error,
    refetch: fetchConversations
  };
};