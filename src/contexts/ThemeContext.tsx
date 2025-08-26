'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const initializeTheme = () => {
            // Solo ejecutar en el cliente
            if (typeof window === 'undefined') return;
            
            try {
                // Verificar si hay una preferencia guardada en localStorage
                const savedTheme = localStorage.getItem('theme') as Theme;

                if (savedTheme === 'dark' || savedTheme === 'light') {
                    setTheme(savedTheme);
                } else {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    const systemTheme = prefersDark ? 'dark' : 'light';
                    setTheme(systemTheme);
                    localStorage.setItem('theme', systemTheme);
                }
            } catch (error) {
                console.error('Error accessing localStorage:', error);
                setTheme('light');
            }
        };

        initializeTheme();
    }, []);

    useEffect(() => {
        if (!mounted || typeof window === 'undefined') return;

        try {
            // Aplicar el tema al documento
            const root = window.document.documentElement;

            if (theme === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
            // Guardar la preferencia en localStorage
            localStorage.setItem('theme', theme);

        } catch (error) {
            console.error('Error applying theme:', error);
        }
    }, [theme, mounted]);

    const toggleTheme = () => {
        console.log('Toggling theme from:', theme); // Debug log
        setTheme(prev => {
            const newTheme = prev === 'light' ? 'dark' : 'light';
            console.log('New theme will be:', newTheme); // Debug log
            return newTheme;
        });
    };

    // Prevenir el flash of unstyled content durante la hidratación
    if (!mounted) {
        return <>{children}</>;
    }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};