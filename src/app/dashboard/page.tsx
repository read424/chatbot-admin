'use client';

import { ChatList } from '@/components/inbox/ChatList';
import { ChatWindow } from '@/components/inbox/ChatWindow';
import { CustomerInfo } from '@/components/inbox/CustomerInfo';
import { Header } from '@/components/inbox/Header';
import { useChat } from '@/hooks/useChat';

export default function Home() {
  const {
    chats,
    selectedChat,
    currentUser,
    searchTerm,
    handleSelectChat,
    handleSendMessage,
    handleUpdateClient,
    handleAssignSalesperson,
    handleSearchChange,
    getCurrentMessages
  } = useChat();

  const currentMessages = getCurrentMessages();

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <Header user={currentUser} />
      
      <div className="flex-1 flex overflow-hidden">
        <ChatList 
          chats={chats}
          selectedChat={selectedChat}
          searchTerm={searchTerm}
          onSelectChat={handleSelectChat}
          onSearchChange={handleSearchChange}
        />
        
        <ChatWindow 
          chat={selectedChat}
          messages={currentMessages}
          onSendMessage={handleSendMessage}
          onUpdateClient={handleUpdateClient}
        />
        
        <CustomerInfo 
          chat={selectedChat}
          onAssignSalesperson={handleAssignSalesperson}
        />
      </div>
    </div>
  );
}