/**
 * Automatic token refresh hook
 * Refreshes access tokens before they expire to maintain user sessions
 * Tokens are now stored in httpOnly cookies instead of localStorage
 */

"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/stores/auth-store";

const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry
const ACCESS_TOKEN_DURATION_MS = 60 * 60 * 1000; // 60 minutes (matches backend config)

/**
 * Hook to automatically refresh access tokens before they expire.
 * This prevents users from being logged out during active sessions.
 * Uses httpOnly cookies for secure token storage.
 */
export function useTokenRefresh() {
  const { isAuthenticated, logout } = useAuthStore();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const scheduleRefresh = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Schedule refresh 2 minutes before token expires
    const refreshIn = ACCESS_TOKEN_DURATION_MS - TOKEN_REFRESH_BUFFER_MS;

    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Send refresh token cookie
          },
        );

        if (!response.ok) {
          // Refresh token expired or invalid - logout user
          console.error("Token refresh failed, logging out");
          logout();
          return;
        }

        // Backend sets new tokens in httpOnly cookies
        // No need to update state, cookies are handled by browser

        // Schedule next refresh
        scheduleRefresh();
      } catch (error) {
        console.error("Token refresh error:", error);
        // On network error, try again after a delay
        refreshTimeoutRef.current = setTimeout(scheduleRefresh, 30000); // Retry in 30s
      }
    }, refreshIn);
  }, [isAuthenticated, logout]);

  useEffect(() => {
    scheduleRefresh();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [scheduleRefresh]);

  return null;
}
