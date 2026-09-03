import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
  const { adminToken: token, logoutAdmin } = useAuth();

  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      logoutAdmin();
      return <Navigate to="/admin" replace />;
    }

    return <Outlet />;
  } catch {
    logoutAdmin();
    return <Navigate to="/admin" replace />;
  }
}