import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { apiRequest } from "./config/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);

  const clearAuth = useCallback(() => {
    sessionStorage.removeItem("careconnect_token");

    if (!mountedRef.current) return;

    setUser(null);
    setProfile(null);
  }, []);

  const fetchUser = useCallback(async () => {
    if (fetchingRef.current) return;

    const token = sessionStorage.getItem("careconnect_token");

    if (!token) {
      clearAuth();

      if (mountedRef.current) {
        setLoading(false);
      }

      return;
    }

    fetchingRef.current = true;

    try {
      const data = await apiRequest("/auth/me");

      if (!mountedRef.current) return;

      setUser(data.user ?? null);
      setProfile(data.profile ?? null);
    } catch (error) {
      console.error("Failed to restore session:", error);

      clearAuth();
    } finally {
      fetchingRef.current = false;

      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [clearAuth]);

  useEffect(() => {
    mountedRef.current = true;

    fetchUser();

    const handleUnauthorized = () => {
      clearAuth();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      mountedRef.current = false;

      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [fetchUser, clearAuth]);

  const login = useCallback(
    async (email, password) => {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      sessionStorage.setItem("careconnect_token", data.token);

      // Immediate UI update
      setUser(data.user ?? null);

      // Only fetch profile if needed
      if (data.profile) {
        setProfile(data.profile);
      } else {
        await fetchUser();
      }

      return data;
    },
    [fetchUser],
  );

  const logout = useCallback(async () => {
    try {
      await apiRequest("/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.warn("Logout request failed:", error);
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      login,
      logout,
      refreshUser: fetchUser,
    }),
    [user, profile, loading, login, logout, fetchUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
