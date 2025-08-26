'use client';

import { useAuth } from '@/hooks/useAuth';
import { Building2, Link, LogOut, MessageSquare, MoreVertical, Settings, User, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { ThemeToggle } from '../ui/ThemeToggle';


interface HeaderProps {
  user: string;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
    const [showMenu, setShowMenu] = useState(false);
    const { logout, hasPermission } = useAuth();
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

    return (
        <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 p-4 flex items-center justify-between transition-colors duration-200">
            <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Panel de Ventas</h1>
                
                {/* Navigation Links - Desktop */}
                <nav className="hidden md:flex items-center space-x-1">
                    <button
                        onClick={navigateToChat}
                        className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat</span>
                    </button>
                    
                    {(hasPermission('supervisor') || hasPermission('admin')) && (
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
                <ThemeToggle />
                <div className="relative">
                    <button 
                        onClick={() => setShowMenu(!showMenu)}
                        className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
                    >
                        <User className="w-5 h-5" />
                        <span className="text-gray-800 dark:text-white">{user}</span>
                        <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {showMenu && (
                        <>
                            {/* Overlay para cerrar el menú */}
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setShowMenu(false)}
                            />
                            
                            {/* Menú dropdown */}
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-20">
                                
                                {/* Mobile Navigation */}
                                <div className="md:hidden border-b border-gray-100 dark:border-gray-600">
                                    <button
                                        onClick={navigateToChat}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 rounded-t-lg"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        <span>Chat</span>
                                    </button>
                                
                                {(hasPermission('supervisor') || hasPermission('admin')) && (
                                    <>
                                        <button
                                            onClick={navigateToUsers}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                                        >
                                            <Users className="w-4 h-4" />
                                            <span>Usuarios</span>
                                        </button>

                                        <button
                                            onClick={navigateToConnections}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                                        >
                                            <Link className="w-4 h-4" />
                                            <span>Conexiones</span>
                                        </button>
                                    </>
                                )}
                                </div>

                                 {/* Menu Options del usuario */}
                                {(hasPermission('supervisor') || hasPermission('admin')) && (
                                    <>
                                        <button 
                                            onClick={navigateToUsers}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
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