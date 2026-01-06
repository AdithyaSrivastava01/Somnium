import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { User } from "@/lib/validations/auth";
import { ROLE_SCOPES } from "@/lib/validations/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  _lastAuthTime: number | null; // Timestamp of last authentication

  // Actions
  setAuth: (user: User) => void;
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
        isAuthenticated: false,
        isLoading: true,
        _hasHydrated: false,
        _lastAuthTime: null,

        setAuth: (user) => {
          set((state) => {
            state.user = user;
            state.isAuthenticated = true;
            state.isLoading = false;
            state._lastAuthTime = Date.now(); // Track when auth was set
          });
        },

        logout: () => {
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state._lastAuthTime = null;
          });
          // SECURITY: Clear persisted state from localStorage
          if (typeof window !== "undefined") {
            localStorage.removeItem("somnium-auth");
          }
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
          isAuthenticated: state.isAuthenticated,
          _lastAuthTime: state._lastAuthTime,
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
