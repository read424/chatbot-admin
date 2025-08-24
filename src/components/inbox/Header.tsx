'use client';

import { LogOut, MoreVertical, Settings, User } from 'lucide-react';
import React, { useState } from 'react';

interface HeaderProps {
  user: string;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <div className="bg-gray-100 border-b border-gray-300 p-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-800">Panel de Ventas</h1>
      <div className="relative">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <User className="w-5 h-5" />
          <span>{user}</span>
          <MoreVertical className="w-4 h-4" />
        </button>
        
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
            <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Configuración</span>
            </button>
            <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-red-600">
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};