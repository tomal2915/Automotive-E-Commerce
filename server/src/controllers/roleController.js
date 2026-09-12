import Role from "../models/Role.js";
import User from "../models/User.js";
import Permission from "../models/Permission.js";

// @route GET /api/v1/roles (permission: role:watch)
export const getRoles = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = search ? { name: new RegExp(search, "i") } : {};

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Number(limit), 100);

    const roles = await Role.find(filter)
      .populate("permissions", "name module action")
      .sort({ name: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    const total = await Role.countDocuments(filter);

    // Show how many users hold each role — useful context in the list
    const withUserCounts = await Promise.all(
      roles.map(async (role) => ({
        ...role.toObject(),
        userCount: await User.countDocuments({ role: role._id }),
      })),
    );

    res.json({
      roles: withUserCounts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/v1/roles (permission: role:create)
export const createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    const role = await Role.create({
      name,
      description,
      permissions: permissions || [],
    });
    res.status(201).json({ role });
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(409)
        .json({ message: "A role with this name already exists" });
    res
      .status(400)
      .json({ message: "Invalid role data", error: error.message });
  }
};

// @route PUT /api/v1/roles/:id (permission: role:update)
export const updateRole = async (req, res) => {
  try {
    const { name, description, permissions, status } = req.body;

    // Guard: refuse a change that would leave nobody able to manage roles —
    // e.g. stripping role:update from the only role that has it
    if (permissions) {
      const roleUpdatePermission = await Permission.findOne({
        name: "role:update",
      });
      if (roleUpdatePermission) {
        const willStillHaveIt = permissions.includes(
          roleUpdatePermission._id.toString(),
        );
        if (!willStillHaveIt) {
          const currentRole = await Role.findById(req.params.id);
          const otherRolesWithIt = await Role.countDocuments({
            _id: { $ne: req.params.id },
            permissions: roleUpdatePermission._id,
          });
          const thisRoleCurrentlyHasIt = currentRole?.permissions.some(
            (p) => p.toString() === roleUpdatePermission._id.toString(),
          );

          if (thisRoleCurrentlyHasIt && otherRolesWithIt === 0) {
            return res.status(400).json({
              message:
                "Cannot remove role:update from the only role that has it — this would leave nobody able to manage roles.",
            });
          }
        }
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (status !== undefined) updateData.status = status;

    const role = await Role.findByIdAndUpdate(req.params.id, updateData, {
      returnDocument: "after",
      runValidators: true,
    }).populate("permissions", "name");
    if (!role) return res.status(404).json({ message: "Role not found" });

    res.json({ role });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid update data", error: error.message });
  }
};

// @route DELETE /api/v1/roles/:id (permission: role:delete)
export const deleteRole = async (req, res) => {
  try {
    const usersWithRole = await User.countDocuments({ role: req.params.id });
    if (usersWithRole > 0) {
      return res.status(409).json({
        message: `Cannot delete — ${usersWithRole} user(s) still hold this role.`,
      });
    }

    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json({ message: "Role deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/v1/roles/options
// Lightweight, non-paginated list for dropdowns/selects — no userCount,
// only active roles (a disabled/archived role shouldn't be assignable)
export const getRoleOptions = async (req, res) => {
  try {
    const roles = await Role.find({ status: "active" })
      .select("name")
      .sort({ name: 1 });

    res.json({ roles });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
