'use client';

import { useAuth } from '@/hooks/useAuth';
import { LogOut, MessageSquare, MoreVertical, Settings, User, Users } from 'lucide-react';
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

  const navigateToChat = () => {
    router.push('/dashboard');
    setShowMenu(false);
  };  

  return (
    <div className="bg-gray-100 border-b border-gray-300 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-800">Panel de Ventas</h1>
        
        {/* Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={navigateToChat}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </button>
          
          {(hasPermission('supervisor') || hasPermission('admin')) && (
            <button
              onClick={navigateToUsers}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Usuarios</span>
            </button>
          )}
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <User className="w-5 h-5" />
            <span>{user}</span>
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
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              {/* Mobile Navigation */}
              <div className="md:hidden border-b border-gray-100">
                <button
                  onClick={navigateToChat}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-gray-700 transition-colors rounded-t-lg"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat</span>
                </button>
                
                {(hasPermission('supervisor') || hasPermission('admin')) && (
                  <button
                    onClick={navigateToUsers}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-gray-700 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span>Usuarios</span>
                  </button>
                )}
              </div>

              {/* Menu Options */}
              <button 
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-gray-700 transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <Settings className="w-4 h-4" />
                <span>Configuración</span>
              </button>
              
              <hr className="border-gray-100" />
              
              <button 
                className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center space-x-2 text-red-600 transition-colors rounded-b-lg"
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