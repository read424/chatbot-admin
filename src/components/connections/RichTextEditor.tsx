'use client';

import { Bold, Italic, Paperclip, Smile, Underline, Variable } from 'lucide-react';
import { useRef, useState } from 'react';

interface RichTextEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onVariableClick?: () => void;
  hasError?: boolean;
}

const emojiList = ['😊', '😃', '👍', '👋', '❤️', '🔥', '💰', '✅', '⚡', '🎉', '💯', '🚀'];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  id,
  value,
  onChange,
  placeholder,
  onFocus,
  onVariableClick,
  hasError = false
}) => {
  const [showEmojis, setShowEmojis] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyFormat = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.slice(start, end);
    
    let formattedText = selectedText;
    let newCursorPos = end;

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        newCursorPos = selectedText ? end + 4 : start + 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        newCursorPos = selectedText ? end + 2 : start + 1;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        newCursorPos = selectedText ? end + 4 : start + 2;
        break;
    }

    const newValue = value.slice(0, start) + formattedText + value.slice(end);
    onChange(newValue);

    setTimeout(() => {
        textarea.focus();
        if (!selectedText) {
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
    }, 0);
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.slice(0, start) + emoji + value.slice(end);

        onChange(newValue);
        setShowEmojis(false);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + emoji.length, start + emoji.length);
        }, 0);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Simular inserción de archivo como placeholder
        const fileText = `[📎 ${file.name}]`;
        const textarea = textareaRef.current;

        if (textarea) {
            const start = textarea.selectionStart;
            const newValue = value.slice(0, start) + fileText + value.slice(start);
            onChange(newValue);

            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + fileText.length, start + fileText.length);
            }, 0);
        }

        setShowFileUpload(false);
        // Reset file input
        e.target.value = '';
    };

  return (
    <div className={`relative border rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 ${
      hasError 
        ? 'border-red-500 dark:border-red-400' 
        : 'border-gray-300 dark:border-gray-600'
    }`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-t-md">
        <div className="flex items-center space-x-1">
          {/* Format buttons */}
          <button
            type="button"
            onClick={() => applyFormat('bold')}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Negrita"
          >
            <Bold className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => applyFormat('italic')}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Cursiva"
          >
            <Italic className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => applyFormat('underline')}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Subrayado"
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Emoji button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojis(!showEmojis)}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Emojis"
            >
              <Smile className="w-4 h-4" />
            </button>

            {/* Emoji picker */}
            {showEmojis && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowEmojis(false)}
                />
                <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-xl z-40 min-w-[200px]">
                  <div className="grid grid-cols-6 gap-1">
                    {emojiList.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg w-8 h-8 flex items-center justify-center"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* File upload button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Adjuntar archivo"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx,.txt"
            />
          </div>
        </div>

        {/* Variables button */}
        <button
          type="button"
          onClick={onVariableClick}
          className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
          title="Variables disponibles"
        >
          <Variable className="w-3 h-3" />
          <span>Variables</span>
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        rows={4}
        className="w-full p-3 border-0 focus:outline-none resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-b-md"
      />
    </div>
  );
};