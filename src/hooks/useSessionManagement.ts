import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';

interface SessionConfig {
  timeoutMinutes: number;
  warningMinutes: number;
  refreshThresholdMinutes: number;
  checkIntervalSeconds: number;
}

interface SessionActivity {
  lastActivity: Date;
  isActive: boolean;
  warningShown: boolean;
  timeUntilTimeout: number;
  timeUntilWarning: number;
}

const DEFAULT_CONFIG: SessionConfig = {
  timeoutMinutes: 30, // 30 minutos de inactividad
  warningMinutes: 5, // Mostrar advertencia 5 minutos antes
  refreshThresholdMinutes: 5, // Refrescar token 5 minutos antes del timeout
  checkIntervalSeconds: 30 // Verificar cada 30 segundos
};

export const useSessionManagement = (config: SessionConfig = DEFAULT_CONFIG) => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  
  const [sessionActivity, setSessionActivity] = useState<SessionActivity>({
    lastActivity: new Date(),
    isActive: true,
    warningShown: false,
    timeUntilTimeout: config.timeoutMinutes * 60,
    timeUntilWarning: (config.timeoutMinutes - config.warningMinutes) * 60
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Actualizar actividad del usuario
  const updateActivity = useCallback(() => {
    const now = new Date();
    setSessionActivity(prev => ({
      ...prev,
      lastActivity: now,
      isActive: true,
      warningShown: false
    }));

    // Limpiar timeouts existentes
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Programar advertencia
    warningTimeoutRef.current = setTimeout(() => {
      setSessionActivity(prev => ({
        ...prev,
        warningShown: true
      }));
    }, (config.timeoutMinutes - config.warningMinutes) * 60 * 1000);

    // Programar refresh del token
    refreshTimeoutRef.current = setTimeout(() => {
      refreshToken();
    }, (config.timeoutMinutes - config.refreshThresholdMinutes) * 60 * 1000);
  }, [config]);

  // Refrescar token
  const refreshToken = useCallback(async () => {
    try {
      // Simular refresh del token
      console.log('Refrescando token...');
      
      // Aquí iría la lógica real de refresh del token
      // const newToken = await authService.refreshToken();
      
      setSessionActivity(prev => ({
        ...prev,
        lastActivity: new Date(),
        isActive: true,
        warningShown: false
      }));
    } catch (error) {
      console.error('Error refreshing token:', error);
      handleSessionTimeout();
    }
  }, []);

  // Manejar timeout de sesión
  const handleSessionTimeout = useCallback(() => {
    setSessionActivity(prev => ({
      ...prev,
      isActive: false
    }));

    // Limpiar timeouts
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Cerrar sesión y redirigir
    logout();
    router.push('/login?reason=session_timeout');
  }, [logout, router]);

  // Extender sesión
  const extendSession = useCallback(() => {
    updateActivity();
  }, [updateActivity]);

  // Cerrar sesión manualmente
  const endSession = useCallback(() => {
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    logout();
  }, [logout]);

  // Verificar si la sesión está próxima a expirar
  const isSessionExpiring = useCallback((): boolean => {
    const now = new Date();
    const timeSinceLastActivity = (now.getTime() - sessionActivity.lastActivity.getTime()) / 1000 / 60;
    return timeSinceLastActivity >= (config.timeoutMinutes - config.warningMinutes);
  }, [sessionActivity.lastActivity, config]);

  // Obtener tiempo restante hasta timeout
  const getTimeUntilTimeout = useCallback((): number => {
    const now = new Date();
    const timeSinceLastActivity = (now.getTime() - sessionActivity.lastActivity.getTime()) / 1000 / 60;
    return Math.max(0, config.timeoutMinutes - timeSinceLastActivity);
  }, [sessionActivity.lastActivity, config]);

  // Formatear tiempo restante
  const formatTimeRemaining = useCallback((minutes: number): string => {
    if (minutes <= 0) return '0:00';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.floor(minutes % 60);
    
    if (hours > 0) {
      return `${hours}:${remainingMinutes.toString().padStart(2, '0')}`;
    }
    return `${remainingMinutes}:00`;
  }, []);

  // Detectar actividad del usuario
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleUserActivity = () => {
      updateActivity();
    };

    // Eventos que indican actividad del usuario
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Agregar listeners
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [isAuthenticated, updateActivity]);

  // Verificar sesión periódicamente
  useEffect(() => {
    if (!isAuthenticated) return;

    intervalRef.current = setInterval(() => {
      const timeRemaining = getTimeUntilTimeout();
      
      setSessionActivity(prev => ({
        ...prev,
        timeUntilTimeout: timeRemaining * 60, // en segundos
        timeUntilWarning: Math.max(0, (timeRemaining - config.warningMinutes) * 60)
      }));

      // Si el tiempo se agotó, cerrar sesión
      if (timeRemaining <= 0) {
        handleSessionTimeout();
      }
    }, config.checkIntervalSeconds * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, getTimeUntilTimeout, config, handleSessionTimeout]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    sessionActivity,
    isSessionExpiring: isSessionExpiring(),
    timeUntilTimeout: getTimeUntilTimeout(),
    formatTimeRemaining,
    extendSession,
    endSession,
    refreshToken
  };
};
