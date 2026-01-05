import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { trpc } from "@/lib/trpc/client";

/**
 * SECURITY: Hook that validates authentication by checking session with backend
 *
 * Returns true only if:
 * 1. Store has hydrated from localStorage
 * 2. Backend confirms valid session via cookies
 *
 * This prevents showing authenticated content when cookies are missing
 * (e.g., after logout and tab reopen with stale localStorage)
 */
export function useValidAuth(): boolean {
  const { _hasHydrated, isAuthenticated, setAuth, logout } = useAuthStore();
  const [isValidated, setIsValidated] = useState(false);

  const { data, isLoading } = trpc.auth.validateSession.useQuery(undefined, {
    enabled: _hasHydrated,
    retry: false,
    staleTime: 30000,
  });

  useEffect(() => {
    if (!_hasHydrated || isLoading) {
      return;
    }

    if (data?.user) {
      // Valid session confirmed by backend
      if (!isAuthenticated) {
        // Update store if it was cleared
        setAuth(data.user);
      }
      setIsValidated(true);
    } else {
      // No valid session
      if (isAuthenticated) {
        // Clear stale auth state
        logout();
      }
      setIsValidated(false);
    }
  }, [data, isLoading, _hasHydrated, isAuthenticated, setAuth, logout]);

  return isValidated;
}
