'use client';

import {
    Message,
    MessageType,
    SendMessageRequest,
    SendMessageWithAttachmentsRequest
} from '@/types/inbox';
import { File, Image, Loader2, Paperclip, Send, Smile, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface MessageInputProps {
    conversationId?: string;
    replyTo?: Message | null;
    placeholder?: string;
    disabled?: boolean;
    isLoading?: boolean;
    maxFileSize?: number; // in MB
    allowedFileTypes?: string[];
    onSendMessage?: (request: SendMessageRequest) => Promise<void>;
    onSendMessageWithAttachments?: (request: SendMessageWithAttachmentsRequest) => Promise<void>;
    onTypingStart?: () => void;
    onTypingStop?: () => void;
    onCancelReply?: () => void;
}

const DEFAULT_MAX_FILE_SIZE = 10; // 10MB
const DEFAULT_ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
];

const IMAGE_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
];

export const MessageInput: React.FC<MessageInputProps> = ({ 
    conversationId,
    replyTo,
    placeholder = "Escribe un mensaje...",
    disabled = false,
    isLoading = false,
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    allowedFileTypes = DEFAULT_ALLOWED_FILE_TYPES,
    onSendMessage,
    onSendMessageWithAttachments,
    onTypingStart,
    onTypingStop,
    onCancelReply
}) => {
    // State
    const [message, setMessage] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    // Refs
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
        }
    }, [message]);

    // Handle typing indicators
    const handleTypingStart = useCallback(() => {
        if (!isTyping && onTypingStart) {
            setIsTyping(true);
            onTypingStart();
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout
        typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTypingStop?.();
        }, 2000);
    }, [isTyping, onTypingStart, onTypingStop]);

    const handleTypingStop = useCallback(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        if (isTyping) {
            setIsTyping(false);
            onTypingStop?.();
        }
    }, [isTyping, onTypingStop]);

    // Cleanup typing timeout on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    // File validation
    const validateFile = useCallback((file: File): string | null => {
        // Check file size
        if (file.size > maxFileSize * 1024 * 1024) {
            return `El archivo "${file.name}" excede el tamaño máximo de ${maxFileSize}MB`;
        }
        // Check file type
        if (!allowedFileTypes.includes(file.type)) {
            return `El tipo de archivo "${file.type}" no está permitido`;
        }
        return null;
    }, [maxFileSize, allowedFileTypes]);

    // Handle file selection
    const handleFileSelect = useCallback((files: FileList | null) => {
        if (!files) return;

        const validFiles: File[] = [];
        const errors: string[] = [];

        Array.from(files).forEach(file => {
            const error = validateFile(file);
            if (error) {
                errors.push(error);
            } else {
                validFiles.push(file);
            }
        });

        if (errors.length > 0) {
            alert(errors.join('\n'));
        }

        if (validFiles.length > 0) {
            setAttachments(prev => [...prev, ...validFiles]);
        }
    }, [validateFile]);

    // Handle drag and drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleFileSelect(e.dataTransfer.files);
    }, [handleFileSelect]);

    // Remove attachment
    const removeAttachment = useCallback((index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    }, []);

    // Get message type based on attachments
    const getMessageType = useCallback((): MessageType => {
        if (attachments.length === 0) return 'text';
        
        const hasImages = attachments.some(file => IMAGE_FILE_TYPES.includes(file.type));
        const hasOtherFiles = attachments.some(file => !IMAGE_FILE_TYPES.includes(file.type));

        if (hasImages && !hasOtherFiles) return 'image';
        return 'file';
    }, [attachments]);

    // Handle send message
    const handleSendMessage = useCallback(async () => {
        if (!conversationId) {
        console.warn('No conversation ID provided');
        return;
        }

        const trimmedMessage = message.trim();
        if (!trimmedMessage && attachments.length === 0) {
        return;
        }

        try {
        setIsUploading(true);
        handleTypingStop();

        const messageType = getMessageType();
        
        if (attachments.length > 0) {
            // Send message with attachments
            if (onSendMessageWithAttachments) {
            const request: SendMessageWithAttachmentsRequest = {
                conversationId,
                content: trimmedMessage,
                type: messageType,
                attachments,
                replyTo: replyTo?.id
            };
            await onSendMessageWithAttachments(request);
            }
        } else {
            // Send text message
            if (onSendMessage) {
            const request: SendMessageRequest = {
                conversationId,
                content: trimmedMessage,
                type: 'text',
                replyTo: replyTo?.id
            };
            await onSendMessage(request);
            }
        }

        // Clear input
        setMessage('');
        setAttachments([]);
        
        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        } catch (error) {
        console.error('Error sending message:', error);
        // You might want to show an error toast here
        } finally {
        setIsUploading(false);
        }
    }, [
        conversationId,
        message,
        attachments,
        replyTo,
        getMessageType,
        onSendMessage,
        onSendMessageWithAttachments,
        handleTypingStop
    ]);

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
        }
    }, [handleSendMessage]);

    // Handle input change
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        handleTypingStart();
    }, [handleTypingStart]);

    const isDisabled = disabled || isLoading || isUploading || !conversationId;
    const canSend = (message.trim() || attachments.length > 0) && !isDisabled;

    return (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {/* Reply indicator */}
        {replyTo && (
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Respondiendo a {replyTo.senderName || 'mensaje'}
                </div>
                <div className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 p-2 rounded border-l-4 border-green-500">
                  {replyTo.content.length > 100 
                    ? `${replyTo.content.substring(0, 100)}...` 
                    : replyTo.content
                  }
                </div>
              </div>
              <button
                onClick={onCancelReply}
                className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                title="Cancelar respuesta"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
  
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg"
                >
                  {IMAGE_FILE_TYPES.includes(file.type) ? (
                    <Image className="w-4 h-4 text-green-500" />
                  ) : (
                    <File className="w-4 h-4 text-blue-500" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-32">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({(file.size / 1024 / 1024).toFixed(1)}MB)
                  </span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                    title="Eliminar archivo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
  
        {/* Input area */}
        <div 
          className={`p-4 ${dragOver ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {dragOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-50 dark:bg-green-900/20 border-2 border-dashed border-green-500 z-10">
              <div className="text-center">
                <Paperclip className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-700 dark:text-green-400 font-medium">
                  Suelta los archivos aquí
                </p>
              </div>
            </div>
          )}
  
          <div className="flex items-end space-x-3">
            {/* File attachment button */}
            <div className="flex space-x-1">
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Adjuntar archivo"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              <button
                type="button"
                disabled={isDisabled}
                onClick={() => imageInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Adjuntar imagen"
              >
                <Image className="w-5 h-5" />
              </button>
            </div>
  
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
              multiple
              accept={allowedFileTypes.join(',')}
            />
            <input
              ref={imageInputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
              multiple
              accept={IMAGE_FILE_TYPES.join(',')}
            />
  
            {/* Message textarea */}
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isDisabled}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg resize-none focus:outline-none focus:border-green-500 dark:focus:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
            </div>
  
            {/* Emoji button (placeholder for future emoji picker) */}
            <button
              type="button"
              disabled={isDisabled}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Emojis (próximamente)"
            >
              <Smile className="w-5 h-5" />
            </button>
  
            {/* Send button */}
            <button
              onClick={handleSendMessage}
              disabled={!canSend}
              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              title="Enviar mensaje"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
  
          {/* Character count or status */}
          {message.length > 0 && (
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
              <div>
                {isTyping && <span>Escribiendo...</span>}
              </div>
              <div>
                {message.length} caracteres
              </div>
            </div>
          )}
        </div>
      </div>
    );
};