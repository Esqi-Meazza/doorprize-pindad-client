import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

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
  const [hasRegistered, setHasRegistered] = useState(
    () => localStorage.getItem("hasRegistered") === "true",
  );
  const [userId, setUserId] = useState(() => localStorage.getItem("id_user"));

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "admin_token") setAdminToken(event.newValue);
      if (event.key === "user") setUser(parseJson(event.newValue));
      if (event.key === "hasRegistered") setHasRegistered(event.newValue === "true");
      if (event.key === "id_user") setUserId(event.newValue);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const loginAdmin = useCallback((token) => {
    localStorage.setItem("admin_token", token);
    setAdminToken(token);
  }, []);

  const logoutAdmin = useCallback(() => {
    localStorage.removeItem("admin_token");
    setAdminToken(null);
  }, []);

  const setUserSession = useCallback((nextUser) => {
    localStorage.setItem("user", JSON.stringify(nextUser));
    if (nextUser?.id_user != null) localStorage.setItem("id_user", nextUser.id_user);
    setUser(nextUser);
  }, []);

  const registerUser = useCallback((nextUser) => {
    localStorage.setItem("user", JSON.stringify(nextUser));
    localStorage.setItem("hasRegistered", "true");
    if (nextUser?.id_user != null) localStorage.setItem("id_user", nextUser.id_user);
    setUser(nextUser);
    setHasRegistered(true);
    setUserId(nextUser?.id_user != null ? String(nextUser.id_user) : null);
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("hasRegistered");
    localStorage.removeItem("id_user");
    setUser(null);
    setHasRegistered(false);
    setUserId(null);
  }, []);

  const value = useMemo(() => ({
    adminToken,
    isAdminAuthenticated: Boolean(adminToken),
    user,
    isUserAuthenticated: Boolean(user),
    hasRegistered,
    userId,
    authHeaders: adminToken
      ? { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" },
    loginAdmin,
    logoutAdmin,
    setUserSession,
    registerUser,
    logoutUser,
  }), [
    adminToken,
    user,
    hasRegistered,
    userId,
    loginAdmin,
    logoutAdmin,
    setUserSession,
    registerUser,
    logoutUser,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
