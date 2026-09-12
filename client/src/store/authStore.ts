import { create } from "zustand";
import type { AuthUser } from "../features/auth/authApi";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  permissions: string[];
  roleName: string | null;
  setUser: (user: AuthUser | null) => void;
  setPermissions: (permissions: string[], roleName: string | null) => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  permissions: [],
  roleName: null,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setPermissions: (permissions, roleName) => set({ permissions, roleName }),
  hasPermission: (permission) => get().permissions.includes(permission),
}));
