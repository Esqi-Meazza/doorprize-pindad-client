import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute() {
  const token = localStorage.getItem("admin_token");

  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      localStorage.removeItem("admin_token");
      return <Navigate to="/admin" replace />;
    }

    return <Outlet />;
  } catch (error) {
    localStorage.removeItem("admin_token");
    return <Navigate to="/admin" replace />;
  }
}