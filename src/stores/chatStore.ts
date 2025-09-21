import { chatService } from '@/lib/api/services/chatService';
import type { ApiChatMessage, ApiChatSession, ApiContact } from '@/types/api';
import type { Conversation, ConversationFilters, Message, MessageStatus, TypingIndicator, User } from '@/types/chat';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';


interface ChatStore {
    // Estado
    sessions: ApiChatSession[];
    messages: Record<string, ApiChatMessage[]>; // sessionId -> messages[]
    selectedSession: ApiChatSession | null;
    contacts: ApiContact[];
    isLoading: boolean;
    error: string | null;
    
    // Conversaciones (nuevo sistema)
    conversations: Conversation[];
    selectedConversation: Conversation | null;
    conversationFilters: ConversationFilters;
    
    // Estado de conexión y usuarios en línea
    connectionStatus: 'connected' | 'disconnected';
    onlineUsers: User[];
    typingIndicators: TypingIndicator[];
    
    // Acciones
    loadSessions: () => Promise<void>;
    loadMessages: (sessionId: string) => Promise<void>;
    sendMessage: (sessionId: string, content: string, messageType?: string) => Promise<void>;
    selectSession: (session: ApiChatSession | null) => void;
    updateSession: (sessionId: string, updates: Partial<ApiChatSession>) => Promise<ApiChatSession>;
    addMessage: (sessionId: string, message: ApiChatMessage) => void;
    updateMessageStatus: (sessionId: string, messageId: string, status: number) => void;
    markSessionAsRead: (sessionId: string) => void;
    loadContacts: () => Promise<void>;
    createContact: (contactData: { phoneNumber: string; name?: string; metadata?: any }) => Promise<ApiContact>;
    
    // Acciones de conversaciones
    setSelectedConversation: (conversation: Conversation | null) => void;
    setConversationFilters: (filters: ConversationFilters) => void;
    getFilteredConversations: () => Conversation[];
    getTypingUsersForConversation: (conversationId: string) => TypingIndicator[];
    
    // Acciones para RealtimeChatProvider
    setConnectionStatus: (status: 'connected' | 'disconnected') => void;
    addMessageToConversation: (conversationId: string, message: Message) => void;
    updateMessageStatusInConversation: (conversationId: string, messageId: string, status: MessageStatus) => void;
    addTypingIndicator: (typing: TypingIndicator) => void;
    removeTypingIndicator: (userId: string, conversationId: string) => void;
    updateUserOnlineStatus: (user: User) => void;
    removeUserFromOnline: (userId: string) => void;
    updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
    
    // WebSocket handlers
    handleNewMessage: (message: ApiChatMessage, session: ApiChatSession) => void;
    handleSessionUpdate: (sessionId: string, updates: Partial<ApiChatSession>) => void;
    
    // Utils
    clearError: () => void;
    reset: () => void;
}
  
