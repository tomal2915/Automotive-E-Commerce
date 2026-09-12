import Permission from "../models/Permission.js";
import Role from "../models/Role.js";

const STANDARD_ACTIONS = [
  "create",
  "read",
  "update",
  "delete",
  "watch",
  "upload",
  "write",
  "approve",
  "status",
];

// @route POST /api/v1/permissions/group (permission: permission:create)
// Creates a whole module's permissions in one step — naming the group
// "Product" and ticking Create/Read produces product:create, product:read
export const createPermissionGroup = async (req, res) => {
  try {
    const { module, actions, customActions = [] } = req.body;
    const moduleLower = module.toLowerCase().trim();

    const allActions = [
      ...new Set([
        ...actions.filter((a) => STANDARD_ACTIONS.includes(a)),
        ...customActions.map((a) => a.toLowerCase().trim()),
      ]),
    ];

    const created = await Promise.all(
      allActions.map((action) =>
        Permission.findOneAndUpdate(
          { name: `${moduleLower}:${action}` },
          {
            name: `${moduleLower}:${action}`,
            module: moduleLower,
            action,
            description: req.body.description || "",
          },
          { upsert: true, returnDocument: "after" },
        ),
      ),
    );

    res.status(201).json({ permissions: created });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Invalid permission group data", error: error.message });
  }
};

// @route GET /api/v1/permissions (permission: permission:watch)
// Returns permissions grouped by module, for the grid UI
export const getPermissions = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const filter = search ? { name: new RegExp(search, "i") } : {};

    const permissions = await Permission.find(filter).sort({
      module: 1,
      action: 1,
    });

    const grouped = permissions.reduce((acc, p) => {
      if (!acc[p.module]) acc[p.module] = [];
      acc[p.module].push(p);
      return acc;
    }, {});

    res.json({ grouped, flat: permissions });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route DELETE /api/v1/permissions/:id (permission: permission:delete)
export const deletePermission = async (req, res) => {
  try {
    // Cascade: pull this permission out of every role that holds it,
    // rather than leaving roles pointing at a deleted permission
    await Role.updateMany(
      { permissions: req.params.id },
      { $pull: { permissions: req.params.id } },
    );

    const permission = await Permission.findByIdAndDelete(req.params.id);
    if (!permission)
      return res.status(404).json({ message: "Permission not found" });

    res.json({ message: "Permission deleted and removed from all roles" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
