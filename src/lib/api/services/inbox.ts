import {
    Conversation,
    ConversationFilters,
    ConversationListResponse,
    ConversationSort,
    CreateConversationNoteRequest,
    Message,
    MessageListResponse,
    PaginationParams,
    SendMessageRequest,
    SendMessageWithAttachmentsRequest,
    UpdateConversationRequest,
    UpdateMessageRequest
} from '@/types/inbox';
import { apiClient } from '../client';

export interface ConversationQueryParams extends PaginationParams {
  filters?: ConversationFilters;
  sort?: ConversationSort;
}

export interface MessageQueryParams extends PaginationParams {
  before?: string; // For cursor-based pagination
  after?: string;
}

export class InboxService {
  private readonly basePath = '/api/inbox';

  // ===============================
  // CONVERSATIONS
  // ===============================

  /**
   * Get conversations with filters and pagination
   */
  async getConversations(params: ConversationQueryParams): Promise<ConversationListResponse> {
    const queryParams = new URLSearchParams();
    
    // Pagination
    queryParams.append('page', params.page.toString());
    queryParams.append('limit', params.limit.toString());

    // Filters
    if (params.filters) {
      const { filters } = params;
      
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      if (filters.channel && filters.channel !== 'all') {
        queryParams.append('channel', filters.channel);
      }
      if (filters.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      if (filters.assignedTo && filters.assignedTo !== 'all') {
        queryParams.append('assignedTo', filters.assignedTo);
      }
      if (filters.department && filters.department !== 'all') {
        queryParams.append('department', filters.department);
      }
      if (filters.priority && filters.priority !== 'all') {
        queryParams.append('priority', filters.priority);
      }
      if (filters.hasUnread) {
        queryParams.append('hasUnread', 'true');
      }
      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => queryParams.append('tags', tag));
      }
      if (filters.dateRange) {
        queryParams.append('dateFrom', filters.dateRange.from.toISOString());
        queryParams.append('dateTo', filters.dateRange.to.toISOString());
      }
    }

    // Sorting
    if (params.sort) {
      queryParams.append('sortBy', params.sort.field);
      queryParams.append('sortOrder', params.sort.direction);
    }

