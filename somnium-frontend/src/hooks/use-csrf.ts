/**
 * CSRF token management hook
 * Fetches and manages CSRF tokens for secure API requests
 */

"use client";

import { useEffect, useState } from "react";

let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;

/**
 * Fetch CSRF token from the backend
 */
async function fetchCsrfToken(): Promise<string> {
  const response = await fetch("/api/csrf", {
    method: "GET",
    credentials: "include", // Include cookies
  });

  if (!response.ok) {
    throw new Error("Failed to fetch CSRF token");
  }

  const data = await response.json();
  csrfToken = data.csrf_token;
  return csrfToken!;
}

/**
 * Get CSRF token with caching
 * Ensures only one request is made at a time
 */
export async function getCsrfToken(): Promise<string> {
  // Return cached token if available
  if (csrfToken) {
    return csrfToken;
  }

  // Return existing promise if already fetching
  if (csrfPromise) {
    return csrfPromise;
  }

  // Fetch new token
  csrfPromise = fetchCsrfToken().finally(() => {
    csrfPromise = null;
  });

  return csrfPromise;
}

/**
 * Clear cached CSRF token (e.g., on logout)
 */
export function clearCsrfToken(): void {
  csrfToken = null;
  csrfPromise = null;
}

/**
 * Hook to fetch CSRF token on mount
 */
export function useCsrf() {
  const [token, setToken] = useState<string | null>(csrfToken);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(!csrfToken);

  useEffect(() => {
    let mounted = true;

    async function loadToken() {
      try {
        const fetchedToken = await getCsrfToken();
        if (mounted) {
          setToken(fetchedToken);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err
              : new Error("Failed to fetch CSRF token"),
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadToken();

    return () => {
      mounted = false;
    };
  }, []);

  return { token, error, isLoading };
}
