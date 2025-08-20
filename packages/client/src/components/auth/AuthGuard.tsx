'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import LoadingScreen from '@/components/ui/LoadingScreen';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({
  children,
  fallback,
  redirectTo = '/login'
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, fetchProfile } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have authentication state
        if (isAuthenticated && !user) {
          // We have a token but no user data, try to fetch profile
          await fetchProfile();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [isAuthenticated, user, fetchProfile]);

  useEffect(() => {
    // Only redirect after we've initialized and confirmed user is not authenticated
    if (isInitialized && !isAuthenticated && !isLoading) {
      router.push(redirectTo);
    }
  }, [isInitialized, isAuthenticated, isLoading, router, redirectTo]);

  // Show loading while checking authentication status
  if (!isInitialized || isLoading) {
    return fallback || <LoadingScreen message="Checking authentication..." />;
  }

  // Show loading while redirecting unauthenticated users
  if (!isAuthenticated) {
    return fallback || <LoadingScreen message="Redirecting to login..." />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}

// Higher-order component version for easier usage
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode;
    redirectTo?: string;
  }
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard
        fallback={options?.fallback}
        redirectTo={options?.redirectTo}
      >
        <Component {...props} />
      </AuthGuard>
    );
  };
}

// Hook for checking authentication in components
export function useAuthGuard(redirectTo: string = '/login') {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
      } else {
        setIsChecking(false);
      }
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return {
    isAuthenticated,
    isLoading: isLoading || isChecking,
    isChecking,
  };
}
