import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { contactsService } from '@/lib/api/services/contacts';
import type {
  Contact,
  ContactFilters,
  CreateContactRequest,
  UpdateContactRequest,
  ContactStats,
  PaginatedResponse
} from '@/lib/api/types';

interface ContactState {
  // Data state
  contacts: Contact[];
  selectedContact: Contact | null;
  contactStats: ContactStats | null;
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Pagination state
  currentPage: number;
  totalPages: number;
  totalContacts: number;
  pageSize: number;
  
  // Filter state
  filters: ContactFilters;
  searchQuery: string;
  
  // Selection state (for bulk operations)
  selectedContactIds: Set<string>;
  
  // Actions
  setContacts: (contacts: Contact[]) => void;
  setSelectedContact: (contact: Contact | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<ContactFilters>) => void;
  setSearchQuery: (query: string) => void;
  setPagination: (page: number, totalPages: number, total: number) => void;
  
  // Selection actions
  toggleContactSelection: (contactId: string) => void;
  selectAllContacts: () => void;
  clearSelection: () => void;
  
  // API actions
  fetchContacts: (page?: number, filters?: ContactFilters) => Promise<void>;
  fetchContactById: (id: string) => Promise<Contact | null>;
  createContact: (contactData: CreateContactRequest) => Promise<Contact | null>;
  updateContact: (id: string, contactData: UpdateContactRequest) => Promise<Contact | null>;
  deleteContact: (id: string) => Promise<boolean>;
  deleteSelectedContacts: () => Promise<boolean>;
  bulkUpdateSelectedContacts: (updates: Partial<Pick<Contact, 'status' | 'department' | 'assignedAgent' | 'tags'>>) => Promise<boolean>;
  searchContacts: (query: string) => Promise<Contact[]>;
  fetchContactStats: () => Promise<void>;
  
  // Contact notes actions
  addContactNote: (contactId: string, content: string) => Promise<boolean>;
  updateContactNote: (contactId: string, noteId: string, content: string) => Promise<boolean>;
  deleteContactNote: (contactId: string, noteId: string) => Promise<boolean>;
  
  // Contact channels actions
  addContactChannel: (contactId: string, channel: { type: string; identifier: string; isPrimary?: boolean }) => Promise<boolean>;
  updateContactChannel: (contactId: string, channelId: string, updates: { identifier?: string; isPrimary?: boolean; isVerified?: boolean }) => Promise<boolean>;
  deleteContactChannel: (contactId: string, channelId: string) => Promise<boolean>;
  
  // Utility actions
  refreshContacts: () => Promise<void>;
  resetState: () => void;
}

const initialState = {
  contacts: [],
  selectedContact: null,
  contactStats: null,
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 0,
  totalContacts: 0,
  pageSize: 10,
  filters: {},
  searchQuery: '',
  selectedContactIds: new Set<string>(),
};

