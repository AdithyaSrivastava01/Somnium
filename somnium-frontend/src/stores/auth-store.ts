import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { User } from "@/lib/validations/auth";
import { ROLE_SCOPES } from "@/lib/validations/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  rememberMe: boolean;

  // Actions
  setAuth: (
    user: User,
    token: string,
    refreshToken: string,
    rememberMe?: boolean,
  ) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
  hasScope: (scope: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set, get) => ({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: true,
        _hasHydrated: false,
        rememberMe: false,

        setAuth: (user, token, refreshToken, rememberMe = false) => {
          set((state) => {
            state.user = user;
            state.token = token;
            state.refreshToken = refreshToken;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.rememberMe = rememberMe;
          });
        },

        logout: () => {
          set((state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.rememberMe = false;
          });
        },

        setLoading: (loading) => {
          set((state) => {
            state.isLoading = loading;
          });
        },

        setHasHydrated: (hydrated) => {
          set((state) => {
            state._hasHydrated = hydrated;
            state.isLoading = false;
          });
        },

        hasScope: (scope) => {
          const { user } = get();
          if (!user) return false;
          return ROLE_SCOPES[user.role]?.includes(scope) ?? false;
        },
      })),
      {
        name: "somnium-auth",
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
          rememberMe: state.rememberMe,
        }),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      },
    ),
    { name: "AuthStore" },
  ),
);

// Selector hooks
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useHasScope = (scope: string) =>
  useAuthStore((state) => state.hasScope(scope));
