import { createContext, useCallback, useEffect, useState } from "react";
import { apiRequest } from "../config/api";
import { TOKEN_SESSION_STORAGE_KEY } from "../lib/constants";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = sessionStorage.getItem(TOKEN_SESSION_STORAGE_KEY);
    if (token) {
      try {
        const data = await apiRequest("/auth/me");
        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        sessionStorage.removeItem(TOKEN_SESSION_STORAGE_KEY);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    const { token, user: loggedInUser } = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    sessionStorage.setItem(TOKEN_SESSION_STORAGE_KEY, token);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = () => {
    sessionStorage.removeItem(TOKEN_SESSION_STORAGE_KEY);
    setUser(null);
    // Optional: Call backend logout endpoint if it does any state cleanup
    apiRequest("/auth/logout", { method: "POST" }).catch(console.error);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
