import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginApi, registerApi } from "../services/auth.service";

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = "user";

function readUserFromStorage() {
  try {
    const rawUser = localStorage.getItem(AUTH_STORAGE_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    console.error("Không thể đọc thông tin đăng nhập:", error);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUserFromStorage);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  async function login(payload) {
    setLoading(true);

    try {
      const result = await loginApi(payload);

      const authUser = {
        ...result.user,
        token: result.token,
      };

      setUser(authUser);

      return authUser;
    } finally {
      setLoading(false);
    }
  }

  async function register(payload) {
    setLoading(true);

    try {
      const result = await registerApi(payload);

      const authUser = {
        ...result.user,
        token: result.token,
      };

      setUser(authUser);

      return authUser;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user?.token),
      token: user?.token || null,
      login,
      register,
      logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải được dùng bên trong AuthProvider");
  }

  return context;
}

export function useOptionalAuth() {
  return useContext(AuthContext);
}