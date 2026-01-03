"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Hook to restore user session from httpOnly cookies on app initialization.
 *
 * This hook is necessary because:
 * 1. Authentication tokens are stored in httpOnly cookies (secure, can't be accessed by JS)
 * 2. Zustand store persists to localStorage (which is cleared in new browser profiles)
 * 3. On page load, we need to check if cookies exist and restore the session
 *
 * Usage: Call this hook in components that need to validate session on mount,
 * typically in layout components or auth guards.
 */
export function useSessionRestore() {
  const { isAuthenticated, _hasHydrated, setAuth, setLoading } = useAuthStore();
  const [sessionChecked, setSessionChecked] = useState(false);

  // Only run session validation if:
  // - Store has hydrated from localStorage
  // - User is not already authenticated
  // - We haven't checked the session yet
  const { data: sessionData, isLoading: isValidatingSession } =
    trpc.auth.validateSession.useQuery(undefined, {
      enabled: _hasHydrated && !isAuthenticated && !sessionChecked,
      retry: false,
      refetchOnWindowFocus: false,
    });

  useEffect(() => {
    // If we got a user from cookie validation, restore the session
    if (sessionData?.user && !isAuthenticated) {
      setAuth(sessionData.user);
      setSessionChecked(true);
    } else if (sessionData !== undefined && !sessionData.user) {
      // Session validation completed but no user found
      setSessionChecked(true);
      setLoading(false);
    }
  }, [sessionData, isAuthenticated, setAuth, setLoading, sessionChecked]);

  return {
    sessionChecked,
    isValidatingSession,
  };
}
