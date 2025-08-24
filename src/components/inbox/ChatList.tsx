'use client';

import type { Chat } from '@/types/chat';
import { Search } from 'lucide-react';
import React from 'react';

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  searchTerm: string;
  onSelectChat: (chat: Chat) => void;
  onSearchChange: (term: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChat,
  searchTerm,
  onSelectChat,
  onSearchChange
}) => {
  return (
    <div className="w-1/4 bg-white border-r border-gray-300 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar contactos..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
              selectedChat?.id === chat.id ? 'bg-gray-100 border-l-4 border-l-green-500' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 truncate">{chat.name}</h3>
                  <span className="text-xs text-gray-500">{chat.timestamp}</span>
                </div>
                <p className="text-sm text-gray-600 truncate mt-1">{chat.lastMessage}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{chat.phone}</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${chat.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    {chat.unread > 0 && (
                      <span className="bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};