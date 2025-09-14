'use client';

import { useChatStore } from '@/stores/chatStore';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import React from 'react';

interface ConnectionStatusProps {
  className?: string;
  showText?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  className = '',
  showText = true
}) => {
  const { connectionStatus, onlineUsers } = useChatStore();

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: Wifi,
          text: 'Conectado',
          color: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800'
        };
      case 'connecting':
        return {
          icon: Loader2,
          text: 'Conectando...',
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          animate: true
        };
      case 'disconnected':
      default:
        return {
          icon: WifiOff,
          text: 'Desconectado',
          color: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}>
      <Icon 
        className={`w-4 h-4 ${config.color} ${config.animate ? 'animate-spin' : ''}`} 
      />
      {showText && (
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${config.color}`}>
            {config.text}
          </span>
          {connectionStatus === 'connected' && onlineUsers.length > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({onlineUsers.length} en línea)
            </span>
          )}
        </div>
      )}
    </div>
  );
};