'use client';

import { PasswordStrength, getPasswordStrengthColor, getPasswordStrengthLabel } from '@/utils/passwordValidation';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  showRequirements?: boolean;
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  strength,
  showRequirements = true,
  className = ''
}) => {
  const { score, feedback, requirements } = strength;

  const getRequirementIcon = (isValid: boolean) => {
    if (isValid) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getRequirementText = (isValid: boolean, label: string) => {
    return (
      <span className={isValid ? 'text-green-700' : 'text-red-700'}>
        {label}
      </span>
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Indicador de fortaleza */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Fortaleza de la contraseña:
          </span>
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${getPasswordStrengthColor(score)}`}>
            {getPasswordStrengthLabel(score)}
          </span>
        </div>
        
        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              score === 0 ? 'bg-red-500' :
              score === 1 ? 'bg-red-400' :
              score === 2 ? 'bg-orange-400' :
              score === 3 ? 'bg-yellow-400' :
              'bg-green-500'
            }`}
            style={{ width: `${(score / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Requisitos de contraseña */}
      {showRequirements && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Requisitos de contraseña:
          </h4>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              {getRequirementIcon(requirements.minLength)}
              {getRequirementText(requirements.minLength, 'Mínimo 8 caracteres')}
            </div>
            <div className="flex items-center space-x-2">
              {getRequirementIcon(requirements.hasUppercase)}
              {getRequirementText(requirements.hasUppercase, 'Al menos una letra mayúscula')}
            </div>
            <div className="flex items-center space-x-2">
              {getRequirementIcon(requirements.hasLowercase)}
              {getRequirementText(requirements.hasLowercase, 'Al menos una letra minúscula')}
            </div>
            <div className="flex items-center space-x-2">
              {getRequirementIcon(requirements.hasNumbers)}
              {getRequirementText(requirements.hasNumbers, 'Al menos un número')}
            </div>
            <div className="flex items-center space-x-2">
              {getRequirementIcon(requirements.hasSpecialChars)}
              {getRequirementText(requirements.hasSpecialChars, 'Al menos un carácter especial')}
            </div>
            <div className="flex items-center space-x-2">
              {getRequirementIcon(requirements.noCommonPatterns)}
              {getRequirementText(requirements.noCommonPatterns, 'Evitar patrones comunes')}
            </div>
          </div>
        </div>
      )}

      {/* Mensajes de feedback */}
      {feedback.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              {feedback.map((message, index) => (
                <p key={index} className="text-sm text-amber-700">
                  • {message}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sugerencias de mejora */}
      {score < 3 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="text-sm font-medium text-blue-800 mb-2">
            💡 Sugerencias para mejorar tu contraseña:
          </h5>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Usa una combinación de letras, números y símbolos</li>
            <li>• Evita información personal como tu nombre o fecha de nacimiento</li>
            <li>• Considera usar una frase larga que sea fácil de recordar</li>
            <li>• No reutilices contraseñas de otras cuentas</li>
          </ul>
        </div>
      )}
    </div>
  );
};
