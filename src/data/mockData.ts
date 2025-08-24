import { Chat } from "@/types/chat";

export const initialChats: Chat[] = [
  {
    id: 1,
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
        id: 1, 
        text: "Hola, buenos días", 
        sender: "client", 
        timestamp: "14:25", 
        status: "read" 
      },
      { 
        id: 2, 
        text: "Hola María, ¿en qué puedo ayudarte?", 
        sender: "agent", 
        timestamp: "14:26", 
        status: "read" 
      },
      { 
        id: 3, 
        text: "Necesito información sobre sus productos", 
        sender: "client", 
        timestamp: "14:30", 
        status: "delivered" 
      }
    ]
  },
  {
    id: 2,
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
        id: 1, 
        text: "¿Tienen delivery?", 
        sender: "client", 
        timestamp: "13:40", 
        status: "read" 
      },
      { 
        id: 2, 
        text: "Sí, hacemos delivery en toda Lima", 
        sender: "agent", 
        timestamp: "13:42", 
        status: "read" 
      },
      { 
        id: 3, 
        text: "Perfecto, muchas gracias por la información", 
        sender: "client", 
        timestamp: "13:45", 
        status: "read" 
      }
    ]
  },
  {
    id: 3,
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
        id: 1, 
        text: "¿A qué hora abren mañana?", 
        sender: "client", 
        timestamp: "12:15", 
        status: "delivered" 
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