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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCategories } from "../features/categories/useCategories";
import {
  createCategoryRequest,
  deleteCategoryRequest,
} from "../features/categories/categoryApi";
import PageTransition from "../components/PageTransition";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();

  const [form, setForm] = useState({
    name: "",
    description: "",
    hasVehicleAttributes: false,
    parentCategory: "",
  });
  const [image, setImage] = useState<File | undefined>();

  const createCategory = useMutation({
    mutationFn: () => createCategoryRequest({ ...form, image }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setForm({
        name: "",
        description: "",
        hasVehicleAttributes: false,
        parentCategory: "",
      });
      setImage(undefined);
    },
  });

  const deleteCategory = useMutation({
    mutationFn: deleteCategoryRequest,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  return (
    <PageTransition>
      <Container sx={{ py: 4 }}>
        <Typography sx={{ variant: "h4", mb: 3 }}>Manage Categories</Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography sx={{ variant: "h6", mb: 2 }}>
            Add New Category
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
                label="Vehicle-based (Make/Model/Year)"
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
                {categories?.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <Button component="label" variant="outlined" size="small">
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0])}
                />
              </Button>
              {image && (
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {image.name}
                </Typography>
              )}
            </Grid>
            <Grid size={12}>
              <Button
                variant="contained"
                onClick={() => createCategory.mutate()}
                disabled={!form.name || createCategory.isPending}
              >
                {createCategory.isPending ? "Creating..." : "Create Category"}
              </Button>
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
                    image={cat.image}
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
                    <IconButton
                      size="small"
                      onClick={() => deleteCategory.mutate(cat._id)}
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
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
                        <Typography
                          key={sub._id}
                          sx={{
                            variant: "caption",
                            display: "block",
                            color: "text.secondary",
                          }}
                        >
                          └ {sub.name}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </PageTransition>
  );
}
