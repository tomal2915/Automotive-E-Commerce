import { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Alert,
  Chip,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPermissions } from "../features/permissions/permissionApi";
import {
  fetchRoles,
  createRoleRequest,
  updateRoleRequest,
  deleteRoleRequest,
  type Role,
} from "../features/roles/roleApi";
import PageTransition from "../components/PageTransition";

const ACTIONS = [
  "watch",
  "create",
  "read",
  "update",
  "delete",
  "upload",
  "write",
  "approve",
  "status",
];

const emptyForm = { name: "", description: "" };

export default function AdminRolesPage() {
  const queryClient = useQueryClient();
  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });
  const { data: permData } = useQuery({
    queryKey: ["permissions"],
    queryFn: fetchPermissions,
  });

  const [form, setForm] = useState(emptyForm);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(),
  );
  const [editingId, setEditingId] = useState<string | null>(null);

  const modules = permData ? Object.keys(permData.grouped) : [];

  const createRole = useMutation({
    mutationFn: () =>
      createRoleRequest({
        ...form,
        permissions: Array.from(selectedPermissions),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      resetForm();
    },
  });

  const updateRole = useMutation({
    mutationFn: (payload: { id: string; data: any }) =>
      updateRoleRequest(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      resetForm();
    },
  });

  const deleteRole = useMutation({
    mutationFn: deleteRoleRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
    onError: (err: any) =>
      alert(err?.response?.data?.message || "Delete failed"),
  });

  const resetForm = () => {
    setForm(emptyForm);
    setSelectedPermissions(new Set());
    setEditingId(null);
  };

  const startEdit = (role: Role) => {
    setEditingId(role._id);
    setForm({ name: role.name, description: role.description });
    setSelectedPermissions(new Set(role.permissions.map((p) => p._id)));
  };

  const findPermissionId = (module: string, action: string) =>
    permData?.grouped[module]?.find((p) => p.action === action)?._id;

  const togglePermission = (permId: string | undefined) => {
    if (!permId) return;
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const toggleModuleAll = (module: string) => {
    const modulePermIds = (permData?.grouped[module] || []).map((p) => p._id);
    const allSelected = modulePermIds.every((id) =>
      selectedPermissions.has(id),
    );
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      modulePermIds.forEach((id) =>
        allSelected ? next.delete(id) : next.add(id),
      );
      return next;
    });
  };

  const grantAll = () => {
    setSelectedPermissions(new Set(permData?.flat.map((p) => p._id) ?? []));
  };

  const handleSubmit = () => {
    const permissions = Array.from(selectedPermissions);
    if (editingId)
      updateRole.mutate({ id: editingId, data: { ...form, permissions } });
    else createRole.mutate();
  };

  const mutationError = (createRole.error || updateRole.error) as any;

  return (
    <PageTransition>
      <Container sx={{ py: { xs: 2, sm: 3, md: 4 } }} maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Manage Roles
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }} key={editingId ?? "new"}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {editingId ? "Edit Role" : "Create New Role"}
          </Typography>

          {mutationError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {mutationError?.response?.data?.message}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 5 }}>
              <TextField
                label="Role Name"
                fullWidth
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 7 }}>
              <TextField
                label="Description"
                fullWidth
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2">Permissions</Typography>
            <Button size="small" onClick={grantAll}>
              Grant All (Admin Shortcut)
            </Button>
          </Box>

          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Module</TableCell>
                  {ACTIONS.map((action) => (
                    <TableCell
                      key={action}
                      align="center"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {action}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {modules.map((module) => (
                  <TableRow key={module} hover>
                    <TableCell
                      sx={{
                        textTransform: "capitalize",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                      onClick={() => toggleModuleAll(module)}
                    >
                      {module}
                    </TableCell>
                    {ACTIONS.map((action) => {
                      const permId = findPermissionId(module, action);
                      return (
                        <TableCell key={action} align="center">
                          {permId ? (
                            <Checkbox
                              size="small"
                              checked={selectedPermissions.has(permId)}
                              onChange={() => togglePermission(permId)}
                            />
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!form.name}
            >
              {editingId ? "Save Changes" : "Create Role"}
            </Button>
            {editingId && (
              <Button sx={{ ml: 1 }} onClick={resetForm}>
                Cancel
              </Button>
            )}
          </Box>
        </Paper>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Users</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles?.map((role) => (
              <TableRow key={role._id}>
                <TableCell>{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>{role.userCount}</TableCell>
                <TableCell>
                  <Chip
                    label={`${role.permissions.length} permissions`}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => startEdit(role)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => deleteRole.mutate(role._id)}
                  >
                    <DeleteIcon fontSize="small" color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Container>
    </PageTransition>
  );
}
