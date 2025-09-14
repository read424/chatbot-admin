'use client';

import { SessionWarning } from '@/components/auth/SessionWarning';
import { useSessionManagement } from '@/hooks/useSessionManagement';
import React, { createContext, ReactNode, useContext } from 'react';

interface SessionContextType {
  sessionActivity: {
    lastActivity: Date;
    isActive: boolean;
    warningShown: boolean;
    timeUntilTimeout: number;
    timeUntilWarning: number;
  };
  isSessionExpiring: boolean;
  timeUntilTimeout: number;
  formatTimeRemaining: (minutes: number) => string;
  extendSession: () => void;
  endSession: () => void;
  refreshToken: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
  timeoutMinutes?: number;
  warningMinutes?: number;
  refreshThresholdMinutes?: number;
  checkIntervalSeconds?: number;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
  timeoutMinutes = 30,
  warningMinutes = 5,
  refreshThresholdMinutes = 5,
  checkIntervalSeconds = 30
}) => {
  const sessionManagement = useSessionManagement({
    timeoutMinutes,
    warningMinutes,
    refreshThresholdMinutes,
    checkIntervalSeconds
  });

  const {
    sessionActivity,
    isSessionExpiring,
    timeUntilTimeout,
    formatTimeRemaining,
    extendSession,
    endSession,
    refreshToken
  } = sessionManagement;

  const contextValue: SessionContextType = {
    sessionActivity,
    isSessionExpiring,
    timeUntilTimeout,
    formatTimeRemaining,
    extendSession,
    endSession,
    refreshToken
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
      
      {/* Session Warning Modal */}
      <SessionWarning
        isVisible={sessionActivity.warningShown}
        timeRemaining={timeUntilTimeout}
        onExtend={extendSession}
        onLogout={endSession}
        formatTime={formatTimeRemaining}
      />
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
