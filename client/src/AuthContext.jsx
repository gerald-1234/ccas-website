import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiRequest } from "./config/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // A custom hook to easily access the auth context

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    sessionStorage.removeItem("careconnect_token");
    setUser(null);
    setProfile(null);
  }, []);

  const fetchUser = useCallback(async () => {
    const token = sessionStorage.getItem("careconnect_token");

    if (!token) {
      clearAuth();
      setLoading(false);
      return;
    }

    // AbortController to cancel fetch on unmount
    const controller = new AbortController();
    const signal = controller.signal;

    try {
      const data = await apiRequest("/auth/me", { signal });

      setUser(data.user ?? null);
      setProfile(data.profile ?? null);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Failed to restore session:", error);
        clearAuth();
      }
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [clearAuth]);

  useEffect(() => {
    fetchUser();

    const handleUnauthorized = () => {
      clearAuth();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
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
      await fetchUser(); // Fetch full user/profile details immediately

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

export const useAuth = () => {
  return useContext(AuthContext);
};
