import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// Lets any user with dashboard access through — everyone else is redirected home
export default function AdminRoute() {
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);

  if (!user) return <Navigate to="/login" replace />;
  if (!permissions?.includes("dashboard:watch"))
    return <Navigate to="/" replace />;

  return <Outlet />;
}
