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
  MenuItem,
  Chip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { Switch, FormControlLabel } from "@mui/material";
import VariantBuilder, { type VariantRow } from "./VariantBuilder";
import { useCategories } from "../categories/useCategories";
import { useBrands } from "../brands/useBrands";
import type { Product } from "./productTypes";

export interface ProductFormValues {
  title: string;
  description: string;
  sku: string;
  category: string;
  brand: string;
  make: string;
  model: string;
  yearRangeStart: string;
  yearRangeEnd: string;
  price: string;
  stock: string;
}

interface Props {
  initialProduct?: Product;
  onSubmit: (
    values: ProductFormValues,
    images: File[],
    specifications: Record<string, string>,
  ) => void;
  isSubmitting: boolean;
  errorMessage?: string;
  submitLabel: string;
}

export default function ProductForm({
  initialProduct,
  onSubmit,
  isSubmitting,
  errorMessage,
  submitLabel,
}: Props) {
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(
    initialProduct?.images ?? [],
  );

  const [hasVariants, setHasVariants] = useState(
    initialProduct?.hasVariants ?? false,
  );
  const [variants, setVariants] = useState<VariantRow[]>([]);

  const [form, setForm] = useState<ProductFormValues>({
    title: initialProduct?.title ?? "",
    description: initialProduct?.description ?? "",
    sku: initialProduct?.sku ?? "",
    category: initialProduct?.category ?? "",
    brand: initialProduct?.brand ?? "",
    make: initialProduct?.make ?? "",
    model: initialProduct?.model ?? "",
    yearRangeStart: initialProduct?.yearRange
      ? String(initialProduct.yearRange.start)
      : "",
    yearRangeEnd: initialProduct?.yearRange
      ? String(initialProduct.yearRange.end)
      : "",
    price: initialProduct ? String(initialProduct.price) : "",
    stock: initialProduct ? String(initialProduct.stock) : "",
  });

  // Generic specifications — a list of {key, value} pairs the admin can
  // freely add/remove, since different categories need different attributes
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
    initialProduct?.specifications
      ? Object.entries(initialProduct.specifications).map(([key, value]) => ({
          key,
          value,
        }))
      : [{ key: "", value: "" }],
  );

  useEffect(() => {
    if (initialProduct) {
      setForm({
        title: initialProduct.title,
        description: initialProduct.description,
        sku: initialProduct.sku,
        category: initialProduct.category,
        brand: initialProduct.brand ?? "",
        make: initialProduct.make ?? "",
        model: initialProduct.model ?? "",
        yearRangeStart: initialProduct.yearRange
          ? String(initialProduct.yearRange.start)
          : "",
        yearRangeEnd: initialProduct.yearRange
          ? String(initialProduct.yearRange.end)
          : "",
        price: String(initialProduct.price),
        stock: String(initialProduct.stock),
      });
      setPreviews(initialProduct.images ?? []);
    }
  }, [initialProduct]);

  // Determine whether the selected category needs vehicle fields — this
  // is the core of "dynamic" form: same form, different fields shown
  // depending on which category is picked
  const selectedCategory = categories?.find((c) => c.name === form.category);
  const showVehicleFields = selectedCategory?.hasVehicleAttributes ?? false;

  const handleChange =
    (field: keyof ProductFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [field]: e.target.value });
    };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (previews.length + files.length > 5) {
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
    const newImageStartIndex = previews.length - images.length;
    if (index >= newImageStartIndex) {
      setImages((prev) =>
        prev.filter((_, i) => i !== index - newImageStartIndex),
      );
    }
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSpec = (index: number, field: "key" | "value", value: string) => {
    setSpecs((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  const addSpecRow = () =>
    setSpecs((prev) => [...prev, { key: "", value: "" }]);
  const removeSpecRow = (index: number) =>
    setSpecs((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const specifications: Record<string, string> = {};
    specs.forEach(({ key, value }) => {
      if (key.trim()) specifications[key.trim()] = value.trim();
    });
    onSubmit(form, images, specifications);
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
              label="SKU"
              fullWidth
              required
              value={form.sku}
              onChange={handleChange("sku")}
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

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Category"
              fullWidth
              required
              value={form.category}
              onChange={handleChange("category")}
            >
              {form.category &&
                !categories?.some((cat) => cat.name === form.category) && (
                  <MenuItem value={form.category} disabled>
                    {form.category} (category no longer exists — please
                    reselect)
                  </MenuItem>
                )}
              {categories?.map((cat) => (
                <MenuItem key={cat._id} value={cat.name}>
                  {cat.name}
                </MenuItem>
              ))}
              {(!categories || categories.length === 0) && (
                <MenuItem value="" disabled>
                  No categories available — create one first
                </MenuItem>
              )}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Brand (optional)"
              fullWidth
              value={form.brand}
              onChange={handleChange("brand")}
            >
              <MenuItem value="">No Brand</MenuItem>
              {brands?.map((brand) => (
                <MenuItem key={brand._id} value={brand._id}>
                  {brand.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={hasVariants}
                  onChange={(e) => setHasVariants(e.target.checked)}
                />
              }
              label="This product has variants (e.g. different sizes/colors, each with its own price & stock)"
            />
          </Grid>

          {!hasVariants ? (
            <>
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
            </>
          ) : (
            <Grid size={12}>
              <VariantBuilder variants={variants} onChange={setVariants} />
            </Grid>
          )}

          {/* Vehicle-specific fields — only shown when the selected category is vehicle-based */}
          {showVehicleFields && (
            <>
              <Grid size={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Vehicle Compatibility
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Make"
                  fullWidth
                  value={form.make}
                  onChange={handleChange("make")}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Model"
                  fullWidth
                  value={form.model}
                  onChange={handleChange("model")}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <TextField
                  label="Year From"
                  type="number"
                  fullWidth
                  value={form.yearRangeStart}
                  onChange={handleChange("yearRangeStart")}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 2 }}>
                <TextField
                  label="Year To"
                  type="number"
                  fullWidth
                  value={form.yearRangeEnd}
                  onChange={handleChange("yearRangeEnd")}
                />
              </Grid>
            </>
          )}

          {/* Generic specifications — available for every category */}
          <Grid size={12}>
            <Typography
              sx={{ variant: "subtitle2", color: "text.secondary", mb: 1 }}
            >
              Specifications (e.g. Brand, Size, Color, Warranty)
            </Typography>
            {specs.map((spec, index) => (
              <Box key={index} sx={{ display: "flex", gap: 1, mb: 1 }}>
                <TextField
                  size="small"
                  placeholder="Attribute (e.g. Brand)"
                  value={spec.key}
                  onChange={(e) => updateSpec(index, "key", e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  placeholder="Value (e.g. Samsung)"
                  value={spec.value}
                  onChange={(e) => updateSpec(index, "value", e.target.value)}
                  sx={{ flex: 1 }}
                />
                <IconButton size="small" onClick={() => removeSpecRow(index)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Button size="small" startIcon={<AddIcon />} onClick={addSpecRow}>
              Add Attribute
            </Button>
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

            {previews.length > 0 && (
              <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
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
            )}
          </Grid>

          <Grid size={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
