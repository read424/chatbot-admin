export const MESSAGE_STATUS = {
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read'
  } as const;
  
  // User roles
  export const USER_ROLES = {
    ADMIN: 'admin',
    AGENT: 'agent',
    SUPERVISOR: 'supervisor'
  } as const;
  
  // Chat status
  export const CHAT_STATUS = {
    ONLINE: 'online',
    OFFLINE: 'offline'
  } as const;
  
  // UI Constants
  export const UI_CONSTANTS = {
    MAX_MESSAGE_LENGTH: 1000,
    AUTO_SCROLL_THRESHOLD: 100,
    TYPING_INDICATOR_TIMEOUT: 3000,
    MESSAGE_RETRY_ATTEMPTS: 3,
    SEARCH_DEBOUNCE_MS: 300
  } as const;
  
  // Color schemes
  export const COLORS = {
    SUCCESS: {
      light: 'bg-green-100 text-green-800',
      default: 'bg-green-500 text-white',
      dark: 'bg-green-700 text-white'
    },
    WARNING: {
      light: 'bg-yellow-100 text-yellow-800',
      default: 'bg-yellow-500 text-white',
      dark: 'bg-yellow-700 text-white'
    },
    ERROR: {
      light: 'bg-red-100 text-red-800',
      default: 'bg-red-500 text-white',
      dark: 'bg-red-700 text-white'
    },
    INFO: {
      light: 'bg-blue-100 text-blue-800',
      default: 'bg-blue-500 text-white',
      dark: 'bg-blue-700 text-white'
    }
  } as const;
  
  // API endpoints (for future backend integration)
  export const API_ENDPOINTS = {
    CHATS: '/api/chats',
    MESSAGES: '/api/messages',
    USERS: '/api/users',
    CLIENTS: '/api/clients'
  } as const;
  
  // Local storage keys
  export const STORAGE_KEYS = {
    USER_PREFERENCES: 'inbox_user_preferences',
    DRAFT_MESSAGES: 'inbox_draft_messages',
    CHAT_FILTERS: 'inbox_chat_filters'
  } as const;
  
  // Time formats
  export const TIME_FORMATS = {
    MESSAGE_TIME: 'HH:mm',
    FULL_DATE: 'DD/MM/YYYY HH:mm',
    RELATIVE: 'relative'
  } as const;
  
  // Validation rules
  export const VALIDATION = {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
    MAX_EMAIL_LENGTH: 100,
    MAX_PHONE_LENGTH: 20
  } as const;