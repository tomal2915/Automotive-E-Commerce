import { useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  IconButton,
  Chip,
  Switch,
  Tooltip,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllUsers,
  deleteUserRequest,
  updateUserRoleRequest,
} from "../features/users/userAdminApi";
import { useAuthStore } from "../store/authStore";

export default function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: () => fetchAllUsers({ page: page + 1, limit: 20, search }),
  });

  const deleteUser = useMutation({
    mutationFn: deleteUserRequest,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const toggleRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: "user" | "admin" }) =>
      updateUserRoleRequest(id, role),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const handleDelete = (id: string, name: string) => {
    if (
      window.confirm(
        `Delete user "${name}"? This will remove their cart, wishlist, and addresses. This cannot be undone.`,
      )
    ) {
      deleteUser.mutate(id);
    }
  };

  const handleRoleToggle = (
    id: string,
    currentRole: "user" | "admin",
    name: string,
  ) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const confirmMsg =
      newRole === "admin"
        ? `Make "${name}" an admin? They will get full access to manage products, orders, coupons, and users.`
        : `Remove admin access from "${name}"?`;

    if (window.confirm(confirmMsg)) {
      toggleRole.mutate({ id, role: newRole });
    }
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.5 },
    {
      field: "isEmailVerified",
      headerName: "Verified",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Verified" : "Unverified"}
          size="small"
          color={params.value ? "success" : "default"}
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Joined",
      width: 120,
      valueFormatter: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      field: "role",
      headerName: "Admin Access",
      width: 150,
      renderCell: (params) => {
        const isSelf = params.row._id === currentUser?.id;
        return (
          <Tooltip title={isSelf ? "You can't change your own role" : ""}>
            <span>
              <Switch
                checked={params.row.role === "admin"}
                disabled={isSelf}
                onChange={() =>
                  handleRoleToggle(
                    params.row._id,
                    params.row.role,
                    params.row.name,
                  )
                }
              />
            </span>
          </Tooltip>
        );
      },
    },
    {
      field: "actions",
      headerName: "Delete",
      width: 90,
      sortable: false,
      renderCell: (params) => {
        const isSelf = params.row._id === currentUser?.id;
        return (
          <Tooltip title={isSelf ? "You can't delete your own account" : ""}>
            <span>
              <IconButton
                size="small"
                disabled={isSelf}
                onClick={() => handleDelete(params.row._id, params.row.name)}
              >
                <DeleteIcon
                  fontSize="small"
                  color={isSelf ? "disabled" : "error"}
                />
              </IconButton>
            </span>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Typography sx={{ variant: "h4", mb: 3 }}>Manage Users</Typography>

      <TextField
        placeholder="Search by name or email..."
        size="small"
        fullWidth
        sx={{ mb: 2, maxWidth: 400 }}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0); // reset to first page on new search
        }}
      />

      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={data?.users ?? []}
          columns={columns}
          getRowId={(row) => row._id}
          loading={isLoading}
          paginationMode="server"
          rowCount={data?.pagination.total ?? 0}
          paginationModel={{ page, pageSize: 20 }}
          onPaginationModelChange={(model) => setPage(model.page)}
          pageSizeOptions={[20]}
          disableRowSelectionOnClick
        />
      </Box>
    </Container>
  );
}
