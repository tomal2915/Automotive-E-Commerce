import { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Box,
  Checkbox,
  FormControlLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchPermissions,
  createPermissionGroupRequest,
  deletePermissionRequest,
} from "../features/permissions/permissionApi";
import PageTransition from "../components/PageTransition";

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

export default function AdminPermissionsPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["permissions"],
    queryFn: fetchPermissions,
  });

  const [moduleName, setModuleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [customAction, setCustomAction] = useState("");

  const createGroup = useMutation({
    mutationFn: () =>
      createPermissionGroupRequest({
        module: moduleName,
        actions: selectedActions,
        customActions: customAction ? [customAction] : [],
        description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      setModuleName("");
      setDescription("");
      setSelectedActions([]);
      setCustomAction("");
    },
  });

  const deletePermission = useMutation({
    mutationFn: deletePermissionRequest,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["permissions"] }),
  });

  const toggleAction = (action: string) => {
    setSelectedActions((prev) =>
      prev.includes(action)
        ? prev.filter((a) => a !== action)
        : [...prev, action],
    );
  };

  return (
    <PageTransition>
      <Container sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Manage Permissions
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Create Permission Group
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 5 }}>
              <TextField
                label="Group Name (Module Name)"
                fullWidth
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 7 }}>
              <TextField
                label="Description"
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
            <Grid size={12}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Permissions
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {STANDARD_ACTIONS.map((action) => (
                  <FormControlLabel
                    key={action}
                    control={
                      <Checkbox
                        checked={selectedActions.includes(action)}
                        onChange={() => toggleAction(action)}
                      />
                    }
                    label={action.charAt(0).toUpperCase() + action.slice(1)}
                  />
                ))}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Custom Permission (optional)"
                fullWidth
                placeholder="e.g. export"
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value)}
              />
            </Grid>
            <Grid size={12}>
              <Button
                variant="contained"
                onClick={() => createGroup.mutate()}
                disabled={
                  !moduleName || (selectedActions.length === 0 && !customAction)
                }
              >
                Create
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {data &&
          Object.entries(data.grouped).map(([module, permissions]) => (
            <Box key={module} sx={{ mb: 3 }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, textTransform: "capitalize" }}
              >
                {module}
              </Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ width: "100%" }}>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {permissions.map((p) => (
                          <Chip
                            key={p._id}
                            label={p.name}
                            onDelete={() => deletePermission.mutate(p._id)}
                            deleteIcon={<DeleteIcon />}
                          />
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          ))}
      </Container>
    </PageTransition>
  );
}
