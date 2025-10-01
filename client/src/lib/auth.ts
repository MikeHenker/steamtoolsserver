import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import type { User, LoginInput } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
    enabled: !!localStorage.getItem("token"),
  });

  return { user, isLoading, isAuthenticated: !!user };
}

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      const data = await res.json();
      localStorage.setItem("token", data.token);
      return data.user;
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (credentials: LoginInput & { email: string }) => {
      const res = await apiRequest("POST", "/api/auth/register", credentials);
      const data = await res.json();
      localStorage.setItem("token", data.token);
      return data.user;
    },
  });
}

export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login";
}

// Modify apiRequest to include auth token
const originalApiRequest = apiRequest;
export const authenticatedApiRequest: typeof apiRequest = async (method, url, data) => {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }

  return res;
};