export const useChatStore = create<ChatStore>()(
    subscribeWithSelector((set, get) => ({
      // Estado inicial
      sessions: [],
      messages: {},
      selectedSession: null,
      contacts: [],
      isLoading: false,
      error: null,
      
      // Conversaciones
      conversations: [],
      selectedConversation: null,
      conversationFilters: {
        search: '',
        status: 'active',
        hasUnread: false
      },
      
      // Estado de conexión y usuarios en línea
      connectionStatus: 'disconnected',
      onlineUsers: [],
      typingIndicators: [],
  
      // Cargar sesiones
      loadSessions: async () => {
        set({ isLoading: true, error: null });
        try {
          const sessions = await chatService.getChatSessions({
            limit: 100,
            offset: 0
          });
          set({ sessions, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error desconocido',
            isLoading: false 
          });
        }
      },
  
      // Cargar mensajes de una sesión
      loadMessages: async (sessionId: string) => {
        set({ isLoading: true, error: null });
        try {
          const messages = await chatService.getChatMessages(sessionId, {
            limit: 100,
            offset: 0
          });
          
          set(state => ({
            messages: {
              ...state.messages,
              [sessionId]: messages
            },
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error desconocido',
            isLoading: false 
          });
        }
      },
  
      // Enviar mensaje
      sendMessage: async (sessionId: string, content: string, messageType = 'text') => {
        try {
          const message = await chatService.sendMessage(sessionId, content, messageType);
          
          // Agregar mensaje al store inmediatamente (optimistic update)
          set(state => ({
            messages: {
              ...state.messages,
              [sessionId]: [...(state.messages[sessionId] || []), message]
            }
          }));
  
          // Actualizar última actividad de la sesión
          set(state => ({
            sessions: state.sessions.map(session => 
              session.id === sessionId 
                ? { ...session, lastMessage: message, updatedAt: new Date().toISOString() }
                : session
            )
          }));
  
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error enviando mensaje'
          });
          throw error;
        }
      },
  
      // Seleccionar sesión
      selectSession: (session: ApiChatSession | null) => {
        set({ selectedSession: session });
        
        // Cargar mensajes si no están cargados
        if (session && !get().messages[session.id]) {
          get().loadMessages(session.id);
        }
        
        // Marcar como leído
        if (session && session.unreadCount && session.unreadCount > 0) {
          get().markSessionAsRead(session.id);
        }
      },
  
      // Actualizar sesión
      updateSession: async (sessionId: string, updates: Partial<ApiChatSession>) => {
        try {
          const updatedSession = await chatService.updateSession(sessionId, updates);
          
          set(state => ({
            sessions: state.sessions.map(session => 
              session.id === sessionId ? { ...session, ...updates } : session
            ),
            selectedSession: state.selectedSession?.id === sessionId 
              ? { ...state.selectedSession, ...updates }
              : state.selectedSession
          }));
  
          return updatedSession;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error actualizando sesión'
          });
          throw error;
        }
      },
  
      // Agregar mensaje (desde WebSocket)
      addMessage: (sessionId: string, message: ApiChatMessage) => {
        set(state => {
          const currentMessages = state.messages[sessionId] || [];
          
          // Evitar duplicados
          if (currentMessages.some(m => m.id === message.id)) {
            return state;
          }
  
          return {
            messages: {
              ...state.messages,
              [sessionId]: [...currentMessages, message]
            },
            sessions: state.sessions.map(session => {
              if (session.id === sessionId) {
                return {
                  ...session,
                  lastMessage: message,
                  updatedAt: message.createdAt,
                  unreadCount: message.direction === 'incoming' 
                    ? (session.unreadCount || 0) + 1 
                    : session.unreadCount
                };
              }
              return session;
            })
          };
        });
      },
  
      // Actualizar estado de mensaje
      updateMessageStatus: (sessionId: string, messageId: string, status: number) => {
        set(state => ({
          messages: {
            ...state.messages,
            [sessionId]: (state.messages[sessionId] || []).map(message =>
              message.id === messageId ? { ...message, status } : message
            )
          }
        }));
      },
  
      // Marcar sesión como leída
      markSessionAsRead: (sessionId: string) => {
        chatService.markAsRead(sessionId).catch(console.error);
        
        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId 
              ? { ...session, unreadCount: 0 }
              : session
          ),
          selectedSession: state.selectedSession?.id === sessionId
            ? { ...state.selectedSession, unreadCount: 0 }
            : state.selectedSession
        }));
      },
  
      // Cargar contactos
      loadContacts: async () => {
        try {
          const contacts = await chatService.getContacts({
            limit: 200,
            offset: 0
          });
          set({ contacts });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error cargando contactos'
          });
        }
      },
  
      // Crear contacto
      createContact: async (contactData) => {
        try {
          const contact = await chatService.createContact(contactData);
          set(state => ({
            contacts: [contact, ...state.contacts]
          }));
          return contact;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error creando contacto'
          });
          throw error;
        }
      },
  
      // WebSocket handlers
      handleNewMessage: (message: ApiChatMessage, session: ApiChatSession) => {
        const { addMessage, sessions } = get();
        
        // Si la sesión no existe, agregarla
        if (!sessions.find(s => s.id === session.id)) {
          set(state => ({
            sessions: [session, ...state.sessions]
          }));
        }
        
        addMessage(session.id, message);
      },
  
      handleSessionUpdate: (sessionId: string, updates: Partial<ApiChatSession>) => {
        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId ? { ...session, ...updates } : session
          ),
          selectedSession: state.selectedSession?.id === sessionId
            ? { ...state.selectedSession, ...updates }
            : state.selectedSession
        }));
      },
  
      // Acciones de conversaciones
      setSelectedConversation: (conversation: Conversation | null) => {
        set({ selectedConversation: conversation });
      },
      
      setConversationFilters: (filters: ConversationFilters) => {
        set({ conversationFilters: filters });
      },
      
      getFilteredConversations: () => {
        const { conversations, conversationFilters } = get();
        
        return conversations.filter(conversation => {
          // Filtro de búsqueda
          if (conversationFilters.search) {
            const searchTerm = conversationFilters.search.toLowerCase();
            const matchesSearch = 
              conversation.contact.name.toLowerCase().includes(searchTerm) ||
              (conversation.contact.phone && conversation.contact.phone.includes(searchTerm)) ||
              conversation.lastMessage?.content.toLowerCase().includes(searchTerm);
            
            if (!matchesSearch) return false;
          }
          
          // Filtro de estado
          if (conversationFilters.status && conversation.status !== conversationFilters.status) {
            return false;
          }
          
          // Filtro de mensajes no leídos
          if (conversationFilters.hasUnread && conversation.unreadCount === 0) {
            return false;
          }
          
          // Filtro de canal
          if (conversationFilters.channel && conversation.channel !== conversationFilters.channel) {
            return false;
          }
          
          // Filtro de departamento
          if (conversationFilters.department && conversation.department !== conversationFilters.department) {
            return false;
          }
          
          // Filtro de prioridad
          if (conversationFilters.priority && conversation.priority !== conversationFilters.priority) {
            return false;
          }
          
          // Filtro de etiquetas
          if (conversationFilters.tags && conversationFilters.tags.length > 0) {
            const hasMatchingTag = conversationFilters.tags.some(tag => 
              conversation.tags.includes(tag)
            );
            if (!hasMatchingTag) return false;
          }
          
          // Filtro de rango de fechas
          if (conversationFilters.dateRange) {
            const conversationDate = new Date(conversation.updatedAt);
            const { from, to } = conversationFilters.dateRange;
            if (conversationDate < from || conversationDate > to) {
              return false;
            }
          }
          
          return true;
        });
      },
      
      getTypingUsersForConversation: (conversationId: string) => {
        const { typingIndicators } = get();
        return typingIndicators.filter(t => t.conversationId === conversationId);
      },

      // Acciones para RealtimeChatProvider
      setConnectionStatus: (status: 'connected' | 'disconnected') => {
        set({ connectionStatus: status });
      },
      
      addMessageToConversation: (conversationId: string, message: Message) => {
        set(state => {
          const conversation = state.conversations.find(c => c.id === conversationId);
          if (!conversation) return state;
          
          // Actualizar la conversación con el nuevo mensaje
          const updatedConversations = state.conversations.map(c => 
            c.id === conversationId 
              ? { 
                  ...c, 
                  lastMessage: message,
                  unreadCount: message.senderType === 'contact' ? (c.unreadCount || 0) + 1 : c.unreadCount,
                  updatedAt: message.createdAt
                }
              : c
          );
          
          return { conversations: updatedConversations };
        });
      },
      
      updateMessageStatusInConversation: (conversationId: string, messageId: string, status: MessageStatus) => {
        // Esta función actualizaría el estado de un mensaje específico
        // Por ahora solo logueamos la acción
        console.log('Updating message status:', { conversationId, messageId, status });
      },
      
      addTypingIndicator: (typing: TypingIndicator) => {
        set(state => ({
          typingIndicators: [
            ...state.typingIndicators.filter(t => 
              !(t.userId === typing.userId && t.conversationId === typing.conversationId)
            ),
            typing
          ]
        }));
      },
      
      removeTypingIndicator: (userId: string, conversationId: string) => {
        set(state => ({
          typingIndicators: state.typingIndicators.filter(t => 
            !(t.userId === userId && t.conversationId === conversationId)
          )
        }));
      },
      
      updateUserOnlineStatus: (user: User) => {
        set(state => ({
          onlineUsers: [
            ...state.onlineUsers.filter(u => u.id !== user.id),
            user
          ]
        }));
      },
      
      removeUserFromOnline: (userId: string) => {
        set(state => ({
          onlineUsers: state.onlineUsers.filter(u => u.id !== userId)
        }));
      },
      
      updateConversation: (conversationId: string, updates: Partial<Conversation>) => {
        set(state => ({
          conversations: state.conversations.map(c => 
            c.id === conversationId ? { ...c, ...updates } : c
          ),
          selectedConversation: state.selectedConversation?.id === conversationId
            ? { ...state.selectedConversation, ...updates }
            : state.selectedConversation
        }));
      },

      // Utils
      clearError: () => set({ error: null }),
      
      reset: () => set({
        sessions: [],
        messages: {},
        selectedSession: null,
        contacts: [],
        isLoading: false,
        error: null,
        conversations: [],
        selectedConversation: null,
        conversationFilters: {
          search: '',
          status: 'active',
          hasUnread: false
        },
        connectionStatus: 'disconnected',
        onlineUsers: [],
        typingIndicators: []
      })
    }))
);
  
// Selectores útiles
export const useSelectedSession = () => useChatStore(state => state.selectedSession);
export const useSessionMessages = (sessionId: string | null) => 
useChatStore(state => sessionId ? state.messages[sessionId] || [] : []);
export const useChatError = () => useChatStore(state => state.error);
export const useChatLoading = () => useChatStore(state => state.isLoading);