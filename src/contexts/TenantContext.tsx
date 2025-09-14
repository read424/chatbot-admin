'use client';

import type { TenantContext } from '@/types/connections';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface TenantContextState extends TenantContext {
    setTenantId: (tenantId: string) => void;
}

const TenantContext = createContext<TenantContextState | undefined>(undefined);

interface TenantProviderProps {
    children: React.ReactNode;
    defaultTenantId?: string;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ 
    children, 
    defaultTenantId = '1'
}) => {
    const [tenantId, setTenantId] = useState<string>(defaultTenantId);

    // Persistir el tenant en localStorage (opcional)
    useEffect(() => {
        const storedTenantId = localStorage.getItem('tenantId');
        if (storedTenantId) {
            setTenantId(storedTenantId);
        }
    }, []);

    const handleSetTenantId = (newTenantId: string) => {
        setTenantId(newTenantId);
        localStorage.setItem('tenantId', newTenantId);
    };

    return (
        <TenantContext.Provider value={{ 
            tenantId, 
            setTenantId: handleSetTenantId 
        }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = (): TenantContextState => {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
};