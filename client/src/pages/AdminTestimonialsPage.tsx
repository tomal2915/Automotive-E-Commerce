import { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Box,
  Rating,
  Switch,
  Card,
  CardContent,
  IconButton,
  Avatar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllTestimonialsAdmin,
  createTestimonialRequest,
  updateTestimonialRequest,
  deleteTestimonialRequest,
  type Testimonial,
} from "../features/testimonials/testimonialApi";

const emptyForm = {
  name: "",
  role: "Verified Buyer",
  quote: "",
  rating: 5,
  displayOrder: 0,
};

export default function AdminTestimonialsPage() {
  const queryClient = useQueryClient();
  const { data: testimonials } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: fetchAllTestimonialsAdmin,
  });

  const [form, setForm] = useState(emptyForm);
  const [avatar, setAvatar] = useState<File | undefined>();
  const [editingId, setEditingId] = useState<string | null>(null);

  const createTestimonial = useMutation({
    mutationFn: () => createTestimonialRequest({ ...form, avatar }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      setForm(emptyForm);
      setAvatar(undefined);
    },
  });

  const updateTestimonial = useMutation({
    mutationFn: (payload: { id: string; data: any }) =>
      updateTestimonialRequest(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      setEditingId(null);
      setForm(emptyForm);
    },
  });

  const deleteTestimonial = useMutation({
    mutationFn: deleteTestimonialRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });

  const toggleActive = useMutation({
    mutationFn: (t: Testimonial) =>
      updateTestimonialRequest(t._id, { isActive: !t.isActive } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });

  const startEdit = (t: Testimonial) => {
    setForm({
      name: t.name,
      role: t.role,
      quote: t.quote,
      rating: t.rating,
      displayOrder: t.displayOrder,
    });
    setEditingId(t._id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateTestimonial.mutate({ id: editingId, data: { ...form, avatar } });
    } else {
      createTestimonial.mutate();
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography sx={{ variant: "h4", mb: 3 }}>Manage Testimonials</Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography sx={{ variant: "h6", mb: 2 }}>
          {editingId ? "Edit Testimonial" : "Add Testimonial"}
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Customer Name"
                fullWidth
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Role/Label"
                fullWidth
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                label="Display Order"
                type="number"
                fullWidth
                value={form.displayOrder}
                onChange={(e) =>
                  setForm({ ...form, displayOrder: Number(e.target.value) })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", height: "100%" }}
              >
                <Rating
                  value={form.rating}
                  onChange={(_, v) => setForm({ ...form, rating: v || 5 })}
                />
              </Box>
            </Grid>
            <Grid size={12}>
              <TextField
                label="Quote"
                fullWidth
                multiline
                rows={2}
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <Button component="label" size="small" variant="outlined">
                Upload Avatar (optional)
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setAvatar(e.target.files?.[0])}
                />
              </Button>
            </Grid>
            <Grid size={12}>
              <Button
                type="submit"
                variant="contained"
                disabled={!form.name || !form.quote}
              >
                {editingId ? "Save Changes" : "Add Testimonial"}
              </Button>
              {editingId && (
                <Button
                  sx={{ ml: 1 }}
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancel
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Grid container spacing={2}>
        {testimonials?.map((t) => (
          <Grid key={t._id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ opacity: t.isActive ? 1 : 0.5 }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar src={t.avatar}>{t.name.charAt(0)}</Avatar>
                    <Box>
                      <Typography sx={{ variant: "subtitle2" }}>
                        {t.name}
                      </Typography>
                      <Rating value={t.rating} readOnly size="small" />
                    </Box>
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => startEdit(t)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => deleteTestimonial.mutate(t._id)}
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Box>
                </Box>
                <Typography
                  sx={{ variant: "body2", color: "text.secondary", mb: 1 }}
                >
                  "{t.quote}"
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Switch
                    size="small"
                    checked={t.isActive}
                    onChange={() => toggleActive.mutate(t)}
                  />
                  <Typography sx={{ variant: "caption" }}>
                    {t.isActive ? "Visible on site" : "Hidden"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
