'use client';

import { AlertCircle, CheckCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SessionStatusProps {
  isActive: boolean;
  timeRemaining: number;
  lastActivity: Date;
  formatTime: (minutes: number) => string;
  className?: string;
}

export const SessionStatus: React.FC<SessionStatusProps> = ({
  isActive,
  timeRemaining,
  lastActivity,
  formatTime,
  className = ''
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [timeSinceLastActivity, setTimeSinceLastActivity] = useState(0);

  // Verificar estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Actualizar tiempo desde última actividad
  useEffect(() => {
    const updateTimeSinceLastActivity = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - lastActivity.getTime()) / 1000 / 60);
      setTimeSinceLastActivity(diff);
    };

    updateTimeSinceLastActivity();
    const interval = setInterval(updateTimeSinceLastActivity, 60000); // cada minuto

    return () => clearInterval(interval);
  }, [lastActivity]);

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-600';
    if (!isActive) return 'text-red-600';
    if (timeRemaining <= 5) return 'text-amber-600';
    if (timeRemaining <= 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    if (!isActive) return <AlertCircle className="w-4 h-4" />;
    if (timeRemaining <= 5) return <AlertCircle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Sin conexión';
    if (!isActive) return 'Sesión inactiva';
    if (timeRemaining <= 5) return 'Sesión expirando';
    if (timeRemaining <= 10) return 'Sesión próxima a expirar';
    return 'Sesión activa';
  };

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      {/* Icono de estado */}
      <div className={`${getStatusColor()}`}>
        {getStatusIcon()}
      </div>

      {/* Estado de conexión */}
      <div className="flex items-center space-x-1">
        {isOnline ? (
          <Wifi className="w-3 h-3 text-green-500" />
        ) : (
          <WifiOff className="w-3 h-3 text-red-500" />
        )}
        <span className="text-xs text-gray-500">
          {isOnline ? 'En línea' : 'Sin conexión'}
        </span>
      </div>

      {/* Separador */}
      <div className="w-px h-4 bg-gray-300" />

      {/* Estado de sesión */}
      <div className="flex items-center space-x-2">
        <Clock className="w-3 h-3 text-gray-400" />
        <span className={`text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Tiempo restante */}
      {isActive && (
        <>
          <div className="w-px h-4 bg-gray-300" />
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500">Expira en:</span>
            <span className={`text-xs font-mono font-medium ${getStatusColor()}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </>
      )}

      {/* Tiempo desde última actividad */}
      {timeSinceLastActivity > 0 && (
        <>
          <div className="w-px h-4 bg-gray-300" />
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500">Última actividad:</span>
            <span className="text-xs text-gray-600">
              {timeSinceLastActivity === 1 ? '1 min' : `${timeSinceLastActivity} min`}
            </span>
          </div>
        </>
      )}
    </div>
  );
};
