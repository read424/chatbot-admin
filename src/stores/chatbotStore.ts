import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ChatbotConfig, ChatbotRule, CreateChatbotConfigRequest, CreateChatbotRuleRequest } from '@/types/chatbot';
import { ProviderType } from '@/types/connections';
import { ChatbotService } from '@/lib/api/services/chatbot';

interface ChatbotState {
  // State
  configs: ChatbotConfig[];
  currentConfig: ChatbotConfig | null;
  rules: ChatbotRule[];
  loading: boolean;
  error: string | null;

  // Actions
  loadConfigs: () => Promise<void>;
  loadConfig: (id: string) => Promise<void>;
  loadConfigByConnection: (connectionId: string) => Promise<void>;
  createConfig: (data: CreateChatbotConfigRequest) => Promise<ChatbotConfig>;
  updateConfig: (id: string, updates: Partial<ChatbotConfig>) => Promise<void>;
  deleteConfig: (id: string) => Promise<void>;
  toggleConfig: (id: string, enabled: boolean) => Promise<void>;

  // Rules actions
  loadRules: (configId: string) => Promise<void>;
  createRule: (data: CreateChatbotRuleRequest) => Promise<ChatbotRule>;
  updateRule: (configId: string, ruleId: string, updates: Partial<ChatbotRule>) => Promise<void>;
  deleteRule: (configId: string, ruleId: string) => Promise<void>;
  toggleRule: (configId: string, ruleId: string, active: boolean) => Promise<void>;
  duplicateRule: (configId: string, ruleId: string, newName: string) => Promise<void>;
  reorderRules: (configId: string, ruleIds: string[]) => Promise<void>;

  // Testing actions
  testRule: (configId: string, message: string, channel: string) => Promise<{
    success: boolean;
    matchedRule?: ChatbotRule;
    response?: {
      type: string;
      content: string;
      [key: string]: unknown;
    };
    shouldTransfer: boolean;
    transferTarget?: string;
    processingTime: number;
  }>;
  validateConfig: (configId: string) => Promise<{
    success: boolean;
    errors: Array<{
      type: string;
      message: string;
      ruleId?: string;
    }>;
  }>;

  // Utility actions
  clearError: () => void;
  setCurrentConfig: (config: ChatbotConfig | null) => void;
}

