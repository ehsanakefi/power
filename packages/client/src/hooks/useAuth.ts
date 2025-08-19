'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { api, handleApiError } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: loginStore,
    verify: verifyStore,
    logout: logoutStore,
    clearError,
    fetchProfile,
  } = useAuthStore();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (phone: string) => {
      const result = await loginStore(phone);
      if (!result.success) {
        throw new Error(result.message || 'Login failed');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });

  // Verify mutation
  const verifyMutation = useMutation({
    mutationFn: async ({ phone, code }: { phone: string; code: string }) => {
      const result = await verifyStore(phone, code);
      if (!result.success) {
        throw new Error(result.message || 'Verification failed');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
      // Redirect to dashboard or home
      window.location.href = '/dashboard';
    },
    onError: (error) => {
      console.error('Verification error:', error);
    },
  });

  // Profile query
  const profileQuery = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      const response = await api.auth.profile();
      return response.data.data?.user;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Logout function
  const logout = useCallback(() => {
    logoutStore();
    queryClient.clear();
  }, [logoutStore, queryClient]);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    try {
      await fetchProfile();
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }, [fetchProfile, queryClient]);

  // Login function
  const login = useCallback(
    async (phone: string) => {
      try {
        await loginMutation.mutateAsync(phone);
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    [loginMutation]
  );

  // Verify function
  const verify = useCallback(
    async (phone: string, code: string) => {
      try {
        await verifyMutation.mutateAsync({ phone, code });
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    [verifyMutation]
  );

  return {
    // State
    user,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || verifyMutation.isPending,
    error: error || loginMutation.error?.message || verifyMutation.error?.message,

    // Profile query state
    profile: profileQuery.data,
    isProfileLoading: profileQuery.isLoading,
    profileError: profileQuery.error,

    // Actions
    login,
    verify,
    logout,
    refreshProfile,
    clearError,

    // Mutation states
    isLoginPending: loginMutation.isPending,
    isVerifyPending: verifyMutation.isPending,
    loginError: loginMutation.error?.message,
    verifyError: verifyMutation.error?.message,
  };
};

// Hook for role-based permissions
export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = useCallback(
    (roles: string | string[]) => {
      if (!user?.role) return false;

      if (typeof roles === 'string') {
        return user.role === roles;
      }

      return roles.includes(user.role);
    },
    [user?.role]
  );

  const isAdmin = user?.role === 'ADMIN';
  const isManager = hasRole(['MANAGER', 'ADMIN']);
  const isEmployee = hasRole(['EMPLOYEE', 'MANAGER', 'ADMIN']);
  const isClient = user?.role === 'CLIENT';

  const canManageTickets = hasRole(['EMPLOYEE', 'MANAGER', 'ADMIN']);
  const canDeleteTickets = hasRole(['MANAGER', 'ADMIN']);
  const canManageUsers = hasRole(['ADMIN']);
  const canViewAllTickets = hasRole(['EMPLOYEE', 'MANAGER', 'ADMIN']);

  return {
    user,
    hasRole,
    isAdmin,
    isManager,
    isEmployee,
    isClient,
    canManageTickets,
    canDeleteTickets,
    canManageUsers,
    canViewAllTickets,
  };
};

export default useAuth;
