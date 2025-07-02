import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

export const useApi = () => {
  const { token } = useAuth();

  const apiCall = useCallback(
    async (endpoint, options = {}) => {
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
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

        return isJson ? await response.json() : null;
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    },
    [token]
  );

  return { apiCall };
};
