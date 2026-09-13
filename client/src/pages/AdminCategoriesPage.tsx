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
  IconButton,
  MenuItem,
  Alert,
  Collapse,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
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

// Flattens the nested tree into a single list with depth info — used to
// build the "Parent Category" dropdown, which needs every category (at
// any nesting level) as a selectable/re-parentable option.
const flattenCategories = (
  cats: Category[],
  depth = 0,
): { cat: Category; depth: number }[] =>
  cats.flatMap((cat) => [
    { cat, depth },
    ...flattenCategories(cat.subcategories ?? [], depth + 1),
  ]);

// A category's own id plus every descendant's id — used to stop the
// parent dropdown from offering a category's own descendants as its new
// parent, which would create a circular reference.
const getDescendantIds = (cat: Category): string[] => [
  cat._id,
  ...(cat.subcategories ?? []).flatMap(getDescendantIds),
];

interface TreeNodeProps {
  cat: Category;
  depth: number;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onEdit: (cat: Category) => void;
  onAddChild: (cat: Category) => void;
  onDelete: (id: string, name: string) => void;
  highlightId: string | null;
}

// One row of the tree, rendered recursively for its children when expanded.
function CategoryTreeNode({
  cat,
  depth,
  expandedIds,
  onToggleExpand,
  onEdit,
  onAddChild,
  onDelete,
  highlightId,
}: TreeNodeProps) {
  const hasChildren = (cat.subcategories?.length ?? 0) > 0;
  const isExpanded = expandedIds.has(cat._id);
  const isHighlighted = cat._id === highlightId;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          pl: depth * 3,
          py: 0.75,
          borderRadius: 1,
          bgcolor: isHighlighted ? "action.selected" : "transparent",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <IconButton
          size="small"
          onClick={() => hasChildren && onToggleExpand(cat._id)}
          sx={{ visibility: hasChildren ? "visible" : "hidden" }}
        >
          {isExpanded ? (
            <ExpandMoreIcon fontSize="small" />
          ) : (
            <ChevronRightIcon fontSize="small" />
          )}
        </IconButton>

        {cat.image && (
          <Box
            component="img"
            src={cat.image.thumbnailUrl || cat.image.url}
            sx={{
              width: 24,
              height: 24,
              objectFit: "cover",
              borderRadius: 0.5,
            }}
          />
        )}

        <Typography sx={{ flex: 1, fontWeight: depth === 0 ? 600 : 400 }}>
          {cat.name}
        </Typography>

        {cat.hasVehicleAttributes && (
          <Chip label="Vehicle" size="small" variant="outlined" />
        )}

        <IconButton
          size="small"
          onClick={() => onAddChild(cat)}
          title="Add subcategory"
        >
          <AddIcon fontSize="small" color="primary" />
        </IconButton>
        <IconButton size="small" onClick={() => onEdit(cat)} title="Edit">
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onDelete(cat._id, cat.name)}
          title="Delete"
        >
          <DeleteIcon fontSize="small" color="error" />
        </IconButton>
      </Box>

      {hasChildren && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          {cat.subcategories!.map((sub) => (
            <CategoryTreeNode
              key={sub._id}
              cat={sub}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onDelete={onDelete}
              highlightId={highlightId}
            />
          ))}
        </Collapse>
      )}
    </Box>
  );
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();
  const { enqueueSnackbar } = useSnackbar();

  const [form, setForm] = useState(emptyForm);
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [existingImage, setExistingImage] = useState<Category["image"]>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingUnderId, setAddingUnderId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const createCategory = useMutation({
    mutationFn: () =>
      createCategoryRequest({ ...form, image: selectedImage?._id }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      enqueueSnackbar("Category created successfully", { variant: "success" });
      if (created.parentCategory) {
        setExpandedIds((prev) => new Set(prev).add(created.parentCategory!));
      }
      resetForm();
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
      resetForm();
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

  const resetForm = () => {
    setForm(emptyForm);
    setSelectedImage(null);
    setExistingImage(null);
    setRemoveImage(false);
    setEditingId(null);
    setAddingUnderId(null);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat._id);
    setAddingUnderId(null);
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

  const startAddChild = (parent: Category) => {
    setEditingId(null);
    setAddingUnderId(parent._id);
    setForm({ ...emptyForm, parentCategory: parent._id });
    setSelectedImage(null);
    setExistingImage(null);
    setRemoveImage(false);
    setExpandedIds((prev) => new Set(prev).add(parent._id));
  };

  const startAddRoot = () => {
    resetForm();
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (
      window.confirm(`Delete "${name}"? Its subcategories must be empty first.`)
    ) {
      deleteCategory.mutate(id);
    }
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

  const flatCategories = categories ? flattenCategories(categories) : [];
  const editingCategory = flatCategories.find(
    (f) => f.cat._id === editingId,
  )?.cat;
  const excludedIds = editingCategory ? getDescendantIds(editingCategory) : [];
  const parentOptions = flatCategories.filter(
    ({ cat }) => !excludedIds.includes(cat._id),
  );

  const addingUnderName = addingUnderId
    ? flatCategories.find((f) => f.cat._id === addingUnderId)?.cat.name
    : null;

  const displayImage = selectedImage
    ? { url: selectedImage.thumbnailUrl || selectedImage.url }
    : !removeImage && existingImage
      ? { url: existingImage.thumbnailUrl || existingImage.url }
      : null;

  return (
    <PageTransition>
      <Container sx={{ py: { xs: 2, sm: 3, md: 4 } }} maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Manage Categories
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }} key={editingId ?? addingUnderId ?? "new"}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {editingId
              ? `Edit Category — ${form.name || "..."}`
              : addingUnderId
                ? `Add Subcategory under "${addingUnderName}"`
                : "Add New Root Category"}
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
                {parentOptions.map(({ cat, depth }) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {"— ".repeat(depth)}
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={12}>
              <Button
                variant="outlined"
                size="small"
                onClick={(e) => {
                  e.currentTarget.blur();
                  setPickerOpen(true);
                }}
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
                    : addingUnderId
                      ? "Add Subcategory"
                      : "Create Category"}
              </Button>
              {(editingId || addingUnderId) && (
                <Button sx={{ ml: 1 }} onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="h6">Category Tree</Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={startAddRoot}>
              Add Root Category
            </Button>
          </Box>

          {categories?.map((cat) => (
            <CategoryTreeNode
              key={cat._id}
              cat={cat}
              depth={0}
              expandedIds={expandedIds}
              onToggleExpand={toggleExpand}
              onEdit={startEdit}
              onAddChild={startAddChild}
              onDelete={handleDelete}
              highlightId={editingId ?? addingUnderId}
            />
          ))}

          {(!categories || categories.length === 0) && (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No categories yet — add your first root category above.
            </Typography>
          )}
        </Paper>

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
