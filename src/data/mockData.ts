import { Chat } from "@/types/chat";

export const initialChats: Chat[] = [
  {
    id: "1",
    name: "María García",
    firstName: "María",
    lastName: "García",
    email: "maria.garcia@email.com",
    phone: "+51 987654321",
    additionalPhones: ["+51 987654322"],
    lastMessage: "Hola, necesito información sobre sus productos",
    timestamp: "14:30",
    unread: 2,
    assignedTo: "Juan Pérez",
    status: "online",
    messages: [
      { 
        id: "1", 
        content: "Hola, buenos días", 
        senderId: "client", 
        receiverId: "agent",
        senderType: "contact",
        conversationId: "1",
        timestamp: "14:25",
        type: "text",
        channel: "whatsapp",
        status: "delivered",
        isEdited: false,
        createdAt: "2023-01-01T14:25:00Z",
        updatedAt: "2023-01-01T14:25:00Z",
        isRead: true 
      },
      { 
        id: "2", 
        content: "Hola María, ¿en qué puedo ayudarte?", 
        senderId: "agent", 
        receiverId: "client",
        senderType: "agent",
        conversationId: "1",
        timestamp: "14:26",
        type: "text",
        channel: "whatsapp",
        status: "delivered",
        isEdited: false,
        createdAt: "2023-01-01T14:26:00Z",
        updatedAt: "2023-01-01T14:26:00Z",
        isRead: true 
      },
      { 
        id: "3", 
        content: "Necesito información sobre sus productos", 
        senderId: "client", 
        receiverId: "agent",
        senderType: "contact",
        conversationId: "1",
        timestamp: "14:30",
        type: "text",
        channel: "whatsapp",
        status: "delivered",
        isEdited: false,
        createdAt: "2023-01-01T14:30:00Z",
        updatedAt: "2023-01-01T14:30:00Z",
        isRead: false 
      }
    ]
  },
  {
    id: "2",
    name: "Carlos Rodríguez",
    firstName: "Carlos",
    lastName: "Rodríguez",
    email: "carlos.rodriguez@email.com",
    phone: "+51 912345678",
    additionalPhones: [],
    lastMessage: "Perfecto, muchas gracias por la información",
    timestamp: "13:45",
    unread: 0,
    assignedTo: "Ana López",
    status: "offline",
    messages: [
      { 
        id: "4", 
        content: "¿Tienen delivery?", 
        senderId: "client", 
        receiverId: "agent",
        senderType: "contact",
        conversationId: "2",
        timestamp: "13:40",
        type: "text",
        channel: "whatsapp",
        status: "delivered",
        isEdited: false,
        createdAt: "2023-01-01T13:40:00Z",
        updatedAt: "2023-01-01T13:40:00Z",
        isRead: true 
      },
      { 
        id: "5", 
        content: "Sí, hacemos delivery en toda Lima", 
        senderId: "agent", 
        receiverId: "client",
        senderType: "agent",
        conversationId: "2",
        timestamp: "13:42",
        type: "text",
        channel: "whatsapp",
        status: "delivered",
        isEdited: false,
        createdAt: "2023-01-01T13:42:00Z",
        updatedAt: "2023-01-01T13:42:00Z",
        isRead: true 
      },
      { 
        id: "6", 
        content: "Perfecto, muchas gracias por la información", 
        senderId: "client", 
        receiverId: "agent",
        senderType: "contact",
        conversationId: "2",
        timestamp: "13:45",
        type: "text",
        channel: "whatsapp",
        status: "delivered",
        isEdited: false,
        createdAt: "2023-01-01T13:45:00Z",
        updatedAt: "2023-01-01T13:45:00Z",
        isRead: true 
      }
    ]
  },
  {
    id: "3",
    name: "Ana Martínez",
    firstName: "Ana",
    lastName: "Martínez",
    email: "ana.martinez@email.com",
    phone: "+51 998877665",
    additionalPhones: ["+51 998877666", "+51 998877667"],
    lastMessage: "¿A qué hora abren mañana?",
    timestamp: "12:15",
    unread: 1,
    assignedTo: undefined,
    status: "online",
    messages: [
      { 
        id: "7", 
        content: "¿A qué hora abren mañana?", 
        senderId: "client", 
        receiverId: "agent",
        senderType: "contact",
        conversationId: "3",
        timestamp: "12:15",
        type: "text",
        channel: "whatsapp",
        status: "delivered",
        isEdited: false,
        createdAt: "2023-01-01T12:15:00Z",
        updatedAt: "2023-01-01T12:15:00Z",
        isRead: false 
      }
    ]
  }
];

export const salespeople: string[] = [
  "Juan Pérez", 
  "Ana López", 
  "Pedro Silva", 
  "Carmen Torres"
];