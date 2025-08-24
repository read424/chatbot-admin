export interface Message {
    id: number;
    text: string;
    sender: 'client' | 'agent';
    timestamp: string;
    status: 'sent' | 'delivered' | 'read';
  }
  
  export interface Chat {
    id: number;
    name: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    additionalPhones: string[];
    lastMessage: string;
    timestamp: string;
    unread: number;
    assignedTo?: string;
    status: 'online' | 'offline';
    messages: Message[];
  }
  
  export interface User {
    id: string;
    name: string;
    role: string;
  }
  
  export interface ChatFilters {
    searchTerm: string;
    assignedTo?: string;
    status?: 'online' | 'offline' | 'all';
  }