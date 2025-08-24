import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { loginRequest } from "@/lib/api.ts";

interface AuthContextValue {
  token: string | null;
  teamName: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  role: string | null;
  loading: boolean;
  login: (name: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("auth_token"),
  );
  const [teamName, setTeamName] = useState<string | null>(() =>
    localStorage.getItem("team_name"),
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }, [token]);

  useEffect(() => {
    if (teamName) {
      localStorage.setItem("team_name", teamName);
    } else {
      localStorage.removeItem("team_name");
    }
  }, [teamName]);

  const login = useCallback(async (name: string, password: string) => {
    setLoading(true);
    try {
      const normalized = name?.toLowerCase?.() ?? name;
      const res = await loginRequest(normalized, password);
      setToken(res.token);
      setTeamName(normalized);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTeamName(null);
  }, []);

  function decodeRoleFromToken(t: string | null): string | null {
    if (!t) return null;
    try {
      const base64Url = t.split(".")[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      const payload = JSON.parse(jsonPayload) as Record<string, unknown>;
      const role = payload["role"] as string | undefined;
      return role ?? null;
    } catch {
      return null;
    }
  }

  const role = useMemo(() => decodeRoleFromToken(token), [token]);
  const isAdmin = role === "dondrekiel_admin";

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      teamName,
      isAuthenticated: !!token,
      isAdmin,
      role,
      loading,
      login,
      logout,
    }),
    [token, teamName, isAdmin, role, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
