'use client';

import { AlertTriangle, Clock, RefreshCw, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AccountLockoutWarningProps {
  isLocked: boolean;
  attemptsRemaining: number;
  lockoutTimeRemaining: number;
  onRefresh?: () => void;
  className?: string;
}

export const AccountLockoutWarning: React.FC<AccountLockoutWarningProps> = ({
  isLocked,
  attemptsRemaining,
  lockoutTimeRemaining,
  onRefresh,
  className = ''
}) => {
  const [timeRemaining, setTimeRemaining] = useState(lockoutTimeRemaining);

  // Actualizar tiempo restante cada minuto
  useEffect(() => {
    if (!isLocked || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // cada minuto

    return () => clearInterval(interval);
  }, [isLocked, timeRemaining]);

  // Formatear tiempo restante
  const formatTimeRemaining = (minutes: number): string => {
    if (minutes <= 0) return '0 minutos';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes} minutos`;
  };

  if (!isLocked && attemptsRemaining >= 3) {
    return null; // No mostrar nada si no hay problemas
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Advertencia de intentos restantes */}
      {!isLocked && attemptsRemaining < 3 && attemptsRemaining > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-amber-800 mb-1">
                Advertencia de Seguridad
              </h4>
              <p className="text-sm text-amber-700 mb-2">
                Te quedan <strong>{attemptsRemaining}</strong> intentos antes de que tu cuenta se bloquee por seguridad.
              </p>
              <div className="flex items-center space-x-2 text-xs text-amber-600">
                <Shield className="w-4 h-4" />
                <span>Por tu seguridad, la cuenta se bloqueará temporalmente después de varios intentos fallidos.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cuenta bloqueada */}
      {isLocked && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 mb-1">
                Cuenta Temporalmente Bloqueada
              </h4>
              <p className="text-sm text-red-700 mb-3">
                Tu cuenta ha sido bloqueada por seguridad debido a múltiples intentos de inicio de sesión fallidos.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-red-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    Tiempo restante: <strong>{formatTimeRemaining(timeRemaining)}</strong>
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-red-600">
                  <Shield className="w-4 h-4" />
                  <span>
                    La cuenta se desbloqueará automáticamente después del tiempo de espera.
                  </span>
                </div>
              </div>

              {/* Botón de actualización */}
              {onRefresh && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <button
                    onClick={onRefresh}
                    className="inline-flex items-center space-x-2 text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Actualizar estado</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Información de seguridad */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">¿Problemas para acceder?</p>
            <ul className="space-y-1 text-xs">
              <li>• Verifica que tu email y contraseña sean correctos</li>
              <li>• Asegúrate de que las mayúsculas y minúsculas estén bien escritas</li>
              <li>• Si olvidaste tu contraseña, contacta al administrador</li>
              <li>• Espera el tiempo indicado antes de intentar nuevamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
