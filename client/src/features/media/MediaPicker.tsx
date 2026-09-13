import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Card,
  CardMedia,
  CardActionArea,
  Box,
  Button,
  Breadcrumbs,
  Link,
  Typography,
  IconButton,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useQuery } from "@tanstack/react-query";
import { fetchMediaLibrary, type MediaItem } from "./mediaApi";
import { fetchFolders, fetchFolderBreadcrumb } from "./mediaFolderApi";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
}

// A reusable "pick an image from the shared library" dialog — used by
// Brand logos, Product thumbnails/gallery, and Variant images alike, so
// an asset only ever needs to be uploaded once. Folder-aware: users can
// browse into subfolders before picking an image.
export default function MediaPicker({ open, onClose, onSelect }: Props) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const { data: folders } = useQuery({
    queryKey: ["media-picker-folders", currentFolderId],
    queryFn: () => fetchFolders(currentFolderId ?? undefined),
    enabled: open,
  });

  const { data: breadcrumb } = useQuery({
    queryKey: ["media-picker-breadcrumb", currentFolderId],
    queryFn: () => fetchFolderBreadcrumb(currentFolderId as string),
    enabled: open && !!currentFolderId,
  });

  const { data } = useQuery({
    queryKey: ["media-library-picker", currentFolderId],
    queryFn: () =>
      fetchMediaLibrary({
        page: 1,
        limit: 60,
        type: "image",
        folderId: currentFolderId ?? "root",
      }),
    enabled: open,
  });

  const handleClose = () => {
    setCurrentFolderId(null); // reset navigation for next open
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Select an Image</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          {currentFolderId && (
            <IconButton
              size="small"
              onClick={() =>
                setCurrentFolderId(
                  breadcrumb && breadcrumb.length > 1
                    ? breadcrumb[breadcrumb.length - 2]._id
                    : null,
                )
              }
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          )}
          <Breadcrumbs>
            <Link
              component="button"
              underline={currentFolderId ? "hover" : "none"}
              onClick={() => setCurrentFolderId(null)}
            >
              Library
            </Link>
            {breadcrumb?.map((crumb) => (
              <Link
                key={crumb._id}
                component="button"
                underline={crumb._id === currentFolderId ? "none" : "hover"}
                onClick={() => setCurrentFolderId(crumb._id)}
              >
                {crumb.name}
              </Link>
            ))}
          </Breadcrumbs>
        </Box>

        <Grid container spacing={1.5}>
          {folders?.map((folder) => (
            <Grid key={folder._id} size={{ xs: 4, sm: 3, md: 2 }}>
              <Card>
                <CardActionArea
                  onClick={() => setCurrentFolderId(folder._id)}
                  sx={{
                    height: 80,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: 0.5,
                  }}
                >
                  <FolderIcon color="action" />
                  <Typography variant="caption" noWrap sx={{ px: 0.5 }}>
                    {folder.name}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}

          {data?.media.map((item) => (
            <Grid key={item._id} size={{ xs: 4, sm: 3, md: 2 }}>
              <Card>
                <CardActionArea onClick={() => onSelect(item)}>
                  <CardMedia
                    component="img"
                    height="80"
                    image={item.thumbnailUrl || item.url}
                    sx={{ objectFit: "cover" }}
                  />
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {folders?.length === 0 && data?.media.length === 0 && (
          <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
            This folder is empty.
          </Box>
        )}

        <Box sx={{ mt: 2, textAlign: "right" }}>
          <Button onClick={handleClose}>Close</Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
