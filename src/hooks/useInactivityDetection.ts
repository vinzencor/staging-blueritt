/**
 * Hook for detecting user inactivity and managing authentication state
 * Triggers after 20 minutes of inactivity and provides options to sign out or continue
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseInactivityDetectionOptions {
  timeout?: number; // Timeout in milliseconds (default: 20 minutes)
  onInactivity?: () => void;
  onSignOut?: () => void;
  enabled?: boolean;
}

interface InactivityState {
  isInactive: boolean;
  showAlert: boolean;
  timeRemaining: number;
}

export const useInactivityDetection = ({
  timeout = 20 * 60 * 1000, // 20 minutes in milliseconds
  onInactivity,
  onSignOut,
  enabled = true
}: UseInactivityDetectionOptions = {}) => {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  
  const [state, setState] = useState<InactivityState>({
    isInactive: false,
    showAlert: false,
    timeRemaining: 0
  });

  // Events that should reset the inactivity timer
  const events = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click',
    'keydown'
  ];

  const resetTimer = useCallback(() => {
    if (!enabled) return;

    lastActivityRef.current = Date.now();
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Reset state if user was inactive
    if (state.isInactive || state.showAlert) {
      setState({
        isInactive: false,
        showAlert: false,
        timeRemaining: 0
      });
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        isInactive: true,
        showAlert: true
      }));
      
      if (onInactivity) {
        onInactivity();
      }
    }, timeout);
  }, [enabled, timeout, onInactivity, state.isInactive, state.showAlert]);

  const handleSignOut = useCallback(() => {
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Clear authentication data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    // Reset state
    setState({
      isInactive: false,
      showAlert: false,
      timeRemaining: 0
    });

    // Call custom sign out handler
    if (onSignOut) {
      onSignOut();
    }

    // Redirect to login
    navigate('/login');
  }, [navigate, onSignOut]);

  const handleStayLoggedIn = useCallback(() => {
    setState({
      isInactive: false,
      showAlert: false,
      timeRemaining: 0
    });
    resetTimer();
  }, [resetTimer]);

  // Set up event listeners
  useEffect(() => {
    if (!enabled) return;

    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initial timer setup
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, resetTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    resetTimer,
    handleSignOut,
    handleStayLoggedIn,
    timeUntilInactive: Math.max(0, timeout - (Date.now() - lastActivityRef.current))
  };
};