    const response = await apiClient.get<ConversationListResponse>(
      `${this.basePath}/conversations?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Get a single conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    const response = await apiClient.get<{ data: Conversation }>(
      `${this.basePath}/conversations/${conversationId}`
    );
    return response.data.data;
  }

  /**
   * Create a new conversation
   */
  async createConversation(contactId: string, channel: string, department?: string): Promise<Conversation> {
    const response = await apiClient.post<{ data: Conversation }>(
      `${this.basePath}/conversations`,
      {
        contactId,
        channel,
        department
      }
    );
    return response.data.data;
  }

  /**
   * Update conversation details
   */
  async updateConversation(conversationId: string, updates: UpdateConversationRequest): Promise<Conversation> {
    const response = await apiClient.patch<{ data: Conversation }>(
      `${this.basePath}/conversations/${conversationId}`,
      updates
    );
    return response.data.data;
  }

  /**
   * Assign conversation to an agent
   */
  async assignConversation(conversationId: string, agentId: string): Promise<Conversation> {
    const response = await apiClient.patch<{ data: Conversation }>(
      `${this.basePath}/conversations/${conversationId}/assign`,
      { agentId }
    );
    return response.data.data;
  }

  /**
   * Close a conversation
   */
  async closeConversation(conversationId: string): Promise<Conversation> {
    const response = await apiClient.patch<{ data: Conversation }>(
      `${this.basePath}/conversations/${conversationId}/close`
    );
    return response.data.data;
  }

  /**
   * Archive a conversation
   */
  async archiveConversation(conversationId: string): Promise<Conversation> {
    const response = await apiClient.patch<{ data: Conversation }>(
      `${this.basePath}/conversations/${conversationId}/archive`
    );
    return response.data.data;
  }

  /**
   * Mark conversation as read
   */
  async markAsRead(conversationId: string): Promise<void> {
    await apiClient.patch(
      `${this.basePath}/conversations/${conversationId}/mark-read`
    );
  }

  // ===============================
  // MESSAGES
  // ===============================

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, params: MessageQueryParams): Promise<MessageListResponse> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', params.page.toString());
    queryParams.append('limit', params.limit.toString());
    
    if (params.before) {
      queryParams.append('before', params.before);
    }
    if (params.after) {
      queryParams.append('after', params.after);
    }

    const response = await apiClient.get<MessageListResponse>(
      `${this.basePath}/conversations/${conversationId}/messages?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Send a text message
   */
  async sendMessage(request: SendMessageRequest): Promise<Message> {
    const response = await apiClient.post<{ data: Message }>(
      `${this.basePath}/conversations/${request.conversationId}/messages`,
      {
        content: request.content,
        type: request.type || 'text',
        replyTo: request.replyTo,
        metadata: request.metadata
      }
    );
    return response.data.data;
  }

  /**
   * Send a message with attachments
   */
  async sendMessageWithAttachments(request: SendMessageWithAttachmentsRequest): Promise<Message> {
    const formData = new FormData();
    
    formData.append('content', request.content);
    formData.append('type', request.type || 'text');
    
    if (request.replyTo) {
      formData.append('replyTo', request.replyTo);
    }
    
    if (request.metadata) {
      formData.append('metadata', JSON.stringify(request.metadata));
    }

    // Add attachments
    if (request.attachments) {
      request.attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
    }

    const response = await apiClient.post<{ data: Message }>(
      `${this.basePath}/conversations/${request.conversationId}/messages`,
      formData,
      {
        'Content-Type': 'multipart/form-data',
      }
    );
    return response.data.data;
  }

  /**
   * Update a message
   */
  async updateMessage(request: UpdateMessageRequest): Promise<Message> {
    const response = await apiClient.patch<{ data: Message }>(
      `${this.basePath}/messages/${request.id}`,
      {
        content: request.content
      }
    );
    return response.data.data;
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/messages/${messageId}`);
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId: string): Promise<void> {
    await apiClient.patch(`${this.basePath}/messages/${messageId}/read`);
  }

  // ===============================
  // CONVERSATION NOTES
  // ===============================

  /**
   * Add a note to a conversation
   */
  async addConversationNote(request: CreateConversationNoteRequest): Promise<void> {
    await apiClient.post(
      `${this.basePath}/conversations/${request.conversationId}/notes`,
      {
        content: request.content,
        isInternal: request.isInternal
      }
    );
  }

  /**
   * Get conversation notes
   */
  async getConversationNotes(conversationId: string): Promise<any[]> {
    const response = await apiClient.get<{ data: any[] }>(
      `${this.basePath}/conversations/${conversationId}/notes`
    );
    return response.data.data;
  }

  // ===============================
  // TAGS
  // ===============================

  /**
   * Add tag to conversation
   */
  async addTag(conversationId: string, tag: string): Promise<void> {
    await apiClient.post(
      `${this.basePath}/conversations/${conversationId}/tags`,
      { tag }
    );
  }

  /**
   * Remove tag from conversation
   */
  async removeTag(conversationId: string, tag: string): Promise<void> {
    await apiClient.delete(
      `${this.basePath}/conversations/${conversationId}/tags/${encodeURIComponent(tag)}`
    );
  }

  /**
   * Get available tags
   */
  async getAvailableTags(): Promise<string[]> {
    const response = await apiClient.get<{ data: string[] }>(`${this.basePath}/tags`);
    return response.data.data;
  }

  // ===============================
  // STATISTICS
  // ===============================

  /**
   * Get inbox statistics
   */
  async getInboxStats(): Promise<{
    totalConversations: number;
    activeConversations: number;
    unreadConversations: number;
    avgResponseTime: number;
    conversationsByChannel: Record<string, number>;
  }> {
    const response = await apiClient.get<{ data: any }>(`${this.basePath}/stats`);
    return response.data.data;
  }

  /**
   * Get agent statistics
   */
  async getAgentStats(agentId: string, dateRange?: { from: Date; to: Date }): Promise<{
    assignedConversations: number;
    resolvedConversations: number;
    avgResponseTime: number;
    messagesCount: number;
  }> {
    const queryParams = new URLSearchParams();
    
    if (dateRange) {
      queryParams.append('from', dateRange.from.toISOString());
      queryParams.append('to', dateRange.to.toISOString());
    }

    const response = await apiClient.get<{ data: any }>(
      `${this.basePath}/agents/${agentId}/stats?${queryParams.toString()}`
    );
    return response.data.data;
  }

  // ===============================
  // SEARCH
  // ===============================

  /**
   * Search messages across conversations
   */
  async searchMessages(query: string, filters?: {
    conversationId?: string;
    dateRange?: { from: Date; to: Date };
    messageType?: string;
  }): Promise<{
    messages: Message[];
    total: number;
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    
    if (filters) {
      if (filters.conversationId) {
        queryParams.append('conversationId', filters.conversationId);
      }
      if (filters.dateRange) {
        queryParams.append('from', filters.dateRange.from.toISOString());
        queryParams.append('to', filters.dateRange.to.toISOString());
      }
      if (filters.messageType) {
        queryParams.append('type', filters.messageType);
      }
    }

    const response = await apiClient.get<{ data: any }>(
      `${this.basePath}/search/messages?${queryParams.toString()}`
    );
    return response.data.data;
  }

  // ===============================
  // BULK OPERATIONS
  // ===============================

  /**
   * Bulk update conversations
   */
  async bulkUpdateConversations(conversationIds: string[], updates: {
    status?: string;
    assignedAgentId?: string;
    department?: string;
    priority?: string;
  }): Promise<void> {
    await apiClient.patch(`${this.basePath}/conversations/bulk`, {
      conversationIds,
      updates
    });
  }

  /**
   * Bulk mark as read
   */
  async bulkMarkAsRead(conversationIds: string[]): Promise<void> {
    await apiClient.patch(`${this.basePath}/conversations/bulk/mark-read`, {
      conversationIds
    });
  }

  /**
   * Bulk archive conversations
   */
  async bulkArchive(conversationIds: string[]): Promise<void> {
    await apiClient.patch(`${this.basePath}/conversations/bulk/archive`, {
      conversationIds
    });
  }
}

// Export singleton instance
export const inboxService = new InboxService();