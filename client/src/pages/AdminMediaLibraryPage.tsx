import { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardActionArea,
  CardContent,
  TextField,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  Link,
  Menu,
  MenuItem,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import DeleteIcon from "@mui/icons-material/Delete";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import {
  fetchMediaLibrary,
  uploadMediaRequest,
  updateMediaRequest,
  deleteMediaRequest,
  moveMediaRequest,
  type MediaItem,
} from "../features/media/mediaApi";
import {
  fetchFolders,
  fetchFolderBreadcrumb,
  createFolderRequest,
  renameFolderRequest,
  deleteFolderRequest,
  type MediaFolder,
} from "../features/media/mediaFolderApi";
import PageTransition from "../components/PageTransition";

// Self-contained folder browser used inside the "Move" dialog — it needs
// its own navigation state, separate from the page's, so moving a file
// doesn't disturb which folder the user is currently viewing behind it.
function MoveMediaDialog({
  item,
  onClose,
  onConfirm,
  isMoving,
}: {
  item: MediaItem | null;
  onClose: () => void;
  onConfirm: (folderId: string | null) => void;
  isMoving: boolean;
}) {
  const [browseFolderId, setBrowseFolderId] = useState<string | null>(null);

  const { data: folders } = useQuery({
    queryKey: ["move-dialog-folders", browseFolderId],
    queryFn: () => fetchFolders(browseFolderId ?? undefined),
    enabled: !!item,
  });

  const { data: breadcrumb } = useQuery({
    queryKey: ["move-dialog-breadcrumb", browseFolderId],
    queryFn: () => fetchFolderBreadcrumb(browseFolderId as string),
    enabled: !!item && !!browseFolderId,
  });

  if (!item) return null;

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Move "{item.fileName}"</DialogTitle>
      <DialogContent>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component="button" onClick={() => setBrowseFolderId(null)}>
            Library
          </Link>
          {breadcrumb?.map((c) => (
            <Link
              key={c._id}
              component="button"
              onClick={() => setBrowseFolderId(c._id)}
            >
              {c.name}
            </Link>
          ))}
        </Breadcrumbs>

        <Grid container spacing={1} sx={{ mb: 2 }}>
          {folders?.map((f) => (
            <Grid key={f._id} size={6}>
              <Card>
                <CardActionArea
                  onClick={() => setBrowseFolderId(f._id)}
                  sx={{ display: "flex", alignItems: "center", gap: 1, p: 1 }}
                >
                  <FolderIcon fontSize="small" color="primary" />
                  <Typography variant="body2" noWrap>
                    {f.name}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {folders?.length === 0 && (
          <Typography variant="caption" color="text.secondary">
            No subfolders here.
          </Typography>
        )}

        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
        >
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            disabled={isMoving}
            onClick={() => onConfirm(browseFolderId)}
          >
            Move Here
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminMediaLibraryPage() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [movingItem, setMovingItem] = useState<MediaItem | null>(null);

  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderDialogMode, setFolderDialogMode] = useState<"create" | "rename">(
    "create",
  );
  const [folderNameInput, setFolderNameInput] = useState("");
  const [activeFolder, setActiveFolder] = useState<MediaFolder | null>(null);

  const [folderMenuAnchor, setFolderMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [folderMenuTarget, setFolderMenuTarget] = useState<MediaFolder | null>(
    null,
  );

  const { data: folders } = useQuery({
    queryKey: ["media-folders", currentFolderId],
    queryFn: () => fetchFolders(currentFolderId ?? undefined),
  });

  const { data: breadcrumb } = useQuery({
    queryKey: ["media-folder-breadcrumb", currentFolderId],
    queryFn: () => fetchFolderBreadcrumb(currentFolderId as string),
    enabled: !!currentFolderId,
  });

  const { data } = useQuery({
    queryKey: ["media-library", currentFolderId],
    queryFn: () =>
      fetchMediaLibrary({ page: 1, folderId: currentFolderId ?? "root" }),
  });

  const upload = useMutation({
    mutationFn: (files: File[]) => uploadMediaRequest(files, currentFolderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-library"] });
      enqueueSnackbar("Files uploaded", { variant: "success" });
    },
    onError: (err: any) =>
      enqueueSnackbar(err?.response?.data?.message || "Upload failed", {
        variant: "error",
      }),
  });

  const updateMeta = useMutation({
    mutationFn: (payload: { id: string; altText: string; title: string }) =>
      updateMediaRequest(payload.id, {
        altText: payload.altText,
        title: payload.title,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-library"] });
      enqueueSnackbar("File updated successfully", { variant: "success" });
      setEditingItem(null);
    },
    onError: (err: any) =>
      enqueueSnackbar(err?.response?.data?.message || "Update failed", {
        variant: "error",
      }),
  });

  const deleteItem = useMutation({
    mutationFn: deleteMediaRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-library"] });
      enqueueSnackbar("File deleted", { variant: "success" });
    },
    onError: (err: any) =>
      enqueueSnackbar(err?.response?.data?.message || "Delete failed", {
        variant: "error",
      }),
  });

  const moveItem = useMutation({
    mutationFn: (payload: { id: string; folderId: string | null }) =>
      moveMediaRequest(payload.id, payload.folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-library"] });
      enqueueSnackbar("File moved", { variant: "success" });
      setMovingItem(null);
    },
    onError: (err: any) =>
      enqueueSnackbar(err?.response?.data?.message || "Move failed", {
        variant: "error",
      }),
  });

  const createFolder = useMutation({
    mutationFn: (name: string) =>
      createFolderRequest({ name, parentFolder: currentFolderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-folders"] });
      enqueueSnackbar("Folder created", { variant: "success" });
      closeFolderDialog();
    },
    onError: (err: any) =>
      enqueueSnackbar(
        err?.response?.data?.message || "Failed to create folder",
        { variant: "error" },
      ),
  });

  const renameFolder = useMutation({
    mutationFn: (payload: { id: string; name: string }) =>
      renameFolderRequest(payload.id, payload.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-folders"] });
      queryClient.invalidateQueries({ queryKey: ["media-folder-breadcrumb"] });
      enqueueSnackbar("Folder renamed", { variant: "success" });
      closeFolderDialog();
    },
    onError: (err: any) =>
      enqueueSnackbar(
        err?.response?.data?.message || "Failed to rename folder",
        { variant: "error" },
      ),
  });

  const deleteFolder = useMutation({
    mutationFn: deleteFolderRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-folders"] });
      enqueueSnackbar("Folder deleted", { variant: "success" });
    },
    onError: (err: any) =>
      enqueueSnackbar(
        err?.response?.data?.message || "Failed to delete folder",
        { variant: "error" },
      ),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) upload.mutate(files);
  };

  const openCreateFolderDialog = () => {
    setFolderDialogMode("create");
    setFolderNameInput("");
    setActiveFolder(null);
    setFolderDialogOpen(true);
  };

  const openRenameFolderDialog = (folder: MediaFolder) => {
    setFolderDialogMode("rename");
    setFolderNameInput(folder.name);
    setActiveFolder(folder);
    setFolderDialogOpen(true);
    setFolderMenuAnchor(null);
  };

  const closeFolderDialog = () => {
    setFolderDialogOpen(false);
    setFolderNameInput("");
    setActiveFolder(null);
  };

  const submitFolderDialog = () => {
    if (!folderNameInput.trim()) return;
    if (folderDialogMode === "create") {
      createFolder.mutate(folderNameInput.trim());
    } else if (activeFolder) {
      renameFolder.mutate({
        id: activeFolder._id,
        name: folderNameInput.trim(),
      });
    }
  };

  const handleFolderDelete = (folder: MediaFolder) => {
    if (window.confirm(`Delete folder "${folder.name}"? It must be empty.`)) {
      deleteFolder.mutate(folder._id);
    }
    setFolderMenuAnchor(null);
  };

  return (
    <PageTransition>
      <Container sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Typography variant="h4">Media Library</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<CreateNewFolderIcon />}
              onClick={openCreateFolderDialog}
            >
              New Folder
            </Button>
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
        </Box>

        <Breadcrumbs sx={{ mb: 2 }}>
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

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {folders?.map((folder) => (
            <Grid key={folder._id} size={{ xs: 6, sm: 4, md: 2 }}>
              <Card>
                <Box sx={{ display: "flex", alignItems: "center", pr: 0.5 }}>
                  <CardActionArea
                    onClick={() => setCurrentFolderId(folder._id)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 1,
                      flex: 1,
                    }}
                  >
                    <FolderIcon color="primary" />
                    <Typography variant="body2" noWrap>
                      {folder.name}
                    </Typography>
                  </CardActionArea>
                  <IconButton
                    size="small"
                    component="div"
                    onClick={(e) => {
                      setFolderMenuAnchor(e.currentTarget);
                      setFolderMenuTarget(folder);
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Menu
          anchorEl={folderMenuAnchor}
          open={Boolean(folderMenuAnchor)}
          onClose={() => setFolderMenuAnchor(null)}
        >
          <MenuItem
            onClick={() =>
              folderMenuTarget && openRenameFolderDialog(folderMenuTarget)
            }
          >
            Rename
          </MenuItem>
          <MenuItem
            onClick={() =>
              folderMenuTarget && handleFolderDelete(folderMenuTarget)
            }
          >
            Delete
          </MenuItem>
        </Menu>

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
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => setMovingItem(item)}
                      >
                        <DriveFileMoveIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => deleteItem.mutate(item._id)}
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {folders?.length === 0 && data?.media.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
            This folder is empty. Upload files or create a subfolder.
          </Box>
        )}

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
              disabled={updateMeta.isPending}
              onClick={() =>
                editingItem &&
                updateMeta.mutate({
                  id: editingItem._id,
                  altText: editingItem.altText,
                  title: editingItem.title,
                })
              }
            >
              {updateMeta.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogContent>
        </Dialog>

        <Dialog open={folderDialogOpen} onClose={closeFolderDialog}>
          <DialogTitle>
            {folderDialogMode === "create" ? "New Folder" : "Rename Folder"}
          </DialogTitle>
          <DialogContent sx={{ minWidth: 320, pt: 2 }}>
            <TextField
              autoFocus
              fullWidth
              label="Folder Name"
              value={folderNameInput}
              onChange={(e) => setFolderNameInput(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeFolderDialog}>Cancel</Button>
            <Button
              variant="contained"
              disabled={
                !folderNameInput.trim() ||
                createFolder.isPending ||
                renameFolder.isPending
              }
              onClick={submitFolderDialog}
            >
              {folderDialogMode === "create" ? "Create" : "Save"}
            </Button>
          </DialogActions>
        </Dialog>

        <MoveMediaDialog
          item={movingItem}
          isMoving={moveItem.isPending}
          onClose={() => setMovingItem(null)}
          onConfirm={(folderId) =>
            movingItem && moveItem.mutate({ id: movingItem._id, folderId })
          }
        />
      </Container>
    </PageTransition>
  );
}
