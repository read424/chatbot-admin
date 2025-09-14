'use client';

import { AlertTriangle, Clock, LogOut, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SessionWarningProps {
  isVisible: boolean;
  timeRemaining: number;
  onExtend: () => void;
  onLogout: () => void;
  formatTime: (minutes: number) => string;
  className?: string;
}

export const SessionWarning: React.FC<SessionWarningProps> = ({
  isVisible,
  timeRemaining,
  onExtend,
  onLogout,
  formatTime,
  className = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const isCritical = timeRemaining <= 2; // Menos de 2 minutos

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* Modal */}
      <div className={`relative bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all duration-300 ${
        isAnimating ? 'scale-105 opacity-100' : 'scale-100 opacity-100'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 rounded-t-lg ${
          isCritical ? 'bg-red-600' : 'bg-amber-600'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              isCritical ? 'bg-red-700' : 'bg-amber-700'
            }`}>
              {isCritical ? (
                <AlertTriangle className="w-6 h-6 text-white" />
              ) : (
                <Clock className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {isCritical ? 'Sesión Próxima a Expirar' : 'Advertencia de Sesión'}
              </h3>
              <p className="text-sm text-red-100">
                {isCritical ? 'Tu sesión expirará muy pronto' : 'Tu sesión está próxima a expirar'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="text-center mb-6">
            <div className={`text-4xl font-bold mb-2 ${
              isCritical ? 'text-red-600' : 'text-amber-600'
            }`}>
              {formatTime(timeRemaining)}
            </div>
            <p className="text-gray-600">
              {isCritical 
                ? 'Tu sesión expirará en breve. Guarda tu trabajo y extiende la sesión.'
                : 'Tu sesión expirará por inactividad. ¿Deseas extenderla?'
              }
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${
                  isCritical ? 'bg-red-500' : 'bg-amber-500'
                }`}
                style={{ 
                  width: `${Math.max(0, Math.min(100, (timeRemaining / 5) * 100))}%` 
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0:00</span>
              <span>5:00</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onExtend}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                isCritical
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Extender Sesión</span>
            </button>
            
            <button
              onClick={onLogout}
              className="flex-1 py-3 px-4 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              La sesión se extiende automáticamente con la actividad del usuario
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
