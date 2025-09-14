import { useCallback, useEffect, useState } from 'react';

interface RememberMeData {
  email: string;
  token: string;
  expiresAt: string;
  deviceId: string;
}

interface UseRememberMeConfig {
  maxAge: number; // en días
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
}

const DEFAULT_CONFIG: UseRememberMeConfig = {
  maxAge: 30, // 30 días
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict'
};

export const useRememberMe = (config: UseRememberMeConfig = DEFAULT_CONFIG) => {
  const [rememberMeData, setRememberMeData] = useState<RememberMeData | null>(null);

  // Generar ID único del dispositivo
  const generateDeviceId = useCallback((): string => {
    const existingId = localStorage.getItem('deviceId');
    if (existingId) return existingId;

    const deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('deviceId', deviceId);
    return deviceId;
  }, []);

  // Cargar datos de "Remember Me" al inicializar
  useEffect(() => {
    const loadRememberMeData = () => {
      try {
        const stored = localStorage.getItem('rememberMe');
        if (!stored) return;

        const data: RememberMeData = JSON.parse(stored);
        
        // Verificar si el token no ha expirado
        if (new Date(data.expiresAt) > new Date()) {
          setRememberMeData(data);
        } else {
          // Token expirado, limpiar
          localStorage.removeItem('rememberMe');
        }
      } catch (error) {
        console.error('Error loading remember me data:', error);
        localStorage.removeItem('rememberMe');
      }
    };

    loadRememberMeData();
  }, []);

  // Guardar datos de "Remember Me"
  const saveRememberMe = useCallback((email: string, token: string) => {
    const deviceId = generateDeviceId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.maxAge);

    const data: RememberMeData = {
      email,
      token,
      expiresAt: expiresAt.toISOString(),
      deviceId
    };

    setRememberMeData(data);
    localStorage.setItem('rememberMe', JSON.stringify(data));
  }, [config.maxAge, generateDeviceId]);

  // Limpiar datos de "Remember Me"
  const clearRememberMe = useCallback(() => {
    setRememberMeData(null);
    localStorage.removeItem('rememberMe');
  }, []);

  // Verificar si hay datos válidos de "Remember Me"
  const hasValidRememberMe = useCallback((): boolean => {
    if (!rememberMeData) return false;
    return new Date(rememberMeData.expiresAt) > new Date();
  }, [rememberMeData]);

  // Obtener email recordado
  const getRememberedEmail = useCallback((): string | null => {
    if (!hasValidRememberMe()) return null;
    return rememberMeData?.email || null;
  }, [rememberMeData, hasValidRememberMe]);

  // Obtener token recordado
  const getRememberedToken = useCallback((): string | null => {
    if (!hasValidRememberMe()) return null;
    return rememberMeData?.token || null;
  }, [rememberMeData, hasValidRememberMe]);

  // Verificar si el dispositivo actual coincide
  const isCurrentDevice = useCallback((): boolean => {
    if (!rememberMeData) return false;
    const currentDeviceId = generateDeviceId();
    return rememberMeData.deviceId === currentDeviceId;
  }, [rememberMeData, generateDeviceId]);

  // Obtener tiempo restante hasta expiración
  const getTimeUntilExpiration = useCallback((): number => {
    if (!rememberMeData) return 0;
    const now = new Date();
    const expiresAt = new Date(rememberMeData.expiresAt);
    return Math.max(0, expiresAt.getTime() - now.getTime());
  }, [rememberMeData]);

  // Renovar token de "Remember Me"
  const renewRememberMe = useCallback((newToken: string) => {
    if (!rememberMeData) return;
    
    const deviceId = generateDeviceId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.maxAge);

    const data: RememberMeData = {
      ...rememberMeData,
      token: newToken,
      expiresAt: expiresAt.toISOString(),
      deviceId
    };

    setRememberMeData(data);
    localStorage.setItem('rememberMe', JSON.stringify(data));
  }, [rememberMeData, config.maxAge, generateDeviceId]);

  // Limpiar datos expirados
  const cleanExpiredData = useCallback(() => {
    if (rememberMeData && !hasValidRememberMe()) {
      clearRememberMe();
    }
  }, [rememberMeData, hasValidRememberMe, clearRememberMe]);

  // Auto-limpiar datos expirados cada 5 minutos
  useEffect(() => {
    const interval = setInterval(cleanExpiredData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [cleanExpiredData]);

  return {
    saveRememberMe,
    clearRememberMe,
    hasValidRememberMe,
    getRememberedEmail,
    getRememberedToken,
    isCurrentDevice,
    getTimeUntilExpiration,
    renewRememberMe,
    cleanExpiredData
  };
};
