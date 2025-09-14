import { ContactsService } from '../contacts';
import { apiClient } from '../../client';
import type { Contact, CreateContactRequest, UpdateContactRequest, ContactFilters } from '../../types';

// Mock the API client
jest.mock('../../client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    request: jest.fn(),
  },
}));

// Mock fetch for file operations
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Helper function to create mock API responses
const createMockApiResponse = <T>(data: T) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: new Headers(),
});

// Test data examples
const mockContact: Contact = {
    id: '1',
    name: 'Test Contact',
    phone: '+1234567890',
    email: 'test@example.com',
    department: 'sales',
    status: 'active',
    tags: ['vip', 'customer'],
    notes: [],
    channels: [
        {
            type: 'whatsapp',
            identifier: '+1234567890',
            isVerified: true,
            isPrimary: true,
        }
    ],
    metadata: {
        source: 'manual',
        customFields: { priority: 'high' },
        preferences: {
            language: 'es',
            timezone: 'America/Mexico_City',
            notifications: true,
        },
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
};

const mockCreateContactRequest: CreateContactRequest = {
    name: 'New Contact',
    phone: '+1234567890',
    email: 'new@example.com',
    department: 'sales',
    tags: ['prospect'],
    channels: [
        {
            type: 'whatsapp',
            identifier: '+1234567890',
            isPrimary: true,
        }
    ],
};

/**
 * Test Cases to Implement:
 * 
 * 1. getContacts()
 *    - Should fetch contacts with filters and pagination
 *    - Should fetch contacts without filters
 *    - Should handle API errors gracefully
 * 
 * 2. getContactById()
 *    - Should fetch a contact by ID
 *    - Should handle contact not found (404)
 *    - Should handle API errors
 * 
 * 3. createContact()
 *    - Should create a new contact with valid data
 *    - Should handle validation errors
 *    - Should handle API errors
 * 
 * 4. updateContact()
 *    - Should update an existing contact
 *    - Should handle partial updates
 *    - Should handle contact not found
 * 
 * 5. deleteContact()
 *    - Should delete a contact by ID
 *    - Should handle contact not found
 *    - Should handle API errors
 * 
 * 6. deleteContacts() (bulk delete)
 *    - Should delete multiple contacts
 *    - Should handle empty array
 *    - Should handle partial failures
 * 
 * 7. updateContactStatus()
 *    - Should update contact status to active/inactive/blocked
 *    - Should handle invalid status values
 *    - Should handle contact not found
 * 
 * 8. bulkUpdateContacts()
 *    - Should update multiple contacts with same data
 *    - Should handle empty selection
 *    - Should handle partial failures
 * 
 * 9. searchContacts()
 *    - Should search contacts with query string
 *    - Should respect limit parameter
 *    - Should handle empty results
 * 
 * 10. addContactNote()
 *     - Should add a note to a contact
 *     - Should handle empty content
 *     - Should handle contact not found
 * 
 * 11. updateContactNote()
 *     - Should update an existing note
 *     - Should handle note not found
 *     - Should handle contact not found
 * 
 * 12. deleteContactNote()
 *     - Should delete a note from a contact
 *     - Should handle note not found
 *     - Should handle contact not found
 * 
 * 13. addContactChannel()
 *     - Should add a communication channel
 *     - Should handle duplicate channels
 *     - Should handle invalid channel types
 * 
 * 14. updateContactChannel()
 *     - Should update channel information
 *     - Should handle primary channel changes
 *     - Should handle channel not found
 * 
 * 15. deleteContactChannel()
 *     - Should delete a communication channel
 *     - Should handle channel not found
 *     - Should prevent deletion of last channel
 * 
 * 16. getContactStats()
 *     - Should return contact statistics
 *     - Should handle empty database
 *     - Should calculate correct totals by status/department
 * 
 * 17. exportContacts()
 *     - Should export contacts as CSV
 *     - Should export contacts as Excel
 *     - Should apply filters to export
 *     - Should handle large datasets
 * 
 * 18. importContacts()
 *     - Should import contacts from CSV file
 *     - Should handle validation errors
 *     - Should return success/error counts
 *     - Should handle duplicate contacts
 * 
 * 19. findContactByChannel()
 *     - Should find contact by channel type and identifier
 *     - Should return null when not found
 *     - Should handle multiple matches
 * 
 * 20. getContactInteractionHistory()
 *     - Should return interaction history for a contact
 *     - Should handle contact with no interactions
 *     - Should handle contact not found
 */

describe('ContactsService', () => {
  let contactsService: ContactsService;
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    contactsService = new ContactsService();
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('getContacts', () => {
    it('should fetch contacts with filters and pagination', async () => {
      const mockResponseData = {
        data: [mockContact],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockApiClient.get.mockResolvedValue(createMockApiResponse(mockResponseData));

      const filters: ContactFilters & { page?: number; limit?: number } = {
        search: 'test',
        department: 'sales',
        page: 1,
        limit: 10,
      };

      const result = await contactsService.getContacts(filters);

      expect(mockApiClient.get).toHaveBeenCalledWith('/contacts', filters);
      expect(result).toEqual(mockResponseData);
    });

    it('should fetch contacts without filters', async () => {
      const mockResponseData = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      mockApiClient.get.mockResolvedValue(createMockApiResponse(mockResponseData));

      const result = await contactsService.getContacts();

      expect(mockApiClient.get).toHaveBeenCalledWith('/contacts', {});
      expect(result).toEqual(mockResponseData);
    });
  });

  describe('createContact', () => {
    it('should create a new contact', async () => {
      mockApiClient.post.mockResolvedValue(createMockApiResponse(mockContact));

      const result = await contactsService.createContact(mockCreateContactRequest);

      expect(mockApiClient.post).toHaveBeenCalledWith('/contacts', mockCreateContactRequest);
      expect(result).toEqual(mockContact);
    });
  });

  describe('getContactById', () => {
    it('should fetch a contact by ID', async () => {
      mockApiClient.get.mockResolvedValue(createMockApiResponse(mockContact));

      const result = await contactsService.getContactById('1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/contacts/1');
      expect(result).toEqual(mockContact);
    });
  });

  describe('updateContact', () => {
    it('should update an existing contact', async () => {
      const updateData: UpdateContactRequest = {
        id: '1',
        name: 'Updated Contact',
        status: 'inactive',
      };
      const updatedContact = { ...mockContact, ...updateData };
      mockApiClient.patch.mockResolvedValue(createMockApiResponse(updatedContact));

      const result = await contactsService.updateContact('1', updateData);

      expect(mockApiClient.patch).toHaveBeenCalledWith('/contacts/1', updateData);
      expect(result).toEqual(updatedContact);
    });
  });

  describe('deleteContact', () => {
    it('should delete a contact', async () => {
      mockApiClient.delete.mockResolvedValue(createMockApiResponse(undefined));

      await contactsService.deleteContact('1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/contacts/1');
    });
  });

  describe('searchContacts', () => {
    it('should search contacts with default limit', async () => {
      const mockContacts = [mockContact];
      mockApiClient.get.mockResolvedValue(createMockApiResponse(mockContacts));

      const result = await contactsService.searchContacts('test query');

      expect(mockApiClient.get).toHaveBeenCalledWith('/contacts/search', { q: 'test query', limit: 10 });
      expect(result).toEqual(mockContacts);
    });

    it('should search contacts with custom limit', async () => {
      const mockContacts = [mockContact];
      mockApiClient.get.mockResolvedValue(createMockApiResponse(mockContacts));

      const result = await contactsService.searchContacts('test query', 20);

      expect(mockApiClient.get).toHaveBeenCalledWith('/contacts/search', { q: 'test query', limit: 20 });
      expect(result).toEqual(mockContacts);
    });
  });

  describe('updateContactStatus', () => {
    it('should update contact status', async () => {
      const updatedContact = { ...mockContact, status: 'blocked' as const };
      mockApiClient.patch.mockResolvedValue(createMockApiResponse(updatedContact));

      const result = await contactsService.updateContactStatus('1', 'blocked');

      expect(mockApiClient.patch).toHaveBeenCalledWith('/contacts/1/status', { status: 'blocked' });
      expect(result).toEqual(updatedContact);
    });
  });

  describe('bulkUpdateContacts', () => {
    it('should update multiple contacts', async () => {
      const ids = ['1', '2', '3'];
      const updates = { status: 'active' as const, department: 'support' };
      const mockContacts = [mockContact];
      mockApiClient.patch.mockResolvedValue(createMockApiResponse(mockContacts));

      const result = await contactsService.bulkUpdateContacts(ids, updates);

      expect(mockApiClient.patch).toHaveBeenCalledWith('/contacts/bulk-update', { ids, updates });
      expect(result).toEqual(mockContacts);
    });
  });

  describe('addContactNote', () => {
    it('should add a note to a contact', async () => {
      const contactWithNote = {
        ...mockContact,
        notes: [{
          id: 'note1',
          content: 'Test note',
          authorId: 'user1',
          authorName: 'Test User',
          createdAt: '2023-01-01T00:00:00Z',
        }]
      };
      mockApiClient.post.mockResolvedValue(createMockApiResponse(contactWithNote));

      const result = await contactsService.addContactNote('1', 'Test note');

      expect(mockApiClient.post).toHaveBeenCalledWith('/contacts/1/notes', { content: 'Test note' });
      expect(result).toEqual(contactWithNote);
    });
  });

  describe('findContactByChannel', () => {
    it('should find contact by channel', async () => {
      mockApiClient.get.mockResolvedValue(createMockApiResponse(mockContact));

      const result = await contactsService.findContactByChannel('whatsapp', '+1234567890');

      expect(mockApiClient.get).toHaveBeenCalledWith('/contacts/by-channel', { type: 'whatsapp', identifier: '+1234567890' });
      expect(result).toEqual(mockContact);
    });

    it('should return null when contact not found', async () => {
      const error = { response: { status: 404 } };
      mockApiClient.get.mockRejectedValue(error);

      const result = await contactsService.findContactByChannel('whatsapp', '+1234567890');

      expect(result).toBeNull();
    });

    it('should throw error for non-404 errors', async () => {
      const error = { response: { status: 500 } };
      mockApiClient.get.mockRejectedValue(error);

      await expect(contactsService.findContactByChannel('whatsapp', '+1234567890')).rejects.toEqual(error);
    });
  });

  describe('exportContacts', () => {
    it('should export contacts as CSV', async () => {
      const mockBlob = new Blob(['csv data'], { type: 'text/csv' });
      mockFetch.mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      } as Response);

      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => 'mock-token'),
        },
        writable: true,
      });

      const result = await contactsService.exportContacts({ search: 'test' }, 'csv');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/contacts/export'),
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json',
          },
        })
      );
      expect(result).toEqual(mockBlob);
    });

    it('should throw error when export fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(contactsService.exportContacts()).rejects.toThrow('Export failed: Internal Server Error');
    });
  });

  describe('importContacts', () => {
    it('should import contacts from file', async () => {
      const mockFile = new File(['csv data'], 'contacts.csv', { type: 'text/csv' });
      const mockResult = { success: 10, errors: [] };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      } as Response);

      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => 'mock-token'),
        },
        writable: true,
      });

      const result = await contactsService.importContacts(mockFile);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/contacts/import'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer mock-token',
          },
          body: expect.any(FormData),
        })
      );
      expect(result).toEqual(mockResult);
    });

    it('should throw error when import fails', async () => {
      const mockFile = new File(['csv data'], 'contacts.csv', { type: 'text/csv' });
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
      } as Response);

      await expect(contactsService.importContacts(mockFile)).rejects.toThrow('Import failed: Bad Request');
    });
  });
});

export { ContactsService, mockContact, mockCreateContactRequest };