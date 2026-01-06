import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { trpc } from "@/lib/trpc/client";

/**
 * SECURITY: Session validator hook
 *
 * This hook runs on every page load to verify the user's session is valid.
 * If the backend returns 401 (session invalid), it clears local state and redirects to login.
 * This prevents users from accessing the app with stale localStorage data after logout.
 */
export function useSessionValidator() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout, _hasHydrated, _lastAuthTime } =
    useAuthStore();

  // Add grace period after login to allow cookies to propagate
  const GRACE_PERIOD_MS = 2000; // 2 seconds
  const isWithinGracePeriod = _lastAuthTime
    ? Date.now() - _lastAuthTime < GRACE_PERIOD_MS
    : false;

  const { data, error, isLoading, isFetched } =
    trpc.auth.validateSession.useQuery(undefined, {
      // Only run if user appears authenticated, state has hydrated, and grace period has passed
      enabled: isAuthenticated && _hasHydrated && !isWithinGracePeriod,
      // Don't retry on auth errors
      retry: false,
      // Stale time of 30 seconds (don't re-fetch too often)
      staleTime: 30000,
    });

  useEffect(() => {
    // Skip if on auth pages or still loading
    if (pathname.startsWith("/auth") || !_hasHydrated) {
      return;
    }

    // Skip validation during grace period after login
    if (isWithinGracePeriod) {
      return;
    }

    // CRITICAL: Only validate if query has actually fetched data AND we have a definitive response
    // This prevents false positives during the initial query loading state
    if (
      isAuthenticated &&
      !isLoading &&
      isFetched &&
      data !== undefined &&
      data.user === null
    ) {
      console.warn("Session validation failed, clearing auth state");

      // Clear auth state
      logout();

      // Redirect to login with session expired message
      router.push(`/auth?redirect=${pathname}&session_expired=true`);
    }
  }, [
    data,
    isLoading,
    isFetched,
    isAuthenticated,
    logout,
    router,
    pathname,
    _hasHydrated,
    isWithinGracePeriod,
  ]);

  return { isValidating: isLoading, isValid: !!data?.user };
}
