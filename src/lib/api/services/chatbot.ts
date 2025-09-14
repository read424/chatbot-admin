import { apiClient } from '../client';
import {
  ChatbotConfig,
  CreateChatbotConfigRequest,
  UpdateChatbotConfigRequest,
  CreateChatbotRuleRequest,
  UpdateChatbotRuleRequest,
  ChatbotTestRequest,
  ChatbotTestResponse,
  ChatbotAnalytics,
  ChatbotConfigResponse,
  ChatbotConfigsListResponse,
  ChatbotRuleResponse,
  ChatbotRulesListResponse,
  PaginationParams
} from '../types';

export class ChatbotService {
  private static readonly BASE_PATH = '/api/chatbot';

  // Chatbot Configuration CRUD operations
  static async getChatbotConfigs(params?: PaginationParams): Promise<ChatbotConfigsListResponse> {
    const queryParams = params ? {
      page: params.page?.toString() || '1',
      limit: params.limit?.toString() || '10',
      ...(params.search && { search: params.search }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder })
    } : undefined;
    
    const response = await apiClient.get(`${this.BASE_PATH}/configs`, queryParams);
    return response.data;
  }

  static async getChatbotConfig(id: string): Promise<ChatbotConfigResponse> {
    const response = await apiClient.get(`${this.BASE_PATH}/configs/${id}`);
    return response.data;
  }

  static async getChatbotConfigByConnection(connectionId: string): Promise<ChatbotConfigResponse> {
    const response = await apiClient.get(`${this.BASE_PATH}/configs/connection/${connectionId}`);
    return response.data;
  }

  static async createChatbotConfig(data: CreateChatbotConfigRequest): Promise<ChatbotConfigResponse> {
    const response = await apiClient.post(`${this.BASE_PATH}/configs`, data);
    return response.data;
  }

  static async updateChatbotConfig(data: UpdateChatbotConfigRequest): Promise<ChatbotConfigResponse> {
    const response = await apiClient.put(`${this.BASE_PATH}/configs/${data.id}`, data);
    return response.data;
  }

  static async deleteChatbotConfig(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`${this.BASE_PATH}/configs/${id}`);
    return response.data;
  }

  static async toggleChatbotConfig(id: string, isEnabled: boolean): Promise<ChatbotConfigResponse> {
    const response = await apiClient.patch(`${this.BASE_PATH}/configs/${id}/toggle`, { isEnabled });
    return response.data;
  }

  // Chatbot Rules CRUD operations
  static async getChatbotRules(configId: string, params?: PaginationParams): Promise<ChatbotRulesListResponse> {
    const queryParams = params ? {
      page: params.page?.toString() || '1',
      limit: params.limit?.toString() || '10',
      ...(params.search && { search: params.search }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder && { sortOrder: params.sortOrder })
    } : undefined;
    
    const response = await apiClient.get(`${this.BASE_PATH}/configs/${configId}/rules`, queryParams);
    return response.data;
  }

  static async getChatbotRule(configId: string, ruleId: string): Promise<ChatbotRuleResponse> {
    const response = await apiClient.get(`${this.BASE_PATH}/configs/${configId}/rules/${ruleId}`);
    return response.data;
  }

  static async createChatbotRule(data: CreateChatbotRuleRequest): Promise<ChatbotRuleResponse> {
    const response = await apiClient.post(`${this.BASE_PATH}/configs/${data.chatbotConfigId}/rules`, data);
    return response.data;
  }

  static async updateChatbotRule(configId: string, data: UpdateChatbotRuleRequest): Promise<ChatbotRuleResponse> {
    const response = await apiClient.put(`${this.BASE_PATH}/configs/${configId}/rules/${data.id}`, data);
    return response.data;
  }

  static async deleteChatbotRule(configId: string, ruleId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`${this.BASE_PATH}/configs/${configId}/rules/${ruleId}`);
    return response.data;
  }

  static async toggleChatbotRule(configId: string, ruleId: string, isActive: boolean): Promise<ChatbotRuleResponse> {
    const response = await apiClient.patch(`${this.BASE_PATH}/configs/${configId}/rules/${ruleId}/toggle`, { isActive });
    return response.data;
  }

  static async reorderChatbotRules(configId: string, ruleIds: string[]): Promise<{ success: boolean }> {
    const response = await apiClient.patch(`${this.BASE_PATH}/configs/${configId}/rules/reorder`, { ruleIds });
    return response.data;
  }

  // Chatbot Testing and Validation
  static async testChatbotRule(data: ChatbotTestRequest): Promise<ChatbotTestResponse> {
    const response = await apiClient.post(`${this.BASE_PATH}/test`, data);
    return response.data;
  }

  static async validateChatbotConfig(configId: string): Promise<{
    success: boolean;
    errors: Array<{
      type: 'rule_conflict' | 'missing_fallback' | 'invalid_trigger' | 'invalid_response';
      message: string;
      ruleId?: string;
    }>;
  }> {
    const response = await apiClient.post(`${this.BASE_PATH}/configs/${configId}/validate`);
    return response.data;
  }

  static async duplicateChatbotRule(configId: string, ruleId: string, newName: string): Promise<ChatbotRuleResponse> {
    const response = await apiClient.post(`${this.BASE_PATH}/configs/${configId}/rules/${ruleId}/duplicate`, { newName });
    return response.data;
  }

  // Chatbot Analytics and Performance
  static async getChatbotAnalytics(configId: string, period: { from: string; to: string }): Promise<{
    success: boolean;
    data: ChatbotAnalytics;
  }> {
    const response = await apiClient.get(`${this.BASE_PATH}/configs/${configId}/analytics`, {
      from: period.from,
      to: period.to
    });
    return response.data;
  }

  static async exportChatbotConfig(configId: string): Promise<{
    success: boolean;
    data: ChatbotConfig;
  }> {
    const response = await apiClient.get(`${this.BASE_PATH}/configs/${configId}/export`);
    return response.data;
  }

  static async importChatbotConfig(connectionId: string, config: Partial<ChatbotConfig>): Promise<ChatbotConfigResponse> {
    const response = await apiClient.post(`${this.BASE_PATH}/configs/import`, {
      connectionId,
      config
    });
    return response.data;
  }

  // Working Hours Management
  static async updateWorkingHours(configId: string, workingHours: ChatbotConfig['workingHours']): Promise<ChatbotConfigResponse> {
    const response = await apiClient.patch(`${this.BASE_PATH}/configs/${configId}/working-hours`, { workingHours });
    return response.data;
  }

  // Chatbot Settings Management
  static async updateChatbotSettings(configId: string, settings: Partial<ChatbotConfig['settings']>): Promise<ChatbotConfigResponse> {
    const response = await apiClient.patch(`${this.BASE_PATH}/configs/${configId}/settings`, { settings });
    return response.data;
  }
}

export default ChatbotService;