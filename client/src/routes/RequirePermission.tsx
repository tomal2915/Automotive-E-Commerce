import { Navigate, Outlet } from "react-router-dom";
import { usePermission } from "../hooks/usePermission";

interface Props {
  permission: string;
}

// Wraps a route (or group of routes) so navigating there directly by URL
// also respects permissions — not just the sidebar hiding the link.
export default function RequirePermission({ permission }: Props) {
  const hasPermission = usePermission(permission);

  if (!hasPermission) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}
