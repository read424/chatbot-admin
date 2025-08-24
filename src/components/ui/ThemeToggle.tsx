'use client';

import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  const handleToggle = () => {
    setIsDark(!isDark);
    // Aquí irá la funcionalidad más tarde
  };

  return (
    <button
      onClick={handleToggle}
      className="relative flex items-center w-12 h-6 bg-gray-300 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      aria-label="Toggle theme"
    >
      {/* Switch toggle */}
      <div
        className={`absolute w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 flex items-center justify-center ${
          isDark ? 'translate-x-6' : 'translate-x-0.5'
        }`}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-gray-600" />
        ) : (
          <Sun className="w-3 h-3 text-yellow-500" />
        )}
      </div>
    </button>
  );
};
