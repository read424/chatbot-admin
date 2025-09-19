'use client';

import { useAuth } from '@/hooks/useAuth';
import { useLoginAttempts } from '@/hooks/useLoginAttempts';
import { useRememberMe } from '@/hooks/useRememberMe';
import { ApiError } from '@/lib/api';
import { validatePasswordStrength } from '@/utils/passwordValidation';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { AccountLockoutWarning } from './AccountLockoutWarning';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

export const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPasswordStrength, setShowPasswordStrength] = useState(false);
    const [isCheckingAccount, setIsCheckingAccount] = useState(false);

    const router = useRouter();
    
    // Hooks de seguridad
    const {
        isAccountLocked,
        getLockoutTimeRemaining,
        recordFailedAttempt,
        clearAttempts,
        getAttemptInfo
    } = useLoginAttempts();

    const {
        saveRememberMe,
        clearRememberMe,
        getRememberedEmail,
        getRememberedToken,
        hasValidRememberMe
    } = useRememberMe();

    const { login } = useAuth();

    // Cargar email recordado al inicializar
    useEffect(() => {
        const rememberedEmail = getRememberedEmail();
        if (rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
        }
    }, [getRememberedEmail]);

    // Verificar estado de la cuenta cuando cambia el email
    useEffect(() => {
        if (email) {
            setIsCheckingAccount(true);
            const attemptInfo = getAttemptInfo(email);
            setIsCheckingAccount(false);
        }
    }, [email, getAttemptInfo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Verificar si la cuenta está bloqueada
            if (isAccountLocked(email)) {
                const lockoutTime = getLockoutTimeRemaining(email);
                setError(`Cuenta bloqueada. Intenta nuevamente en ${lockoutTime} minutos.`);
                setLoading(false);
                return;
            }

            // Usar el hook useAuth en lugar de authService directamente
            const success = await login(email, password);
            
            if (success) {
                console.log('Login exitoso');
                
                // Limpiar intentos fallidos en caso de éxito
                clearAttempts(email);
                
                // Manejar "Remember Me"
                if (rememberMe) {
                    saveRememberMe(email, 'mock-token');
                } else {
                    clearRememberMe();
                }
                
                // Redirigir al dashboard
                router.push('/dashboard');
            } else {
                throw new Error('Credenciales inválidas');
            }
            
        } catch (err) {
            const apiError = err as ApiError;
            
            // Registrar intento fallido
            const attemptResult = recordFailedAttempt(email);
            
            if (attemptResult.isLocked) {
                setError(`Cuenta bloqueada por ${attemptResult.lockoutTimeRemaining} minutos debido a múltiples intentos fallidos.`);
            } else {
                setError(apiError.message || 'Error al iniciar sesión');
            }
            
            console.error('Error de login:', apiError);
        } finally {
            setLoading(false);
        }
    };

    const demoCredentials = [
        { email: 'admin@inbox.com', password: 'admin123', role: 'Administrador' },
        { email: 'agente@inbox.com', password: 'agente123', role: 'Agente' },
        { email: 'supervisor@inbox.com', password: 'supervisor123', role: 'Supervisor' }
    ];

    const fillDemo = (demoEmail: string, demoPassword: string) => {
        setEmail(demoEmail);
        setPassword(demoPassword);
    };

    // Validar fortaleza de contraseña
    const passwordStrength = validatePasswordStrength(password);

    // Obtener información de intentos de login
    const attemptInfo = getAttemptInfo(email);

    // Manejar cambio de contraseña
    const handlePasswordChange = (newPassword: string) => {
        setPassword(newPassword);
        if (newPassword.length > 0) {
            setShowPasswordStrength(true);
        }
    };

    // Actualizar estado de la cuenta
    const handleRefreshAccountStatus = () => {
        setIsCheckingAccount(true);
        setTimeout(() => {
            setIsCheckingAccount(false);
        }, 500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
            {/* Logo y título */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Chat</h1>
                <p className="text-gray-600">Accede a tu panel de administración</p>
            </div>

            {/* Formulario */}
            <div className="bg-white rounded-lg shadow-lg p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-red-700 text-sm">{error}</span>
                    </div>
                )}

                {/* Advertencia de bloqueo de cuenta */}
                {email && (
                    <AccountLockoutWarning
                        isLocked={attemptInfo.isLocked}
                        attemptsRemaining={attemptInfo.attemptsRemaining}
                        lockoutTimeRemaining={attemptInfo.lockoutTimeRemaining}
                        onRefresh={handleRefreshAccountStatus}
                    />
                )}

                {/* Email field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico
                    </label>
                    <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        placeholder="tu@correo.com"
                        required
                        disabled={loading || isCheckingAccount}
                    />
                    {isCheckingAccount && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
                        </div>
                    )}
                    </div>
                </div>

                {/* Password field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                    </label>
                    <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        placeholder="Tu contraseña"
                        required
                        disabled={loading || isCheckingAccount}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={loading || isCheckingAccount}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    </div>
                    
                    {/* Indicador de fortaleza de contraseña */}
                    {showPasswordStrength && password.length > 0 && (
                        <div className="mt-3">
                            <PasswordStrengthIndicator strength={passwordStrength} />
                        </div>
                    )}
                </div>

                {/* Remember me */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        disabled={loading || isCheckingAccount}
                    />
                    <span className="ml-2 text-sm text-gray-600">Recordarme</span>
                    </label>
                    <button
                    type="button"
                    className="text-sm text-green-600 hover:text-green-500"
                    disabled={loading || isCheckingAccount}
                    >
                    ¿Olvidaste tu contraseña?
                    </button>
                </div>

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={loading || !email || !password || isCheckingAccount || attemptInfo.isLocked}
                    className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                >
                    {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Iniciando sesión...</span>
                    </>
                    ) : isCheckingAccount ? (
                    <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Verificando cuenta...</span>
                    </>
                    ) : attemptInfo.isLocked ? (
                    <span>Cuenta Bloqueada</span>
                    ) : (
                    <span>Iniciar Sesión</span>
                    )}
                </button>
                </form>

                {/* Demo credentials */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-4 text-center">
                    <strong>Credenciales de prueba:</strong>
                </p>
                <div className="space-y-2">
                    {demoCredentials.map((cred, index) => (
                    <button
                        key={index}
                        onClick={() => fillDemo(cred.email, cred.password)}
                        className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <div className="flex justify-between items-center">
                        <div>
                            <div className="text-sm font-medium text-gray-900">{cred.email}</div>
                            <div className="text-xs text-gray-500">{cred.role}</div>
                        </div>
                        <div className="text-xs text-gray-400">{cred.password}</div>
                        </div>
                    </button>
                    ))}
                </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 text-sm text-gray-500">
                © 2024 Panel de Chat. Todos los derechos reservados.
            </div>
            </div>
        </div>
    );
};