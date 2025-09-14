'use client';

import type { MessageType } from '@/types/chat';
import { Paperclip, Send, Image, FileText, Mic, Smile, X } from 'lucide-react';
import React, { useState, useRef } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string, type?: MessageType) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  disabled = false,
  placeholder = "Escribe un mensaje..."
}) => {
  const [message, setMessage] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = (type: MessageType = 'text') => {
    if (message.trim() || selectedFiles.length > 0) {
      onSendMessage(message.trim(), type);
      setMessage('');
      setSelectedFiles([]);
      setShowAttachmentMenu(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: MessageType) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
      // For now, we'll just send the message with file info
      // In a real implementation, you'd upload the files first
      handleSubmit(type);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
      {/* File preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Archivos seleccionados ({selectedFiles.length})
            </span>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded">
                <div className="flex items-center space-x-2">
                  {file.type.startsWith('image/') ? (
                    <Image className="w-4 h-4 text-blue-500" />
                  ) : (
                    <FileText className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end space-x-2">
        {/* Attachment menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Adjuntar archivo"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Attachment dropdown */}
          {showAttachmentMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowAttachmentMenu(false)}
              />
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-20">
                <button
                  onClick={() => {
                    imageInputRef.current?.click();
                    setShowAttachmentMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-300 rounded-t-lg"
                >
                  <Image className="w-4 h-4" />
                  <span>Imagen</span>
                </button>
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowAttachmentMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-300"
                >
                  <FileText className="w-4 h-4" />
                  <span>Documento</span>
                </button>
                <button
                  onClick={() => {
                    // Audio recording would be implemented here
                    setShowAttachmentMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-300 rounded-b-lg"
                >
                  <Mic className="w-4 h-4" />
                  <span>Audio</span>
                </button>
              </div>
            </>
          )}

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'file')}
            multiple
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
          />
          <input
            ref={imageInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'image')}
            multiple
            accept="image/*"
          />
        </div>
        
        {/* Message input */}
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg resize-none focus:outline-none focus:border-green-500 dark:focus:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </div>

        {/* Emoji button */}
        <button
          type="button"
          disabled={disabled}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Emojis"
        >
          <Smile className="w-5 h-5" />
        </button>
        
        {/* Send button */}
        <button
          onClick={() => handleSubmit()}
          disabled={disabled || (!message.trim() && selectedFiles.length === 0)}
          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Enviar mensaje"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};