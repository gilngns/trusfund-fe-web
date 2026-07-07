import { createContext, useContext, useState } from "react";
import { authApi } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("nx_user");
    return raw ? JSON.parse(raw) : null;
  });

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    if (data.user.role !== "DINSOS" && data.user.role !== "ADMIN" && data.user.role !== "FOUNDATION") {
      throw new Error("Akun ini tidak memiliki akses ke dashboard.");
    }
    localStorage.setItem("nx_token", data.token);
    localStorage.setItem("nx_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("nx_token");
    localStorage.removeItem("nx_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus di dalam AuthProvider");
  return ctx;
}
