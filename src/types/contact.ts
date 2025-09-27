import { ProviderType } from './connections';

// Contact related interfaces
export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  department: string;
  assignedAgent?: string;
  status: 'active' | 'inactive' | 'blocked';
  tags: string[];
  notes: ContactNote[];
  channels: ContactChannel[];
  metadata: ContactMetadata;
  createdAt: string;
  updatedAt: string;
  lastInteraction?: string;
  totalInteractions?: number;
}

export interface ContactNote {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface ContactChannel {
  type: ProviderType;
  identifier: string; // phone, username, etc.
  isVerified: boolean;
  isPrimary: boolean;
}

export interface ContactMetadata {
  source: string;
  customFields: Record<string, unknown>;
  preferences: {
    language: string;
    timezone: string;
    notifications: boolean;
  };
}

// Contact request types
export interface CreateContactRequest {
  name: string;
  phone?: string;
  email?: string;
  department: string;
  assignedAgent?: string;
  tags?: string[];
  channels?: Omit<ContactChannel, 'isVerified'>[];
  metadata?: Partial<ContactMetadata>;
}

export interface UpdateContactRequest extends Partial<CreateContactRequest> {
  id: string;
  status?: 'active' | 'inactive' | 'blocked';
}

// Contact filters and search
export interface ContactFilters {
  search?: string;
  department?: string;
  status?: 'active' | 'inactive' | 'blocked';
  assignedAgent?: string;
  tags?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  channel?: ProviderType;
}

// Contact API responses
export interface ContactResponse {
  success: boolean;
  data: Contact;
}

export interface ContactsListResponse {
  success: boolean;
  data: Contact[];
  total: number;
  page: number;
  limit: number;
}

// Contact statistics
export interface ContactStats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
  byDepartment: Array<{
    department: string;
    count: number;
  }>;
  byChannel: Array<{
    channel: ProviderType;
    count: number;
  }>;
}