export const useContactStore = create<ContactState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Basic setters
      setContacts: (contacts) => set({ contacts }),
      setSelectedContact: (selectedContact) => set({ selectedContact }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setFilters: (newFilters) => set((state) => ({ 
        filters: { ...state.filters, ...newFilters } 
      })),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setPagination: (currentPage, totalPages, totalContacts) => 
        set({ currentPage, totalPages, totalContacts }),

      // Selection actions
      toggleContactSelection: (contactId) => set((state) => {
        const newSelection = new Set(state.selectedContactIds);
        if (newSelection.has(contactId)) {
          newSelection.delete(contactId);
        } else {
          newSelection.add(contactId);
        }
        return { selectedContactIds: newSelection };
      }),

      selectAllContacts: () => set((state) => ({
        selectedContactIds: new Set(state.contacts.map(c => c.id))
      })),

      clearSelection: () => set({ selectedContactIds: new Set() }),

      // API actions
      fetchContacts: async (page = 1, filters = {}) => {
        const state = get();
        set({ loading: true, error: null });
        
        try {
          const mergedFilters = { ...state.filters, ...filters };
          const response: PaginatedResponse<Contact> = await contactsService.getContacts({
            ...mergedFilters,
            page,
            limit: state.pageSize,
          });
          
          set({
            contacts: response.data,
            currentPage: response.page,
            totalPages: response.totalPages || Math.ceil(response.total / state.pageSize),
            totalContacts: response.total,
            loading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error fetching contacts',
            loading: false,
          });
        }
      },

      fetchContactById: async (id) => {
        set({ loading: true, error: null });
        
        try {
          const contact = await contactsService.getContactById(id);
          set({ selectedContact: contact, loading: false });
          return contact;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error fetching contact',
            loading: false,
          });
          return null;
        }
      },

      createContact: async (contactData) => {
        set({ loading: true, error: null });
        
        try {
          const newContact = await contactsService.createContact(contactData);
          
          // Add to current contacts list (optimistic update)
          set((state) => ({
            contacts: [newContact, ...state.contacts],
            totalContacts: state.totalContacts + 1,
            loading: false,
          }));
          
          return newContact;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error creating contact',
            loading: false,
          });
          return null;
        }
      },

      updateContact: async (id, contactData) => {
        set({ loading: true, error: null });
        
        try {
          const updatedContact = await contactsService.updateContact(id, contactData);
          
          // Update in current contacts list (optimistic update)
          set((state) => ({
            contacts: state.contacts.map(c => c.id === id ? updatedContact : c),
            selectedContact: state.selectedContact?.id === id ? updatedContact : state.selectedContact,
            loading: false,
          }));
          
          return updatedContact;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error updating contact',
            loading: false,
          });
          return null;
        }
      },

      deleteContact: async (id) => {
        set({ loading: true, error: null });
        
        try {
          await contactsService.deleteContact(id);
          
          // Remove from current contacts list (optimistic update)
          set((state) => ({
            contacts: state.contacts.filter(c => c.id !== id),
            selectedContact: state.selectedContact?.id === id ? null : state.selectedContact,
            totalContacts: state.totalContacts - 1,
            selectedContactIds: new Set([...state.selectedContactIds].filter(cId => cId !== id)),
            loading: false,
          }));
          
          return true;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error deleting contact',
            loading: false,
          });
          return false;
        }
      },

      deleteSelectedContacts: async () => {
        const state = get();
        const selectedIds = Array.from(state.selectedContactIds);
        
        if (selectedIds.length === 0) return false;
        
        set({ loading: true, error: null });
        
        try {
          await contactsService.deleteContacts(selectedIds);
          
          // Remove from current contacts list (optimistic update)
          set((state) => ({
            contacts: state.contacts.filter(c => !selectedIds.includes(c.id)),
            totalContacts: state.totalContacts - selectedIds.length,
            selectedContactIds: new Set(),
            loading: false,
          }));
          
          return true;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error deleting contacts',
            loading: false,
          });
          return false;
        }
      },

      bulkUpdateSelectedContacts: async (updates) => {
        const state = get();
        const selectedIds = Array.from(state.selectedContactIds);
        
        if (selectedIds.length === 0) return false;
        
        set({ loading: true, error: null });
        
        try {
          const updatedContacts = await contactsService.bulkUpdateContacts(selectedIds, updates);
          
          // Update contacts in current list (optimistic update)
          set((state) => ({
            contacts: state.contacts.map(contact => {
              const updatedContact = updatedContacts.find(uc => uc.id === contact.id);
              return updatedContact || contact;
            }),
            selectedContactIds: new Set(),
            loading: false,
          }));
          
          return true;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error updating contacts',
            loading: false,
          });
          return false;
        }
      },

      searchContacts: async (query) => {
        set({ loading: true, error: null });
        
        try {
          const contacts = await contactsService.searchContacts(query);
          set({ loading: false });
          return contacts;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error searching contacts',
            loading: false,
          });
          return [];
        }
      },

      fetchContactStats: async () => {
        try {
          const stats = await contactsService.getContactStats();
          set({ contactStats: stats });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error fetching contact stats',
          });
        }
      },

      // Contact notes actions
      addContactNote: async (contactId, content) => {
        set({ loading: true, error: null });
        
        try {
          const updatedContact = await contactsService.addContactNote(contactId, content);
          
          // Update contact in state
          set((state) => ({
            contacts: state.contacts.map(c => c.id === contactId ? updatedContact : c),
            selectedContact: state.selectedContact?.id === contactId ? updatedContact : state.selectedContact,
            loading: false,
          }));
          
          return true;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error adding note',
            loading: false,
          });
          return false;
        }
      },

      updateContactNote: async (contactId, noteId, content) => {
        set({ loading: true, error: null });
        
        try {
          const updatedContact = await contactsService.updateContactNote(contactId, noteId, content);
          
          // Update contact in state
          set((state) => ({
            contacts: state.contacts.map(c => c.id === contactId ? updatedContact : c),
            selectedContact: state.selectedContact?.id === contactId ? updatedContact : state.selectedContact,
            loading: false,
          }));
          
          return true;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error updating note',
            loading: false,
          });
          return false;
        }
      },

      deleteContactNote: async (contactId, noteId) => {
        set({ loading: true, error: null });
        
        try {
          const updatedContact = await contactsService.deleteContactNote(contactId, noteId);
          
          // Update contact in state
          set((state) => ({
            contacts: state.contacts.map(c => c.id === contactId ? updatedContact : c),
            selectedContact: state.selectedContact?.id === contactId ? updatedContact : state.selectedContact,
            loading: false,
          }));
          
          return true;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error deleting note',
            loading: false,
          });
          return false;
        }
      },

      // Contact channels actions
      addContactChannel: async (contactId, channel) => {
        set({ loading: true, error: null });
        
        try {
          const updatedContact = await contactsService.addContactChannel(contactId, channel);
          
          // Update contact in state
          set((state) => ({
            contacts: state.contacts.map(c => c.id === contactId ? updatedContact : c),
            selectedContact: state.selectedContact?.id === contactId ? updatedContact : state.selectedContact,
            loading: false,
          }));
          
          return true;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error adding channel',
            loading: false,
          });
          return false;
        }
      },

      updateContactChannel: async (contactId, channelId, updates) => {
        set({ loading: true, error: null });
        
        try {
          const updatedContact = await contactsService.updateContactChannel(contactId, channelId, updates);
          
          // Update contact in state
          set((state) => ({
            contacts: state.contacts.map(c => c.id === contactId ? updatedContact : c),
            selectedContact: state.selectedContact?.id === contactId ? updatedContact : state.selectedContact,
            loading: false,
          }));
          
          return true;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error updating channel',
            loading: false,
          });
          return false;
        }
      },

      deleteContactChannel: async (contactId, channelId) => {
        set({ loading: true, error: null });
        
        try {
          const updatedContact = await contactsService.deleteContactChannel(contactId, channelId);
          
          // Update contact in state
          set((state) => ({
            contacts: state.contacts.map(c => c.id === contactId ? updatedContact : c),
            selectedContact: state.selectedContact?.id === contactId ? updatedContact : state.selectedContact,
            loading: false,
          }));
          
          return true;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error deleting channel',
            loading: false,
          });
          return false;
        }
      },

      // Utility actions
      refreshContacts: async () => {
        const state = get();
        await get().fetchContacts(state.currentPage, state.filters);
      },

      resetState: () => set(initialState),
    }),
    {
      name: 'contact-store',
    }
  )
);