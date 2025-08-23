import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loginRequest } from "@/lib/api.ts";

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (name: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("auth_token"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }, [token]);

  const login = useCallback(async (name: string, password: string) => {
    setLoading(true);
    try {
      const res = await loginRequest(name, password);
      setToken(res.token);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
  }), [token, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
