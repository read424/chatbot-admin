'use client';

import { Paperclip, Send } from 'lucide-react';
import React, { useState } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  
  const handleSubmit = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex items-center space-x-2">
        {/* Botón de adjuntar archivos */}
        <button
          type="button"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Adjuntar archivo"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        
        {/* Input de mensaje */}
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-green-500"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </div>
        
        {/* Botón de enviar */}
        <button
          onClick={handleSubmit}
          disabled={!message.trim()}
          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};