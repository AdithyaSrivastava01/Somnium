"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

interface UseSSEOptions {
  endpoint: string;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
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
  const eventSourceRef = useRef<EventSource | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!enabled || !token) {
      return;
    }

    const sseUrl = `${process.env.NEXT_PUBLIC_SSE_URL}${endpoint}?token=${encodeURIComponent(token)}`;

    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setData(parsed);
        onMessage?.(parsed);
      } catch (err) {
        console.error("Failed to parse SSE message:", err);
      }
    };

    eventSource.onerror = (event) => {
      setIsConnected(false);
      const error = new Error("SSE connection error");
      setError(error);
      onError?.(event);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    };
  }, [endpoint, enabled, token, onMessage, onError]);

  return {
    data,
    isConnected,
    error,
    close: () => {
      eventSourceRef.current?.close();
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
