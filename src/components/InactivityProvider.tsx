/**
 * Inactivity Provider Component
 * Wraps the app to provide global inactivity detection
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useInactivityDetection } from '../hooks/useInactivityDetection';
import InactivityAlert from './InactivityAlert';

interface InactivityContextType {
  isInactive: boolean;
  showAlert: boolean;
  resetTimer: () => void;
  timeUntilInactive: number;
}

const InactivityContext = createContext<InactivityContextType | undefined>(undefined);

interface InactivityProviderProps {
  children: ReactNode;
}

export const InactivityProvider: React.FC<InactivityProviderProps> = ({ children }) => {
  const location = useLocation();

  // Don't enable inactivity detection on login/register pages
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
  const isAuthenticated = !!localStorage.getItem('access_token');

  const {
    isInactive,
    showAlert,
    resetTimer,
    handleSignOut,
    handleStayLoggedIn,
    timeUntilInactive
  } = useInactivityDetection({
    // Use 2 minutes for inactivity warning (120 seconds)
    timeout: 2 * 60 * 1000,
    enabled: isAuthenticated && !isAuthPage,
    onInactivity: () => {
      console.log('User inactivity detected after 2 minutes');
    },
    onSignOut: () => {
      console.log('User signed out due to inactivity');
    }
  });

  const contextValue: InactivityContextType = {
    isInactive,
    showAlert,
    resetTimer,
    timeUntilInactive
  };

  return (
    <InactivityContext.Provider value={contextValue}>
      {children}
      
      {/* Inactivity Alert Modal */}
      <InactivityAlert
        isOpen={showAlert}
        onSignOut={handleSignOut}
        onStayLoggedIn={handleStayLoggedIn}
      />
    </InactivityContext.Provider>
  );
};

// Hook to use inactivity context
export const useInactivity = (): InactivityContextType => {
  const context = useContext(InactivityContext);
  if (context === undefined) {
    throw new Error('useInactivity must be used within an InactivityProvider');
  }
  return context;
};
