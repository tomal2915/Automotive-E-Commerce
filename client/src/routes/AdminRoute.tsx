import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// Only lets admin users through — everyone else is redirected home
export default function AdminRoute() {
  const user = useAuthStore((state) => state.user);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return <Outlet />;
}
