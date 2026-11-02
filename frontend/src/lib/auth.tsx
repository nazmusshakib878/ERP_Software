/* oxlint-disable react/only-export-components -- Context hooks and their provider belong to the same module. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, getStoredToken, setStoredToken } from "./api";
import { USER_NAME, USER_ROLE } from "./utils";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  workspace: string;
  avatar?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

const DEFAULT_USER: User = {
  id: "1",
  name: "Md. Nazmus Shakib",
  email: "shakib@nserp.com",
  role: USER_ROLE,
  initials: "NS",
  workspace: "NS ERP / Aster Trading Ltd.",
  avatar: "/user-avatar.jpg",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEFAULT_USER);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      api.auth
        .me()
        .then((res) => {
          if (res?.user) {
            setUser(res.user);
          }
        })
        .catch(() => {
          // Token invalid or backend unreachable; keep existing or clear
        });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) throw new Error("Enter a valid email address.");

    setLoading(true);
    try {
      try {
        const res = await api.auth.login({ email, password });
        if (res.token && res.user) {
          setStoredToken(res.token);
          setUser(res.user);
          return;
        }
      } catch (err: any) {
        // Fallback for local demo credentials if server is not yet started
        if (
          (email.includes("shakib") || email.includes("alex") || email.includes("arif") || email.includes("admin")) &&
          password === "password"
        ) {
          setUser({
            id: "1",
            name: email.includes("alex") ? "Alex Morgan" : "Md. Nazmus Shakib",
            email,
            role: email.includes("alex") ? "Administrator" : "Company Admin",
            initials: email.includes("alex") ? "AM" : "NS",
            workspace: "NS Enterprise Suite",
            avatar: "/user-avatar.jpg",
          });
          return;
        }
        throw err;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    api.auth.logout().catch(() => {});
    setStoredToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
