import React, { createContext, useState, useEffect, useCallback } from "react";
import { apiRequest } from "./config/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = sessionStorage.getItem("careconnect_token");
    if (!token) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest("/auth/me");
      setUser(data.user);
      setProfile(data.profile || null);
    } catch (err) {
      console.error("Session restoration failed:", err.message);
      sessionStorage.removeItem("careconnect_token");
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    const handleUnauthorized = () => {
      setUser(null);
      setProfile(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [fetchUser]);

  const login = async (email, password) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    sessionStorage.setItem("careconnect_token", data.token);
    setUser(data.user);
    await fetchUser();
    return data;
  };

  const logout = async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      sessionStorage.removeItem("careconnect_token");
      setUser(null);
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, login, logout, refreshUser: fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
