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
  const { isAuthenticated, logout, _hasHydrated } = useAuthStore();

  const { data, error, isLoading } = trpc.auth.validateSession.useQuery(
    undefined,
    {
      // Only run if user appears authenticated and state has hydrated
      enabled: isAuthenticated && _hasHydrated,
      // Don't retry on auth errors
      retry: false,
      // Stale time of 30 seconds (don't re-fetch too often)
      staleTime: 30000,
    },
  );

  useEffect(() => {
    // Skip if on auth pages or still loading
    if (pathname.startsWith("/auth") || !_hasHydrated) {
      return;
    }

    // If user appears authenticated but session validation returned no user
    if (isAuthenticated && !isLoading && data && !data.user) {
      console.warn("Session validation failed, clearing auth state");

      // Clear auth state
      logout();

      // Redirect to login with session expired message
      router.push(`/auth?redirect=${pathname}&session_expired=true`);
    }
  }, [
    data,
    isLoading,
    isAuthenticated,
    logout,
    router,
    pathname,
    _hasHydrated,
  ]);

  return { isValidating: isLoading, isValid: !!data?.user };
}
