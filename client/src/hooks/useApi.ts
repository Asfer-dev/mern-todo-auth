import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

type ApiOptions = RequestInit & {
  // Optional custom headers; merged with default Content-Type/Auth headers
  headers?: Record<string, string>;
};

export const useApi = () => {
  const { token } = useAuth();

  const apiCall = useCallback(
    async <T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ? (options.headers as Record<string, string>) : {}),
      };

      try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers,
        });

        const isJson = response.headers
          .get("content-type")
          ?.includes("application/json");

        if (!response.ok) {
          const errorBody = isJson ? await response.json() : null;
          throw new Error(errorBody?.error || `HTTP ${response.status}`);
        }

        return isJson ? await response.json() : (null as T);
      } catch (error: any) {
        console.error("API Error:", error);
        throw error;
      }
    },
    [token]
  );

  return { apiCall };
};
