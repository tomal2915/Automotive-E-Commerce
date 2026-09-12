import { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Box,
  FormControlLabel,
  Switch,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  MenuItem,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useCategories } from "../features/categories/useCategories";
import {
  createCategoryRequest,
  updateCategoryRequest,
  deleteCategoryRequest,
  type Category,
} from "../features/categories/categoryApi";
import MediaPicker from "../features/media/MediaPicker";
import type { MediaItem } from "../features/media/mediaApi";
import PageTransition from "../components/PageTransition";

const emptyForm = {
  name: "",
  description: "",
  hasVehicleAttributes: false,
  parentCategory: "",
};

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();
  const { enqueueSnackbar } = useSnackbar();

  const [form, setForm] = useState(emptyForm);
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null); // newly picked
  const [existingImage, setExistingImage] = useState<Category["image"]>(null); // currently saved
  const [removeImage, setRemoveImage] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const createCategory = useMutation({
    mutationFn: () =>
      createCategoryRequest({ ...form, image: selectedImage?._id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      enqueueSnackbar("Category created successfully", { variant: "success" });
      setForm(emptyForm);
      setSelectedImage(null);
    },
    onError: (err: any) =>
      enqueueSnackbar(
        err?.response?.data?.message || "Failed to create category",
        { variant: "error" },
      ),
  });

  const updateCategory = useMutation({
    mutationFn: (payload: {
      id: string;
      data: typeof form & { image?: string | null; removeImage?: boolean };
    }) => updateCategoryRequest(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      enqueueSnackbar("Category updated successfully", { variant: "success" });
      setEditingId(null);
      setForm(emptyForm);
      setSelectedImage(null);
      setExistingImage(null);
      setRemoveImage(false);
    },
    onError: (err: any) =>
      enqueueSnackbar(
        err?.response?.data?.message || "Failed to update category",
        { variant: "error" },
      ),
  });

  const deleteCategory = useMutation({
    mutationFn: deleteCategoryRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      enqueueSnackbar("Category deleted successfully", { variant: "success" });
    },
    onError: (err: any) =>
      enqueueSnackbar(
        err?.response?.data?.message || "Failed to delete category",
        { variant: "error" },
      ),
  });

  const startEdit = (cat: Category) => {
    setEditingId(cat._id);
    setForm({
      name: cat.name,
      description: cat.description || "",
      hasVehicleAttributes: cat.hasVehicleAttributes,
      parentCategory: cat.parentCategory || "",
    });
    setSelectedImage(null);
    setExistingImage(cat.image);
    setRemoveImage(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedImage(null);
    setExistingImage(null);
    setRemoveImage(false);
  };

  const handleSubmit = () => {
    if (editingId) {
      updateCategory.mutate({
        id: editingId,
        data: { ...form, image: selectedImage?._id, removeImage },
      });
    } else {
      createCategory.mutate();
    }
  };

  const parentOptions = categories?.filter((c) => c._id !== editingId) ?? [];

  const displayImage = selectedImage
    ? { url: selectedImage.thumbnailUrl || selectedImage.url }
    : !removeImage && existingImage
      ? { url: existingImage.thumbnailUrl || existingImage.url }
      : null;

  return (
    <PageTransition>
      <Container sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Manage Categories
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }} key={editingId ?? "new"}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {editingId ? "Edit Category" : "Add New Category"}
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Category Name"
                fullWidth
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Description"
                fullWidth
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.hasVehicleAttributes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        hasVehicleAttributes: e.target.checked,
                      })
                    }
                  />
                }
                label="Vehicle-based"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                select
                label="Parent Category (optional)"
                fullWidth
                value={form.parentCategory}
                onChange={(e) =>
                  setForm({ ...form, parentCategory: e.target.value })
                }
              >
                <MenuItem value="">None (Top-level)</MenuItem>
                {parentOptions.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={12}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setPickerOpen(true)}
              >
                Choose Image
              </Button>

              {displayImage && (
                <Box
                  sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Box
                    component="img"
                    src={displayImage.url}
                    alt="Category"
                    sx={{
                      width: 60,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                  <Button
                    size="small"
                    color="error"
                    onClick={() => {
                      setSelectedImage(null);
                      setRemoveImage(true);
                    }}
                  >
                    Remove Image
                  </Button>
                </Box>
              )}

              {removeImage && !selectedImage && (
                <Box
                  sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Typography variant="caption" color="error">
                    Image will be removed on save.
                  </Typography>
                  <Button size="small" onClick={() => setRemoveImage(false)}>
                    Undo
                  </Button>
                </Box>
              )}
            </Grid>

            <Grid size={12}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={
                  !form.name ||
                  createCategory.isPending ||
                  updateCategory.isPending
                }
              >
                {editingId
                  ? updateCategory.isPending
                    ? "Saving..."
                    : "Save Changes"
                  : createCategory.isPending
                    ? "Creating..."
                    : "Create Category"}
              </Button>
              {editingId && (
                <Button sx={{ ml: 1 }} onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={2}>
          {categories?.map((cat) => (
            <Grid key={cat._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                {cat.image && (
                  <CardMedia
                    component="img"
                    height="120"
                    image={cat.image.thumbnailUrl || cat.image.url}
                    alt={cat.name}
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
                      <Typography variant="subtitle1">{cat.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cat.hasVehicleAttributes
                          ? "Vehicle-based category"
                          : "Standard category"}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => startEdit(cat)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => deleteCategory.mutate(cat._id)}
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Box>
                  </Box>

                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <Box
                      sx={{
                        mt: 1,
                        pl: 1,
                        borderLeft: 2,
                        borderColor: "divider",
                      }}
                    >
                      {cat.subcategories.map((sub) => (
                        <Box
                          key={sub._id}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                          >
                            └ {sub.name}
                          </Typography>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => startEdit(sub)}
                            >
                              <EditIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => deleteCategory.mutate(sub._id)}
                            >
                              <DeleteIcon sx={{ fontSize: 14 }} color="error" />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <MediaPicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={(media) => {
            setSelectedImage(media);
            setRemoveImage(false);
            setPickerOpen(false);
          }}
        />
      </Container>
    </PageTransition>
  );
}
