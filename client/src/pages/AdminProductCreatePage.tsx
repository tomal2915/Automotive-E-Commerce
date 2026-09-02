import { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Box,
  Alert,
  IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createProductRequest } from "../features/products/productAdminApi";

export default function AdminProductCreatePage() {
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    partNumber: "",
    make: "",
    model: "",
    yearRangeStart: "",
    yearRangeEnd: "",
    category: "",
    price: "",
    stock: "",
  });

  const mutation = useMutation({
    mutationFn: createProductRequest,
    onSuccess: () => navigate("/"),
  });

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [field]: e.target.value });
    };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (images.length + files.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      yearRangeStart: Number(form.yearRangeStart),
      yearRangeEnd: Number(form.yearRangeEnd),
      price: Number(form.price),
      stock: Number(form.stock),
      images,
    });
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" mb={3}>
        Add New Product
      </Typography>

      {mutation.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(mutation.error as any)?.response?.data?.message ||
            "Failed to create product"}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Title"
                fullWidth
                required
                value={form.title}
                onChange={handleChange("title")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Part Number"
                fullWidth
                required
                value={form.partNumber}
                onChange={handleChange("partNumber")}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Description"
                fullWidth
                required
                multiline
                rows={3}
                value={form.description}
                onChange={handleChange("description")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Make"
                fullWidth
                required
                value={form.make}
                onChange={handleChange("make")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Model"
                fullWidth
                required
                value={form.model}
                onChange={handleChange("model")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Category"
                fullWidth
                required
                value={form.category}
                onChange={handleChange("category")}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="Year From"
                type="number"
                fullWidth
                required
                value={form.yearRangeStart}
                onChange={handleChange("yearRangeStart")}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="Year To"
                type="number"
                fullWidth
                required
                value={form.yearRangeEnd}
                onChange={handleChange("yearRangeEnd")}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="Price"
                type="number"
                fullWidth
                required
                value={form.price}
                onChange={handleChange("price")}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="Stock"
                type="number"
                fullWidth
                required
                value={form.stock}
                onChange={handleChange("stock")}
              />
            </Grid>

            <Grid size={12}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
              >
                Upload Images (max 5)
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </Button>

              <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                {previews.map((src, i) => (
                  <Box key={i} sx={{ position: "relative" }}>
                    <img
                      src={src}
                      alt={`preview-${i}`}
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeImage(i)}
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        bgcolor: "background.paper",
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid size={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Creating..." : "Create Product"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}
