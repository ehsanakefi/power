'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { setAuthToken } from '@/lib/api';

interface AuthContextType {
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isInitialized: false,
});

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { token, isAuthenticated, setUser, logout } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have a token in localStorage
        const storedToken = localStorage.getItem('authToken');

        if (storedToken && isAuthenticated) {
          // Set the token in axios headers
          setAuthToken(storedToken);

          // Optionally fetch fresh user profile
          try {
            const { fetchProfile } = useAuthStore.getState();
            await fetchProfile();
          } catch (error) {
            console.error('Failed to fetch user profile on initialization:', error);
            // If profile fetch fails, the user might need to re-authenticate
            logout();
          }
        } else if (storedToken && !isAuthenticated) {
          // Token exists but state is not authenticated, clear invalid token
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear potentially corrupted auth data
        logout();
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [isAuthenticated, logout]);

  // Set token in axios headers when token changes
  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, [token]);

  const contextValue: AuthContextType = {
    isInitialized,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
