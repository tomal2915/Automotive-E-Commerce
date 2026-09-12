import { useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  IconButton,
  Chip,
  Select,
  MenuItem,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllUsers,
  fetchRoleOptions,
  deleteUserRequest,
  updateUserRoleRequest,
} from "../features/users/userAdminApi";
import { useAuthStore } from "../store/authStore";
import PageTransition from "../components/PageTransition";

export default function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: () => fetchAllUsers({ page: page + 1, limit: 20, search }),
  });

  const { data: roleOptions, isError: roleOptionsError } = useQuery({
    queryKey: ["role-options"],
    queryFn: fetchRoleOptions,
  });

  const deleteUser = useMutation({
    mutationFn: deleteUserRequest,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const changeRole = useMutation({
    mutationFn: ({ id, roleId }: { id: string; roleId: string }) =>
      updateUserRoleRequest(id, roleId),
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

  const handleRoleChange = (
    id: string,
    newRoleId: string,
    newRoleName: string,
    name: string,
  ) => {
    if (window.confirm(`Change "${name}"'s role to "${newRoleName}"?`)) {
      changeRole.mutate({ id, roleId: newRoleId });
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
      headerName: "Role",
      width: 180,
      renderCell: (params) => {
        const isSelf = params.row._id === currentUser?.id;
        const currentRoleId = params.row.role?._id ?? "";

        if (roleOptionsError) {
          return (
            <Chip label="Failed to load roles" size="small" color="error" />
          );
        }

        if (!roleOptions) {
          return <CircularProgress size={18} />;
        }

        return (
          <Tooltip title={isSelf ? "You can't change your own role" : ""}>
            <span style={{ width: "100%" }}>
              <Select
                size="small"
                fullWidth
                value={currentRoleId}
                disabled={isSelf || changeRole.isPending}
                onChange={(e) => {
                  const selected = roleOptions.roles.find(
                    (r) => r._id === e.target.value,
                  );
                  if (selected) {
                    handleRoleChange(
                      params.row._id,
                      selected._id,
                      selected.name,
                      params.row.name,
                    );
                  }
                }}
              >
                {roleOptions.roles.map((r) => (
                  <MenuItem key={r._id} value={r._id}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
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
    <PageTransition>
      <Container sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Typography sx={{ variant: "h4", mb: 3 }}>Manage Users</Typography>

        <TextField
          placeholder="Search by name or email..."
          size="small"
          fullWidth
          sx={{ mb: 2, maxWidth: 400 }}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />

        <Box sx={{ height: 600, width: "100%", overflowX: "auto" }}>
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
    </PageTransition>
  );
}
