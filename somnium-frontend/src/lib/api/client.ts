/**
 * API Client for FastAPI backend
 * Handles fetch requests with cookie-based authentication
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RequestConfig extends RequestInit {
  params?: Record<string, any>;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {},
  ): Promise<{ data: T }> {
    const { params, ...fetchConfig } = config;
    const url = this.buildURL(endpoint, params);

    const response = await fetch(url, {
      ...fetchConfig,
      credentials: "include", // Include cookies
      headers: {
        "Content-Type": "application/json",
        ...fetchConfig.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return { data };
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<{ data: T }> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<{ data: T }> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<{ data: T }> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(
    endpoint: string,
    config?: RequestConfig,
  ): Promise<{ data: T }> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }
}

export const apiClient = new APIClient(API_URL);
