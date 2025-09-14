import { ChatbotService } from '../chatbot';
import { apiClient } from '../../client';
import {
  ChatbotConfig,
  ChatbotRule,
  CreateChatbotConfigRequest,
  UpdateChatbotConfigRequest,
  CreateChatbotRuleRequest,
  UpdateChatbotRuleRequest,
  ChatbotTestRequest
} from '../../types';

// Mock the API client
jest.mock('../../client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('ChatbotService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockChatbotConfig: ChatbotConfig = {
    id: '1',
    connectionId: 'conn-1',
    isEnabled: true,
    rules: [],
    fallbackMessage: 'Sorry, I did not understand that.',
    transferToDepartment: 'support',
    workingHours: {
      enabled: true,
      timezone: 'UTC',
      schedule: [
        {
          day: 1,
          isActive: true,
          startTime: '09:00',
          endTime: '17:00'
        }
      ],
      outsideHoursMessage: 'We are currently closed.',
      outsideHoursAction: 'message_only'
    },
    settings: {
      responseDelay: 1000,
      maxRetries: 3,
      escalationKeywords: ['human', 'agent'],
      collectUserInfo: true,
      enableTypingIndicator: true,
      enableReadReceipts: true,
      sessionTimeout: 30
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const mockChatbotRule: ChatbotRule = {
    id: 'rule-1',
    name: 'Greeting Rule',
    trigger: {
      type: 'keyword',
      value: 'hello',
      caseSensitive: false,
      matchType: 'contains'
    },
    response: {
      type: 'text',
      content: 'Hello! How can I help you?',
      delay: 500
    },
    isActive: true,
    channels: ['whatsapp'],
    priority: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  describe('Chatbot Configuration Operations', () => {
    it('should get chatbot configs', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [mockChatbotConfig],
          total: 1
        }
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await ChatbotService.getChatbotConfigs();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/chatbot/configs', { params: undefined });
      expect(result).toEqual(mockResponse.data);
    });

    it('should get chatbot config by id', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: mockChatbotConfig
        }
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await ChatbotService.getChatbotConfig('1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/chatbot/configs/1');
      expect(result).toEqual(mockResponse.data);
    });

    it('should get chatbot config by connection id', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: mockChatbotConfig
        }
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await ChatbotService.getChatbotConfigByConnection('conn-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/chatbot/configs/connection/conn-1');
      expect(result).toEqual(mockResponse.data);
    });

    it('should create chatbot config', async () => {
      const createRequest: CreateChatbotConfigRequest = {
        connectionId: 'conn-1',
        fallbackMessage: 'Sorry, I did not understand that.',
        isEnabled: true
      };

      const mockResponse = {
        data: {
          success: true,
          data: mockChatbotConfig
        }
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await ChatbotService.createChatbotConfig(createRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/chatbot/configs', createRequest);
      expect(result).toEqual(mockResponse.data);
    });

    it('should update chatbot config', async () => {
      const updateRequest: UpdateChatbotConfigRequest = {
        id: '1',
        fallbackMessage: 'Updated fallback message'
      };

      const mockResponse = {
        data: {
          success: true,
          data: { ...mockChatbotConfig, fallbackMessage: 'Updated fallback message' }
        }
      };
      mockApiClient.put.mockResolvedValue(mockResponse);

      const result = await ChatbotService.updateChatbotConfig(updateRequest);

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/chatbot/configs/1', updateRequest);
      expect(result).toEqual(mockResponse.data);
    });

    it('should delete chatbot config', async () => {
      const mockResponse = {
        data: { success: true }
      };
      mockApiClient.delete.mockResolvedValue(mockResponse);

      const result = await ChatbotService.deleteChatbotConfig('1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/chatbot/configs/1');
      expect(result).toEqual(mockResponse.data);
    });

    it('should toggle chatbot config', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { ...mockChatbotConfig, isEnabled: false }
        }
      };
      mockApiClient.patch.mockResolvedValue(mockResponse);

      const result = await ChatbotService.toggleChatbotConfig('1', false);

      expect(mockApiClient.patch).toHaveBeenCalledWith('/api/chatbot/configs/1/toggle', { isEnabled: false });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Chatbot Rules Operations', () => {
    it('should get chatbot rules', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [mockChatbotRule],
          total: 1
        }
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await ChatbotService.getChatbotRules('1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/chatbot/configs/1/rules', { params: undefined });
      expect(result).toEqual(mockResponse.data);
    });

    it('should get chatbot rule by id', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: mockChatbotRule
        }
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await ChatbotService.getChatbotRule('1', 'rule-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/chatbot/configs/1/rules/rule-1');
      expect(result).toEqual(mockResponse.data);
    });

    it('should create chatbot rule', async () => {
      const createRequest: CreateChatbotRuleRequest = {
        chatbotConfigId: '1',
        name: 'Test Rule',
        trigger: {
          type: 'keyword',
          value: 'test',
          caseSensitive: false,
          matchType: 'contains'
        },
        response: {
          type: 'text',
          content: 'This is a test response'
        },
        channels: ['whatsapp']
      };

      const mockResponse = {
        data: {
          success: true,
          data: mockChatbotRule
        }
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await ChatbotService.createChatbotRule(createRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/chatbot/configs/1/rules', createRequest);
      expect(result).toEqual(mockResponse.data);
    });

    it('should update chatbot rule', async () => {
      const updateRequest: UpdateChatbotRuleRequest = {
        id: 'rule-1',
        name: 'Updated Rule Name'
      };

      const mockResponse = {
        data: {
          success: true,
          data: { ...mockChatbotRule, name: 'Updated Rule Name' }
        }
      };
      mockApiClient.put.mockResolvedValue(mockResponse);

      const result = await ChatbotService.updateChatbotRule('1', updateRequest);

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/chatbot/configs/1/rules/rule-1', updateRequest);
      expect(result).toEqual(mockResponse.data);
    });

    it('should delete chatbot rule', async () => {
      const mockResponse = {
        data: { success: true }
      };
      mockApiClient.delete.mockResolvedValue(mockResponse);

      const result = await ChatbotService.deleteChatbotRule('1', 'rule-1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/chatbot/configs/1/rules/rule-1');
      expect(result).toEqual(mockResponse.data);
    });

    it('should toggle chatbot rule', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { ...mockChatbotRule, isActive: false }
        }
      };
      mockApiClient.patch.mockResolvedValue(mockResponse);

      const result = await ChatbotService.toggleChatbotRule('1', 'rule-1', false);

      expect(mockApiClient.patch).toHaveBeenCalledWith('/api/chatbot/configs/1/rules/rule-1/toggle', { isActive: false });
      expect(result).toEqual(mockResponse.data);
    });

    it('should reorder chatbot rules', async () => {
      const ruleIds = ['rule-1', 'rule-2', 'rule-3'];
      const mockResponse = {
        data: { success: true }
      };
      mockApiClient.patch.mockResolvedValue(mockResponse);

      const result = await ChatbotService.reorderChatbotRules('1', ruleIds);

      expect(mockApiClient.patch).toHaveBeenCalledWith('/api/chatbot/configs/1/rules/reorder', { ruleIds });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Chatbot Testing and Validation', () => {
    it('should test chatbot rule', async () => {
      const testRequest: ChatbotTestRequest = {
        configId: '1',
        message: 'hello',
        channel: 'whatsapp'
      };

      const mockResponse = {
        data: {
          success: true,
          matchedRule: mockChatbotRule,
          response: mockChatbotRule.response,
          shouldTransfer: false,
          processingTime: 50
        }
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await ChatbotService.testChatbotRule(testRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/chatbot/test', testRequest);
      expect(result).toEqual(mockResponse.data);
    });

    it('should validate chatbot config', async () => {
      const mockResponse = {
        data: {
          success: true,
          errors: []
        }
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await ChatbotService.validateChatbotConfig('1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/chatbot/configs/1/validate');
      expect(result).toEqual(mockResponse.data);
    });

    it('should duplicate chatbot rule', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { ...mockChatbotRule, id: 'rule-2', name: 'Duplicated Rule' }
        }
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await ChatbotService.duplicateChatbotRule('1', 'rule-1', 'Duplicated Rule');

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/chatbot/configs/1/rules/rule-1/duplicate', { newName: 'Duplicated Rule' });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Chatbot Analytics and Performance', () => {
    it('should get chatbot analytics', async () => {
      const period = { from: '2024-01-01', to: '2024-01-31' };
      const mockAnalytics = {
        configId: '1',
        period,
        totalInteractions: 100,
        resolvedByBot: 80,
        transferredToAgent: 20,
        rulePerformance: [],
        channelBreakdown: []
      };

      const mockResponse = {
        data: {
          success: true,
          data: mockAnalytics
        }
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await ChatbotService.getChatbotAnalytics('1', period);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/chatbot/configs/1/analytics', { params: period });
      expect(result).toEqual(mockResponse.data);
    });

    it('should export chatbot config', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: mockChatbotConfig
        }
      };
      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await ChatbotService.exportChatbotConfig('1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/chatbot/configs/1/export');
      expect(result).toEqual(mockResponse.data);
    });

    it('should import chatbot config', async () => {
      const config = { fallbackMessage: 'Imported config' };
      const mockResponse = {
        data: {
          success: true,
          data: mockChatbotConfig
        }
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await ChatbotService.importChatbotConfig('conn-1', config);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/chatbot/configs/import', {
        connectionId: 'conn-1',
        config
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Working Hours and Settings Management', () => {
    it('should update working hours', async () => {
      const workingHours = mockChatbotConfig.workingHours;
      const mockResponse = {
        data: {
          success: true,
          data: mockChatbotConfig
        }
      };
      mockApiClient.patch.mockResolvedValue(mockResponse);

      const result = await ChatbotService.updateWorkingHours('1', workingHours);

      expect(mockApiClient.patch).toHaveBeenCalledWith('/api/chatbot/configs/1/working-hours', { workingHours });
      expect(result).toEqual(mockResponse.data);
    });

    it('should update chatbot settings', async () => {
      const settings = { responseDelay: 2000 };
      const mockResponse = {
        data: {
          success: true,
          data: { ...mockChatbotConfig, settings: { ...mockChatbotConfig.settings, responseDelay: 2000 } }
        }
      };
      mockApiClient.patch.mockResolvedValue(mockResponse);

      const result = await ChatbotService.updateChatbotSettings('1', settings);

      expect(mockApiClient.patch).toHaveBeenCalledWith('/api/chatbot/configs/1/settings', { settings });
      expect(result).toEqual(mockResponse.data);
    });
  });
});