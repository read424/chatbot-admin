import { useCallback, useEffect, useState } from 'react';

interface LoginAttempt {
  email: string;
  attempts: number;
  lastAttempt: Date;
  isLocked: boolean;
  lockUntil?: Date;
}

interface UseLoginAttemptsConfig {
  maxAttempts: number;
  lockoutDuration: number; // en minutos
  resetAttemptsAfter: number; // en minutos
}

const DEFAULT_CONFIG: UseLoginAttemptsConfig = {
  maxAttempts: 5,
  lockoutDuration: 15, // 15 minutos
  resetAttemptsAfter: 30 // 30 minutos
};

export const useLoginAttempts = (config: UseLoginAttemptsConfig = DEFAULT_CONFIG) => {
  const [attempts, setAttempts] = useState<Map<string, LoginAttempt>>(new Map());

  // Cargar intentos desde localStorage al inicializar
  useEffect(() => {
    const savedAttempts = localStorage.getItem('loginAttempts');
    if (savedAttempts) {
      try {
        const parsed = JSON.parse(savedAttempts);
        const attemptsMap = new Map();
        
        Object.entries(parsed).forEach(([email, attempt]: [string, any]) => {
          attemptsMap.set(email, {
            ...attempt,
            lastAttempt: new Date(attempt.lastAttempt),
            lockUntil: attempt.lockUntil ? new Date(attempt.lockUntil) : undefined
          });
        });
        
        setAttempts(attemptsMap);
      } catch (error) {
        console.error('Error loading login attempts:', error);
        localStorage.removeItem('loginAttempts');
      }
    }
  }, []);

  // Guardar intentos en localStorage
  const saveAttempts = useCallback((newAttempts: Map<string, LoginAttempt>) => {
    const serializable = Object.fromEntries(
      Array.from(newAttempts.entries()).map(([email, attempt]) => [
        email,
        {
          ...attempt,
          lastAttempt: attempt.lastAttempt.toISOString(),
          lockUntil: attempt.lockUntil?.toISOString()
        }
      ])
    );
    
    localStorage.setItem('loginAttempts', JSON.stringify(serializable));
  }, []);

  // Verificar si una cuenta está bloqueada
  const isAccountLocked = useCallback((email: string): boolean => {
    const attempt = attempts.get(email.toLowerCase());
    if (!attempt) return false;

    // Si no está bloqueada, retornar false
    if (!attempt.isLocked) return false;

    // Si está bloqueada, verificar si ya pasó el tiempo de bloqueo
    if (attempt.lockUntil && new Date() > attempt.lockUntil) {
      // Desbloquear la cuenta
      const newAttempts = new Map(attempts);
      newAttempts.set(email.toLowerCase(), {
        ...attempt,
        isLocked: false,
        lockUntil: undefined,
        attempts: 0
      });
      setAttempts(newAttempts);
      saveAttempts(newAttempts);
      return false;
    }

    return true;
  }, [attempts, saveAttempts]);

  // Obtener tiempo restante de bloqueo
  const getLockoutTimeRemaining = useCallback((email: string): number => {
    const attempt = attempts.get(email.toLowerCase());
    if (!attempt || !attempt.isLocked || !attempt.lockUntil) return 0;

    const remaining = Math.max(0, attempt.lockUntil.getTime() - new Date().getTime());
    return Math.ceil(remaining / 1000 / 60); // en minutos
  }, [attempts]);

  // Registrar un intento de login fallido
  const recordFailedAttempt = useCallback((email: string) => {
    const normalizedEmail = email.toLowerCase();
    const now = new Date();
    const existingAttempt = attempts.get(normalizedEmail);

    let newAttempt: LoginAttempt;

    if (existingAttempt) {
      const timeSinceLastAttempt = now.getTime() - existingAttempt.lastAttempt.getTime();
      const resetTime = config.resetAttemptsAfter * 60 * 1000; // convertir a ms

      // Si han pasado más de resetTime minutos, resetear intentos
      if (timeSinceLastAttempt > resetTime) {
        newAttempt = {
          email: normalizedEmail,
          attempts: 1,
          lastAttempt: now,
          isLocked: false
        };
      } else {
        const newAttemptCount = existingAttempt.attempts + 1;
        const shouldLock = newAttemptCount >= config.maxAttempts;
        
        newAttempt = {
          email: normalizedEmail,
          attempts: newAttemptCount,
          lastAttempt: now,
          isLocked: shouldLock,
          lockUntil: shouldLock ? new Date(now.getTime() + config.lockoutDuration * 60 * 1000) : undefined
        };
      }
    } else {
      newAttempt = {
        email: normalizedEmail,
        attempts: 1,
        lastAttempt: now,
        isLocked: false
      };
    }

    const newAttempts = new Map(attempts);
    newAttempts.set(normalizedEmail, newAttempt);
    setAttempts(newAttempts);
    saveAttempts(newAttempts);

    return {
      isLocked: newAttempt.isLocked,
      attemptsRemaining: config.maxAttempts - newAttempt.attempts,
      lockoutTimeRemaining: newAttempt.lockUntil ? 
        Math.ceil((newAttempt.lockUntil.getTime() - now.getTime()) / 1000 / 60) : 0
    };
  }, [attempts, config, saveAttempts]);

  // Limpiar intentos exitosos
  const clearAttempts = useCallback((email: string) => {
    const normalizedEmail = email.toLowerCase();
    const newAttempts = new Map(attempts);
    newAttempts.delete(normalizedEmail);
    setAttempts(newAttempts);
    saveAttempts(newAttempts);
  }, [attempts, saveAttempts]);

  // Obtener información de intentos para un email
  const getAttemptInfo = useCallback((email: string) => {
    const attempt = attempts.get(email.toLowerCase());
    if (!attempt) {
      return {
        attempts: 0,
        isLocked: false,
        attemptsRemaining: config.maxAttempts,
        lockoutTimeRemaining: 0
      };
    }

    return {
      attempts: attempt.attempts,
      isLocked: isAccountLocked(email),
      attemptsRemaining: Math.max(0, config.maxAttempts - attempt.attempts),
      lockoutTimeRemaining: getLockoutTimeRemaining(email)
    };
  }, [attempts, config.maxAttempts, isAccountLocked, getLockoutTimeRemaining]);

  // Limpiar todos los intentos (para testing o administración)
  const clearAllAttempts = useCallback(() => {
    setAttempts(new Map());
    localStorage.removeItem('loginAttempts');
  }, []);

  return {
    isAccountLocked,
    getLockoutTimeRemaining,
    recordFailedAttempt,
    clearAttempts,
    getAttemptInfo,
    clearAllAttempts
  };
};
