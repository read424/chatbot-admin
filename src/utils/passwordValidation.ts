export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
    noCommonPatterns: boolean;
  };
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxLength?: number;
  forbiddenPatterns?: string[];
}

const DEFAULT_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128,
  forbiddenPatterns: [
    'password',
    '123456',
    'qwerty',
    'admin',
    'user',
    'test'
  ]
};

export function validatePasswordStrength(
  password: string,
  requirements: PasswordRequirements = DEFAULT_REQUIREMENTS
): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Verificar longitud mínima
  const minLengthValid = password.length >= requirements.minLength;
  if (!minLengthValid) {
    feedback.push(`Mínimo ${requirements.minLength} caracteres`);
  } else {
    score += 1;
  }

  // Verificar longitud máxima
  if (requirements.maxLength && password.length > requirements.maxLength) {
    feedback.push(`Máximo ${requirements.maxLength} caracteres`);
  }

  // Verificar mayúsculas
  const hasUppercase = /[A-Z]/.test(password);
  if (requirements.requireUppercase && !hasUppercase) {
    feedback.push('Al menos una letra mayúscula');
  } else if (hasUppercase) {
    score += 0.5;
  }

  // Verificar minúsculas
  const hasLowercase = /[a-z]/.test(password);
  if (requirements.requireLowercase && !hasLowercase) {
    feedback.push('Al menos una letra minúscula');
  } else if (hasLowercase) {
    score += 0.5;
  }

  // Verificar números
  const hasNumbers = /\d/.test(password);
  if (requirements.requireNumbers && !hasNumbers) {
    feedback.push('Al menos un número');
  } else if (hasNumbers) {
    score += 0.5;
  }

  // Verificar caracteres especiales
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  if (requirements.requireSpecialChars && !hasSpecialChars) {
    feedback.push('Al menos un carácter especial');
  } else if (hasSpecialChars) {
    score += 0.5;
  }

  // Verificar patrones comunes
  const noCommonPatterns = !requirements.forbiddenPatterns?.some(pattern => 
    password.toLowerCase().includes(pattern.toLowerCase())
  );
  if (!noCommonPatterns) {
    feedback.push('Evita patrones comunes como "password" o "123456"');
  } else {
    score += 0.5;
  }

  // Bonificación por longitud
  if (password.length >= 12) score += 0.5;
  if (password.length >= 16) score += 0.5;

  // Bonificación por diversidad de caracteres
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= 8) score += 0.5;

  const finalScore = Math.min(Math.floor(score), 4);
  const isValid = finalScore >= 2 && feedback.length === 0;

  return {
    score: finalScore,
    feedback,
    isValid,
    requirements: {
      minLength: minLengthValid,
      hasUppercase,
      hasLowercase,
      hasNumbers,
      hasSpecialChars,
      noCommonPatterns
    }
  };
}

export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'Muy débil';
    case 2:
      return 'Débil';
    case 3:
      return 'Moderada';
    case 4:
      return 'Fuerte';
    default:
      return 'Desconocida';
  }
}

export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'text-red-600 bg-red-100';
    case 2:
      return 'text-orange-600 bg-orange-100';
    case 3:
      return 'text-yellow-600 bg-yellow-100';
    case 4:
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

// Función para generar contraseñas seguras
export function generateSecurePassword(length: number = 12): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Asegurar al menos un carácter de cada tipo
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Mayúscula
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Minúscula
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Número
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Especial
  
  // Completar con caracteres aleatorios
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Mezclar la contraseña
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
