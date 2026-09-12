import { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  TextField,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchMediaLibrary,
  uploadMediaRequest,
  updateMediaRequest,
  deleteMediaRequest,
  type MediaItem,
} from "../features/media/mediaApi";
import PageTransition from "../components/PageTransition";
import { enqueueSnackbar } from "notistack";

export default function AdminMediaLibraryPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["media-library"],
    queryFn: () => fetchMediaLibrary({ page: 1 }),
  });
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  const upload = useMutation({
    mutationFn: uploadMediaRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-library"] });
      enqueueSnackbar("Files uploaded", { variant: "success" });
    },
    onError: () => enqueueSnackbar("Upload failed", { variant: "error" }),
  });

  const updateMeta = useMutation({
    mutationFn: (payload: { id: string; altText: string; title: string }) =>
      updateMediaRequest(payload.id, {
        altText: payload.altText,
        title: payload.title,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-library"] });
      enqueueSnackbar("Files update successfully", { variant: "success" });
      setEditingItem(null);
    },
  });

  const deleteItem = useMutation({
    mutationFn: deleteMediaRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-library"] });
      enqueueSnackbar("Files deleted", { variant: "success" });
    },
    onError: (err: any) =>
      enqueueSnackbar(err?.response?.data?.message || "Delete failed", {
        variant: "error",
      }),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) upload.mutate(files);
  };

  return (
    <PageTransition>
      <Container sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4">Media Library</Typography>
          <Button
            component="label"
            variant="contained"
            disabled={upload.isPending}
          >
            {upload.isPending ? "Uploading..." : "Upload Files"}
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handleFileSelect}
            />
          </Button>
        </Box>

        <Grid container spacing={2}>
          {data?.media.map((item) => (
            <Grid key={item._id} size={{ xs: 6, sm: 4, md: 2 }}>
              <Card>
                <CardMedia
                  component="img"
                  height="100"
                  image={item.thumbnailUrl || item.url}
                  sx={{ cursor: "pointer" }}
                  onClick={() => setEditingItem(item)}
                />
                <CardContent sx={{ p: 1 }}>
                  <Typography variant="caption" noWrap display="block">
                    {item.fileName}
                  </Typography>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {item.usageCount} uses
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => deleteItem.mutate(item._id)}
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={!!editingItem} onClose={() => setEditingItem(null)}>
          <DialogTitle>Edit Media Info</DialogTitle>
          <DialogContent sx={{ minWidth: 320, pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              defaultValue={editingItem?.title}
              sx={{ mb: 2 }}
              onChange={(e) =>
                editingItem &&
                setEditingItem({ ...editingItem, title: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Alt Text"
              defaultValue={editingItem?.altText}
              sx={{ mb: 2 }}
              onChange={(e) =>
                editingItem &&
                setEditingItem({ ...editingItem, altText: e.target.value })
              }
            />
            <Button
              variant="contained"
              onClick={() =>
                editingItem &&
                updateMeta.mutate({
                  id: editingItem._id,
                  altText: editingItem.altText,
                  title: editingItem.title,
                })
              }
            >
              Save
            </Button>
          </DialogContent>
        </Dialog>
      </Container>
    </PageTransition>
  );
}
