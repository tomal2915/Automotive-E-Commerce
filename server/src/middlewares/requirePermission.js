export const requirePermission = (permissionName) => {
  return (req, res, next) => {
    const userPermissions = req.user?.permissions || [];
    if (!userPermissions.includes(permissionName)) {
      return res
        .status(403)
        .json({ message: "Forbidden — insufficient permissions" });
    }
    next();
  };
};
