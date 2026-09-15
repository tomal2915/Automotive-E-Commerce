// The single source of truth for "what a user object looks like when
// sent to the client." Every place that returns user data — login,
// session, profile, admin user list — should build its response through
// this function, instead of hand-picking fields ad hoc (which is how
// a password hash or refreshTokens array eventually leaks by accident).
export const toUserDTO = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role:
    typeof user.role === "object"
      ? { id: user.role._id, name: user.role.name }
      : user.role,
  avatar: user.avatar || "",
  phone: user.phone || "",
  address: user.address || null,
  isEmailVerified: user.isEmailVerified,
  twoFactorEnabled: user.twoFactorEnabled,
  createdAt: user.createdAt,
});

// A lighter DTO for admin list views — omits address/phone (not needed
// in a table row), includes fields an admin specifically needs
export const toAdminUserListDTO = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role?.name || user.role,
  isEmailVerified: user.isEmailVerified,
  createdAt: user.createdAt,
});

// DTO for the auth session/login response — deliberately the MINIMUM
// needed by the frontend, nothing more
export const toAuthSessionDTO = (user, permissions, roleName) => ({
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || "",
  },
  role: { name: roleName },
  permissions,
});
