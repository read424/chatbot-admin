import { initialChats } from '@/data/mockData';
import type { Chat, Message } from '@/types/chat';
import { useState } from 'react';

export const useChat = () => {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser] = useState("Admin Usuario");

  // Filter chats based on search term
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.phone.includes(searchTerm)
  );

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    // Mark messages as read
    if (chat.unread > 0) {
      setChats(prev => prev.map(c => 
        c.id === chat.id ? { ...c, unread: 0 } : c
      ));
    }
  };

  const handleSendMessage = (messageText: string) => {
    if (!selectedChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      senderId: 'agent',
      receiverId: 'client',
      senderType: 'agent',
      conversationId: selectedChat.id,
      timestamp: new Date().toLocaleTimeString('es-PE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      type: 'text',
      channel: 'whatsapp',
      status: 'sent',
      isEdited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isRead: false
    };

    // Update messages for selected chat
    const updatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage],
      lastMessage: messageText,
      timestamp: newMessage.timestamp
    };

    setSelectedChat(updatedChat);
    
    // Update chats list
    setChats(prev => prev.map(chat => 
      chat.id === selectedChat.id ? updatedChat : chat
    ));

    // Simulate message status updates
    setTimeout(() => {
      setChats(prev => prev.map(chat => {
        if (chat.id === selectedChat.id) {
          const updatedMessages = chat.messages.map(msg => 
            msg.id === newMessage.id ? { ...msg, status: 'delivered' as const } : msg
          );
          return { ...chat, messages: updatedMessages };
        }
        return chat;
      }));
    }, 1000);
  };

  const handleUpdateClient = (updatedClient: Chat) => {
    setChats(prev => prev.map(chat => 
      chat.id === updatedClient.id ? updatedClient : chat
    ));
    
    if (selectedChat?.id === updatedClient.id) {
      setSelectedChat(updatedClient);
    }
  };

  const handleAssignSalesperson = (chatId: string, salesperson: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, assignedTo: salesperson } : chat
    ));
    
    if (selectedChat?.id === chatId) {
      setSelectedChat(prev => prev ? { ...prev, assignedTo: salesperson } : null);
    }
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const getCurrentMessages = () => {
    return selectedChat ? 
      chats.find(c => c.id === selectedChat.id)?.messages || [] : [];
  };

  return {
    chats: filteredChats,
    selectedChat,
    currentUser,
    searchTerm,
    handleSelectChat,
    handleSendMessage,
    handleUpdateClient,
    handleAssignSalesperson,
    handleSearchChange,
    getCurrentMessages
  };
};