import { createContext, useContext, useState } from "react";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUser,
} from "../services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser());

  const login = (formData) => {
    const loggedUser = loginUser(formData);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = (formData) => {
    const registeredUser = registerUser(formData);
    setUser(registeredUser);
    return registeredUser;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const updateUserProfile = (userData) => {
    const updatedUser = updateUser(userData);
    setUser(updatedUser);
    return updatedUser;
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải được dùng bên trong AuthProvider");
  }

  return context;
}