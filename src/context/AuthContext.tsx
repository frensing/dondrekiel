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

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      teamName,
      isAuthenticated: !!token,
      loading,
      login,
      logout,
    }),
    [token, teamName, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
