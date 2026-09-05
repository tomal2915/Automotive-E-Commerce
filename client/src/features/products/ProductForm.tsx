import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Grid,
  Paper,
  Box,
  Alert,
  IconButton,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Product } from "./productTypes";

export interface ProductFormValues {
  title: string;
  description: string;
  partNumber: string;
  make: string;
  model: string;
  yearRangeStart: string;
  yearRangeEnd: string;
  category: string;
  price: string;
  stock: string;
}

interface Props {
  initialProduct?: Product; // present when editing, absent when creating
  onSubmit: (values: ProductFormValues, images: File[]) => void;
  isSubmitting: boolean;
  errorMessage?: string;
  submitLabel: string;
}

// Shared form used by both the "create product" and "edit product" pages,
// so the two flows never drift out of sync with each other.
export default function ProductForm({
  initialProduct,
  onSubmit,
  isSubmitting,
  errorMessage,
  submitLabel,
}: Props) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(initialProduct?.images ?? []);

  const [form, setForm] = useState<ProductFormValues>({
    title: initialProduct?.title ?? "",
    description: initialProduct?.description ?? "",
    partNumber: initialProduct?.partNumber ?? "",
    make: initialProduct?.make ?? "",
    model: initialProduct?.model ?? "",
    yearRangeStart: initialProduct ? String(initialProduct.yearRange.start) : "",
    yearRangeEnd: initialProduct ? String(initialProduct.yearRange.end) : "",
    category: initialProduct?.category ?? "",
    price: initialProduct ? String(initialProduct.price) : "",
    stock: initialProduct ? String(initialProduct.stock) : "",
  });

  // If initialProduct arrives after the first render (e.g. still loading
  // when the form first mounts), sync the form once it's available
  useEffect(() => {
    if (initialProduct) {
      setForm({
        title: initialProduct.title,
        description: initialProduct.description,
        partNumber: initialProduct.partNumber,
        make: initialProduct.make,
        model: initialProduct.model,
        yearRangeStart: String(initialProduct.yearRange.start),
        yearRangeEnd: String(initialProduct.yearRange.end),
        category: initialProduct.category,
        price: String(initialProduct.price),
        stock: String(initialProduct.stock),
      });
      setPreviews(initialProduct.images ?? []);
    }
  }, [initialProduct]);

  const handleChange = (field: keyof ProductFormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (previews.length + files.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (index: number) => {
    // Only new (File-backed) previews are removable from the `images` array;
    // existing product images are just visually removed from the preview list
    const newImageStartIndex = previews.length - images.length;
    if (index >= newImageStartIndex) {
      setImages((prev) => prev.filter((_, i) => i !== index - newImageStartIndex));
    }
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form, images);
  };

  return (
    <Paper sx={{ p: 3 }}>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Title" fullWidth required value={form.title} onChange={handleChange("title")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Part Number" fullWidth required value={form.partNumber} onChange={handleChange("partNumber")} />
          </Grid>
          <Grid size={12}>
            <TextField label="Description" fullWidth required multiline rows={3} value={form.description} onChange={handleChange("description")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Make" fullWidth required value={form.make} onChange={handleChange("make")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Model" fullWidth required value={form.model} onChange={handleChange("model")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Category" fullWidth required value={form.category} onChange={handleChange("category")} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField label="Year From" type="number" fullWidth required value={form.yearRangeStart} onChange={handleChange("yearRangeStart")} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField label="Year To" type="number" fullWidth required value={form.yearRangeEnd} onChange={handleChange("yearRangeEnd")} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField label="Price" type="number" fullWidth required value={form.price} onChange={handleChange("price")} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField label="Stock" type="number" fullWidth required value={form.stock} onChange={handleChange("stock")} />
          </Grid>

          <Grid size={12}>
            <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
              Upload Images (max 5)
              <input type="file" hidden multiple accept="image/*" onChange={handleImageSelect} />
            </Button>

            {previews.length > 0 && (
              <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
                {previews.map((src, i) => (
                  <Box key={i} sx={{ position: "relative" }}>
                    <img
                      src={src}
                      alt={`preview-${i}`}
                      style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 4 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeImage(i)}
                      sx={{ position: "absolute", top: -8, right: -8, bgcolor: "background.paper" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}

            {initialProduct && images.length === 0 && (
              <Typography sx={{ variant: "caption", color: "text.secondary", display: "block", mt: 1 }}>
                Uploading new images will replace all existing ones.
              </Typography>
            )}
          </Grid>

          <Grid size={12}>
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}