export const useChatbotStore = create<ChatbotState>()(
  devtools(
    (set, get) => ({
      // Initial state
      configs: [],
      currentConfig: null,
      rules: [],
      loading: false,
      error: null,

      // Config actions
      loadConfigs: async () => {
        try {
          set({ loading: true, error: null });
          const response = await ChatbotService.getChatbotConfigs();
          if (response.success) {
            set({ configs: response.data });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Error loading configs' });
        } finally {
          set({ loading: false });
        }
      },

      loadConfig: async (id: string) => {
        try {
          set({ loading: true, error: null });
          const response = await ChatbotService.getChatbotConfig(id);
          if (response.success) {
            set({ currentConfig: response.data });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Error loading config' });
        } finally {
          set({ loading: false });
        }
      },

      loadConfigByConnection: async (connectionId: string) => {
        try {
          set({ loading: true, error: null });
          const response = await ChatbotService.getChatbotConfigByConnection(connectionId);
          if (response.success) {
            set({ currentConfig: response.data });
          }
        } catch {
          // Config might not exist, that's okay
          set({ currentConfig: null, error: null });
        } finally {
          set({ loading: false });
        }
      },

      createConfig: async (data: CreateChatbotConfigRequest) => {
        try {
          set({ loading: true, error: null });
          const response = await ChatbotService.createChatbotConfig(data);
          if (response.success) {
            const { configs } = get();
            set({ 
              configs: [...configs, response.data],
              currentConfig: response.data
            });
            return response.data;
          }
          throw new Error('Failed to create config');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error creating config';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      updateConfig: async (id: string, updates: Partial<ChatbotConfig>) => {
        try {
          set({ loading: true, error: null });
          const response = await ChatbotService.updateChatbotConfig({ id, ...updates });
          if (response.success) {
            const { configs, currentConfig } = get();
            set({
              configs: configs.map(c => c.id === id ? response.data : c),
              currentConfig: currentConfig?.id === id ? response.data : currentConfig
            });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Error updating config' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      deleteConfig: async (id: string) => {
        try {
          set({ loading: true, error: null });
          await ChatbotService.deleteChatbotConfig(id);
          const { configs, currentConfig } = get();
          set({
            configs: configs.filter(c => c.id !== id),
            currentConfig: currentConfig?.id === id ? null : currentConfig
          });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Error deleting config' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      toggleConfig: async (id: string, enabled: boolean) => {
        try {
          set({ loading: true, error: null });
          const response = await ChatbotService.toggleChatbotConfig(id, enabled);
          if (response.success) {
            const { configs, currentConfig } = get();
            set({
              configs: configs.map(c => c.id === id ? response.data : c),
              currentConfig: currentConfig?.id === id ? response.data : currentConfig
            });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Error toggling config' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Rules actions
      loadRules: async (configId: string) => {
        try {
          set({ loading: true, error: null });
          const response = await ChatbotService.getChatbotRules(configId);
          if (response.success) {
            set({ rules: response.data });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Error loading rules' });
        } finally {
          set({ loading: false });
        }
      },

      createRule: async (data: CreateChatbotRuleRequest) => {
        try {
          set({ loading: true, error: null });
          const response = await ChatbotService.createChatbotRule(data);
          if (response.success) {
            const { rules } = get();
            set({ rules: [...rules, response.data] });
            return response.data;
          }
          throw new Error('Failed to create rule');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error creating rule';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      updateRule: async (configId: string, ruleId: string, updates: Partial<ChatbotRule>) => {
        try {
          set({ loading: true, error: null });
          const response = await ChatbotService.updateChatbotRule(configId, { id: ruleId, ...updates });
          if (response.success) {
            const { rules } = get();
            set({ rules: rules.map(r => r.id === ruleId ? response.data : r) });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Error updating rule' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      deleteRule: async (configId: string, ruleId: string) => {
        try {
          set({ loading: true, error: null });
          await ChatbotService.deleteChatbotRule(configId, ruleId);
          const { rules } = get();
          set({ rules: rules.filter(r => r.id !== ruleId) });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Error deleting rule' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      toggleRule: async (configId: string, ruleId: string, active: boolean) => {
        try {
          set({ loading: true, error: null });
          const response = await ChatbotService.toggleChatbotRule(configId, ruleId, active);
          if (response.success) {
            const { rules } = get();
            set({ rules: rules.map(r => r.id === ruleId ? response.data : r) });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Error toggling rule' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      duplicateRule: async (configId: string, ruleId: string, newName: string) => {
        try {
          set({ loading: true, error: null });
          const response = await ChatbotService.duplicateChatbotRule(configId, ruleId, newName);
          if (response.success) {
            const { rules } = get();
            set({ rules: [...rules, response.data] });
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Error duplicating rule' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      reorderRules: async (configId: string, ruleIds: string[]) => {
        try {
          set({ loading: true, error: null });
          await ChatbotService.reorderChatbotRules(configId, ruleIds);
          // Optimistically update the order
          const { rules } = get();
          const reorderedRules = ruleIds.map(id => rules.find(r => r.id === id)).filter((rule): rule is ChatbotRule => rule !== undefined);
          set({ rules: reorderedRules });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Error reordering rules' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Testing actions
      testRule: async (configId: string, message: string, channel: string) => {
        try {
          set({ loading: true, error: null });
          const response = await ChatbotService.testChatbotRule({
            configId,
            message,
            channel: channel as ProviderType
          });
          return response;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Error testing rule' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      validateConfig: async (configId: string) => {
        try {
          set({ loading: true, error: null });
          const response = await ChatbotService.validateChatbotConfig(configId);
          return response;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Error validating config' });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Utility actions
      clearError: () => set({ error: null }),
      setCurrentConfig: (config: ChatbotConfig | null) => set({ currentConfig: config })
    }),
    {
      name: 'chatbot-store'
    }
  )
);