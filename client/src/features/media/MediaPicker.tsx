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
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { fetchMediaLibrary, type MediaItem } from "./mediaApi";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
}

// A reusable "pick an image from the shared library" dialog — used by
// Brand logos, Product thumbnails/gallery, and Variant images alike,
// so an asset only ever needs to be uploaded once.
export default function MediaPicker({ open, onClose, onSelect }: Props) {
  const { data } = useQuery({
    queryKey: ["media-library-picker"],
    queryFn: () => fetchMediaLibrary({ page: 1, limit: 60, type: "image" }),
    enabled: open,
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select an Image</DialogTitle>
      <DialogContent>
        <Grid container spacing={1.5}>
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
        {(!data || data.media.length === 0) && (
          <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
            No images in the library yet. Upload some from the Media Library
            page first.
          </Box>
        )}
        <Box sx={{ mt: 2, textAlign: "right" }}>
          <Button onClick={onClose}>Close</Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
