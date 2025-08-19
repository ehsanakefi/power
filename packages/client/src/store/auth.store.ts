import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api, setAuthToken, removeAuthToken, User } from '@/lib/api';

export interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (phone: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User) => void;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (phone: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.auth.login(phone);

          if (response.data.success && response.data.data) {
            const { user, token } = response.data.data;

            // Store token in localStorage and axios headers
            setAuthToken(token);

            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return { success: true };
          } else {
            const errorMessage = response.data.message || 'Login failed';
            set({ error: errorMessage, isLoading: false });
            return { success: false, message: errorMessage };
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Network error occurred';
          set({ error: errorMessage, isLoading: false });
          return { success: false, message: errorMessage };
        }
      },

      logout: () => {
        // Call logout API (optional, don't await to avoid blocking logout)
        api.auth.logout().catch(console.error);

        // Clear local storage and state
        removeAuthToken();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User) => {
        set({ user });
      },

      fetchProfile: async () => {
        if (!get().isAuthenticated) return;

        try {
          const response = await api.auth.profile();

          if (response.data.success && response.data.data) {
            set({ user: response.data.data.user });
          }
        } catch (error: any) {
          console.error('Failed to fetch profile:', error);

          // If profile fetch fails with 401, logout user
          if (error.response?.status === 401) {
            get().logout();
          }
        }
      },
    }),
    {
      name: 'power-crm-auth', // Storage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper hooks for specific auth checks
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

// Role-based permission helpers
export const useUserRole = () => {
  const user = useUser();
  return user?.role;
};

export const useHasRole = (roles: string | string[]) => {
  const userRole = useUserRole();
  if (!userRole) return false;

  if (typeof roles === 'string') {
    return userRole === roles;
  }

  return roles.includes(userRole);
};

export const useIsAdmin = () => useHasRole('ADMIN');
export const useIsManager = () => useHasRole(['MANAGER', 'ADMIN']);
export const useIsEmployee = () => useHasRole(['EMPLOYEE', 'MANAGER', 'ADMIN']);
export const useIsClient = () => useHasRole('CLIENT');

// Permission helpers for UI components
export const useCanManageTickets = () => useHasRole(['EMPLOYEE', 'MANAGER', 'ADMIN']);
export const useCanDeleteTickets = () => useHasRole(['MANAGER', 'ADMIN']);
export const useCanManageUsers = () => useHasRole(['ADMIN']);
