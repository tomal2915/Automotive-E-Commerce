import { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Box,
  MenuItem,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Alert,
  Avatar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useBrands } from "../features/brands/useBrands";
import {
  createBrandRequest,
  updateBrandRequest,
  deleteBrandRequest,
  type Brand,
} from "../features/brands/brandApi";
import MediaPicker from "../features/media/MediaPicker"; // built in Step 60
import PageTransition from "../components/PageTransition";
import { usePermission } from "../hooks/usePermission";

const emptyForm = {
  name: "",
  description: "",
  status: "active" as "active" | "inactive",
  logo: "",
};

export default function AdminBrandsPage() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { data: brands } = useBrands();

  const canCreate = usePermission("brand:create");
  const canUpdate = usePermission("brand:update");
  const canDelete = usePermission("brand:delete");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [logoPreview, setLogoPreview] = useState<{ url: string } | null>(null);

  const createBrand = useMutation({
    mutationFn: () => createBrandRequest(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      enqueueSnackbar("Brand created successfully", { variant: "success" });
      setForm(emptyForm);
      setLogoPreview(null);
    },
    onError: (err: any) =>
      enqueueSnackbar(
        err?.response?.data?.message || "Failed to create brand",
        { variant: "error" },
      ),
  });

  const updateBrand = useMutation({
    mutationFn: (payload: { id: string; data: typeof form }) =>
      updateBrandRequest(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      enqueueSnackbar("Brand updated successfully", { variant: "success" });
      setEditingId(null);
      setForm(emptyForm);
      setLogoPreview(null);
    },
    onError: (err: any) =>
      enqueueSnackbar(
        err?.response?.data?.message || "Failed to update brand",
        { variant: "error" },
      ),
  });

  const deleteBrand = useMutation({
    mutationFn: deleteBrandRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      enqueueSnackbar("Brand deleted successfully", { variant: "success" });
    },
    onError: (err: any) =>
      enqueueSnackbar(
        err?.response?.data?.message || "Failed to delete brand",
        {
          variant: "error",
        },
      ),
  });

  const startEdit = (brand: Brand) => {
    setEditingId(brand._id);
    setForm({
      name: brand.name,
      description: brand.description,
      status: brand.status,
      logo: brand.logo?._id ?? "",
    });
    setLogoPreview(
      brand.logo ? { url: brand.logo.thumbnailUrl || brand.logo.url } : null,
    );
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setLogoPreview(null);
  };

  const handleSubmit = () => {
    if (editingId) updateBrand.mutate({ id: editingId, data: form });
    else createBrand.mutate();
  };

  const mutationError = (createBrand.error || updateBrand.error) as any;

  return (
    <PageTransition>
      <Container sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Manage Brands
        </Typography>

        {(canCreate || canUpdate) && (
          <Paper sx={{ p: 3, mb: 4 }} key={editingId ?? "new"}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {editingId ? "Edit Brand" : "Add New Brand"}
            </Typography>

            {mutationError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {mutationError?.response?.data?.message ||
                  "Something went wrong"}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Brand Name"
                  fullWidth
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5 }}>
                <TextField
                  label="Description"
                  fullWidth
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  select
                  label="Status"
                  fullWidth
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as "active" | "inactive",
                    })
                  }
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
              <Grid size={12}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setPickerOpen(true)}
                  >
                    {logoPreview ? "Change Logo" : "Pick Logo from Library"}
                  </Button>
                  {logoPreview && (
                    <Avatar
                      src={logoPreview.url}
                      variant="rounded"
                      sx={{ width: 48, height: 48 }}
                    />
                  )}
                </Box>
              </Grid>
              <Grid size={12}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={
                    !form.name ||
                    createBrand.isPending ||
                    updateBrand.isPending ||
                    (editingId ? !canUpdate : !canCreate)
                  }
                >
                  {editingId ? "Save Changes" : "Create Brand"}
                </Button>
                {editingId && (
                  <Button sx={{ ml: 1 }} onClick={cancelEdit}>
                    Cancel
                  </Button>
                )}
              </Grid>
            </Grid>
          </Paper>
        )}

        <Grid container spacing={2}>
          {brands?.map((brand) => (
            <Grid key={brand._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                {brand.logo && (
                  <CardMedia
                    component="img"
                    height="100"
                    image={brand.logo.url}
                    alt={brand.name}
                    sx={{ objectFit: "contain", bgcolor: "background.default" }}
                  />
                )}
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1">{brand.name}</Typography>
                      <Typography
                        variant="caption"
                        color={
                          brand.status === "active"
                            ? "success.main"
                            : "text.secondary"
                        }
                      >
                        {brand.status}
                      </Typography>
                    </Box>
                    <Box>
                      {canUpdate && (
                        <IconButton
                          size="small"
                          onClick={() => startEdit(brand)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {canDelete && (
                        <IconButton
                          size="small"
                          onClick={() => deleteBrand.mutate(brand._id)}
                        >
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <MediaPicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={(media) => {
            setForm({ ...form, logo: media._id });
            setLogoPreview({ url: media.thumbnailUrl || media.url });
            setPickerOpen(false);
          }}
        />
      </Container>
    </PageTransition>
  );
}
