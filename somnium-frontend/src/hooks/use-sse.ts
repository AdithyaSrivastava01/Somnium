"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

interface UseSSEOptions {
  endpoint: string;
  onMessage?: (data: any) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export function useSSE<T = any>({
  endpoint,
  onMessage,
  onError,
  enabled = true,
}: UseSSEOptions) {
  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!enabled || !token) {
      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const connectSSE = async () => {
      try {
        // Use fetch with Authorization header instead of token in URL
        // This prevents token exposure in browser history and server logs
        const sseUrl = `${process.env.NEXT_PUBLIC_SSE_URL}${endpoint}`;

        const response = await fetch(sseUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
          },
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`SSE connection failed: ${response.statusText}`);
        }

        setIsConnected(true);
        setError(null);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("Response body is not readable");
        }

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = line.slice(6);
                const parsed = JSON.parse(data);
                setData(parsed);
                onMessage?.(parsed);
              } catch (err) {
                console.error("Failed to parse SSE message:", err);
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setIsConnected(false);
          const error =
            err instanceof Error ? err : new Error("SSE connection error");
          setError(error);
          onError?.(error);
        }
      }
    };

    connectSSE();

    return () => {
      abortController.abort();
      abortControllerRef.current = null;
      setIsConnected(false);
    };
  }, [endpoint, enabled, token, onMessage, onError]);

  return {
    data,
    isConnected,
    error,
    close: () => {
      abortControllerRef.current?.abort();
      setIsConnected(false);
    },
  };
}

// Specialized hook for patient vitals
export function usePatientVitals(patientId: string, enabled = true) {
  return useSSE({
    endpoint: `/patients/${patientId}/vitals/stream`,
    enabled: enabled && !!patientId,
  });
}

// Specialized hook for alerts
export function useAlerts(enabled = true) {
  return useSSE({
    endpoint: "/alerts/stream",
    enabled,
  });
}
