'use client';

import { useAuth } from '@/hooks/useAuth';
import {
    Bell,
    Building2,
    Link,
    LogOut,
    MessageSquare,
    MoreVertical,
    Settings,
    User,
    Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { ThemeToggle } from '../ui/ThemeToggle';

interface HeaderProps {
  user?: string | null;
  notifications?: Array<{
    id: string;
    message: string;
    time: string;
    isRead: boolean;
  }>;
  unreadNotificationCount?: number;
  connectionStatus?: 'connected' | 'disconnected' | 'connecting';
  onNotificationClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  user,
  notifications = [],
  unreadNotificationCount = 0,
  connectionStatus = 'disconnected',
  onNotificationClick
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { logout, hasPermission, mounted } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        setShowMenu(false);
    };

    const navigateToUsers = () => {
        router.push('/dashboard/users');
        setShowMenu(false);
    };

    const navigateToDepartments = () => {
        router.push('/dashboard/departments');
        setShowMenu(false);
    };    

    const navigateToConnections = () => {
        router.push('/dashboard/connections');
        setShowMenu(false);
    };

    const navigateToChat = () => {
        router.push('/dashboard');
        setShowMenu(false);
    };

    const handleNotificationClick = () => {
        setShowNotifications(!showNotifications);
        onNotificationClick?.();
    };

    const getConnectionStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return 'text-green-600 dark:text-green-400';
            case 'connecting': return 'text-yellow-600 dark:text-yellow-400';
            case 'disconnected': return 'text-red-600 dark:text-red-400';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };

    const getConnectionStatusText = () => {
        switch (connectionStatus) {
            case 'connected': return 'Conectado';
            case 'connecting': return 'Conectando...';
            case 'disconnected': return 'Desconectado';
            default: return 'Sin estado';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between transition-colors duration-200">
            <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Panel de Ventas</h1>
                
                {/* Connection Status */}
                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                        connectionStatus === 'connected' ? 'bg-green-500' :
                        connectionStatus === 'connecting' ? 'bg-yellow-500' :
                        'bg-red-500'
                    }`}></div>
                    <span className={`text-sm ${getConnectionStatusColor()}`}>
                        {getConnectionStatusText()}
                    </span>
                </div>
                
                {/* Navigation Links - Desktop */}
                <nav className="hidden md:flex items-center space-x-1">
                    <button
                        onClick={navigateToChat}
                        className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat</span>
                    </button>
                    
                    {(mounted && (hasPermission('supervisor') || hasPermission('admin'))) && (
                        <>
                            <button
                                onClick={navigateToUsers}
                                className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                            >
                                <Users className="w-4 h-4" />
                                <span>Usuarios</span>
                            </button>

                            <button
                                onClick={navigateToConnections}
                                className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                            >
                                <Link className="w-4 h-4" />
                                <span>Conexiones</span>
                            </button>                            
                        </>
                    )}
                </nav>
            </div>

            <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={handleNotificationClick}
                        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                        title="Notificaciones"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadNotificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                                {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                            </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <>
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setShowNotifications(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-20 max-h-96 overflow-y-auto">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Notificaciones
                                    </h3>
                                </div>
                                
                                {notifications.length > 0 ? (
                                    <div className="divide-y divide-gray-200 dark:divide-gray-600">
                                        {notifications.map((notification) => (
                                            <div 
                                                key={notification.id}
                                                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                                                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                                }`}
                                            >
                                                <p className="text-sm text-gray-900 dark:text-white">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {notification.time}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                        No hay notificaciones
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <ThemeToggle />
                
                {/* User Menu */}
                <div className="relative">
                    <button 
                        onClick={() => setShowMenu(!showMenu)}
                        className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
                    >
                        <User className="w-5 h-5" />
                        <span className="text-gray-800 dark:text-white">
                            {user || 'Usuario'}
                        </span>
                        <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {showMenu && (
                        <>
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setShowMenu(false)}
                            />
                            
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-20">
                                {(mounted && (hasPermission('supervisor') || hasPermission('admin'))) && (
                                    <>
                                        <button 
                                            onClick={navigateToUsers}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 rounded-t-lg"
                                        >
                                            <Users className="w-4 h-4" />
                                            <span>Usuarios</span>
                                        </button>

                                        <button 
                                            onClick={navigateToDepartments}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                                        >
                                            <Building2 className="w-4 h-4" />
                                            <span>Departamentos</span>
                                        </button>

                                        <button 
                                            onClick={navigateToConnections}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                                        >
                                            <Link className="w-4 h-4" />
                                            <span>Conexiones</span>
                                        </button>                                        
                                        <hr className="border-gray-100 dark:border-gray-600" />
                                    </>
                                )}
                
                                <button 
                                    className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                                    onClick={() => setShowMenu(false)}
                                >
                                    <Settings className="w-4 h-4" />
                                    <span>Configuración</span>
                                </button>
                                
                                <hr className="border-gray-100 dark:border-gray-600" />
                                
                                <button 
                                    className="w-full px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200 rounded-b-lg"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};