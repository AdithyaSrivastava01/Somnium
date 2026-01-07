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
  // Increased to 10s to handle HMR (Hot Module Reload) during development
  const GRACE_PERIOD_MS = 10000; // 10 seconds
  const timeSinceLogin = _lastAuthTime ? Date.now() - _lastAuthTime : Infinity;
  const isWithinGracePeriod = timeSinceLogin < GRACE_PERIOD_MS;

  // CRITICAL: Completely disable query during grace period
  // This prevents any race conditions or timing issues
  const shouldValidate =
    isAuthenticated &&
    _hasHydrated &&
    _lastAuthTime !== null &&
    timeSinceLogin >= GRACE_PERIOD_MS &&
    !pathname.startsWith("/auth");

  const { data, isLoading, isFetched } = trpc.auth.validateSession.useQuery(
    undefined,
    {
      // Only enable query if ALL validation criteria are met
      enabled: shouldValidate,
      // Don't retry on auth errors
      retry: false,
      // CRITICAL: Never use cached data - always fetch fresh from server
      staleTime: 0,
      gcTime: 0, // Renamed from cacheTime in newer TanStack Query
      // Prevent refetching on window focus
      refetchOnWindowFocus: false,
      // ALWAYS refetch on mount when enabled
      refetchOnMount: "always",
    },
  );

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
    // ALSO: Never log out during grace period, even if validation somehow runs
    if (
      isAuthenticated &&
      !isLoading &&
      isFetched &&
      data !== undefined &&
      data.user === null &&
      !isWithinGracePeriod // Extra safety: never logout during grace period
    ) {
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
    _lastAuthTime,
  ]);

  return { isValidating: isLoading, isValid: !!data?.user };
}
