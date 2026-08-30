import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

function parseJson(value, fallback = null) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function readJsonStorage(key, fallback = null) {
  return parseJson(localStorage.getItem(key), fallback);
}

export function AuthProvider({ children }) {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("admin_token"));
  const [user, setUser] = useState(() => readJsonStorage("user"));

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "admin_token") setAdminToken(event.newValue);
      if (event.key === "user") setUser(parseJson(event.newValue));
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = useMemo(() => ({
    adminToken,
    isAdminAuthenticated: Boolean(adminToken),
    user,
    isUserAuthenticated: Boolean(user),
    authHeaders: adminToken
      ? { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" },
    loginAdmin: (token) => {
      localStorage.setItem("admin_token", token);
      setAdminToken(token);
    },
    logoutAdmin: () => {
      localStorage.removeItem("admin_token");
      setAdminToken(null);
    },
    setUserSession: (nextUser) => {
      localStorage.setItem("user", JSON.stringify(nextUser));
      setUser(nextUser);
    },
    logoutUser: () => {
      localStorage.removeItem("user");
      localStorage.removeItem("hasRegistered");
      localStorage.removeItem("id_user");
      setUser(null);
    },
  }), [adminToken, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
