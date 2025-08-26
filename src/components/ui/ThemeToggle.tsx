'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Solo ejecutar en el cliente
    useEffect(() => {
        setMounted(true);
        
        // Verificar que estamos en el cliente
        if (typeof window === 'undefined') return;
        
        try {
            // Leer tema inicial
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initialDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
            
            setIsDark(initialDark);
            
            // Aplicar tema inicial
            if (initialDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        } catch (error) {
            console.error('Error initializing theme:', error);
            // Fallback a tema claro
            setIsDark(false);
        }
    }, []);

    const toggleTheme = () => {
        if (typeof window === 'undefined') return;
        
        const newTheme = !isDark;
        setIsDark(newTheme);
        
        try {
            // Aplicar al DOM
            if (newTheme) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
            
            console.log('Theme changed to:', newTheme ? 'dark' : 'light');
        } catch (error) {
            console.error('Error toggling theme:', error);
        }
    };

    // Evitar flash durante hidratación
    if (!mounted) {
        return (
            <div className="relative flex items-center w-12 h-6 bg-gray-300 rounded-full">
                <div className="absolute w-5 h-5 bg-white rounded-full shadow-md transform translate-x-0.5 flex items-center justify-center">
                    <Sun className="w-3 h-3 text-yellow-500" />
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className={`relative flex items-center w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                isDark ? 'bg-gray-700' : 'bg-gray-300'
            }`}
            aria-label="Toggle theme"
        >
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