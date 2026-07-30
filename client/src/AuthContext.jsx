import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "./config/api";
import { AuthContext } from "../AuthContextObject";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    sessionStorage.removeItem("careconnect_token");
    setUser(null);
    setProfile(null);
  }, []);

  const fetchUser = useCallback(async () => {
    // DEV-ONLY: bypass real auth to preview dashboard UI while backend is down.
    // const mockRole = import.meta.env.VITE_MOCK_ROLE;
    // if (mockRole) {
    //   setUser({
    //     id: "mock-user-id",
    //     first_name: "Preview",
    //     last_name: mockRole.charAt(0).toUpperCase() + mockRole.slice(1),
    //     email: `preview.${mockRole}@careconnect.test`,
    //     role: mockRole,
    //   });
    //   setProfile({ id: "mock-profile-id", phone: "+2348000000000" });
    //   setLoading(false);
    //   return;
    // }
    ///////////////////////////////////////////////////////////////////////

    const token = sessionStorage.getItem("careconnect_token");

    if (!token) {
      clearAuth();
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest("/auth/me");
      setUser(data.user ?? null);
      setProfile(data.profile ?? null);
    } catch (error) {
      console.error("Failed to restore session:", error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [clearAuth]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount to restore session from stored token
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
      await fetchUser();

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
