import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// Wraps routes that require authentication.
// Redirects to /login if there's no logged-in user.
export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
