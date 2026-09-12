import { useAuthStore } from "../store/authStore";

export const usePermission = (permissionName: string): boolean => {
  const permissions = useAuthStore((state) => state.permissions);
  return permissions.includes(permissionName);
};

// Convenience — check multiple at once (e.g. "show this menu if ANY of these")
export const useAnyPermission = (permissionNames: string[]): boolean => {
  const permissions = useAuthStore((state) => state.permissions);
  return permissionNames.some((p) => permissions.includes(p));
};
