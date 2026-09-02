import { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Radio,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAddresses,
  createAddressRequest,
  updateAddressRequest,
  deleteAddressRequest,
  type Address,
  type AddressInput,
} from "../features/addresses/addressApi";

const emptyForm: AddressInput = { label: "Home", name: "", phone: "", street: "", city: "", postcode: "" };

export default function AddressBookPage() {
  const queryClient = useQueryClient();
  const { data: addresses, isLoading } = useQuery({ queryKey: ["addresses"], queryFn: fetchAddresses });

  const [form, setForm] = useState<AddressInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const createAddress = useMutation({
    mutationFn: createAddressRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setForm(emptyForm);
      setShowForm(false);
    },
  });

  const updateAddress = useMutation({
    mutationFn: (payload: { id: string; data: Partial<AddressInput> }) =>
      updateAddressRequest(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setEditingId(null);
      setForm(emptyForm);
      setShowForm(false);
    },
  });

  const deleteAddress = useMutation({
    mutationFn: deleteAddressRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });

  const setAsDefault = useMutation({
    mutationFn: (id: string) => updateAddressRequest(id, { isDefault: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });

  const startEdit = (address: Address) => {
    setForm({
      label: address.label,
      name: address.name,
      phone: address.phone,
      street: address.street,
      city: address.city,
      postcode: address.postcode,
    });
    setEditingId(address._id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateAddress.mutate({ id: editingId, data: form });
    } else {
      createAddress.mutate(form);
    }
  };

  const isSubmitting = createAddress.isPending || updateAddress.isPending;

  if (isLoading) return <Container sx={{ py: 4 }}>Loading addresses...</Container>;

  return (
    <Container sx={{ py: 4, maxWidth: "800px !important" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Address Book</Typography>
        {!showForm && (
          <Button variant="contained" onClick={() => setShowForm(true)}>
            Add New Address
          </Button>
        )}
      </Box>

      {showForm && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" mb={2}>
            {editingId ? "Edit Address" : "New Address"}
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Label (e.g. Home, Office)"
                  fullWidth
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Recipient Name"
                  fullWidth
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Phone"
                  fullWidth
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Street Address"
                  fullWidth
                  required
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="City"
                  fullWidth
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Postcode"
                  fullWidth
                  required
                  value={form.postcode}
                  onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                />
              </Grid>
            </Grid>

            <Box display="flex" gap={1} mt={2}>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Address"}
              </Button>
              <Button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {(!addresses || addresses.length === 0) && !showForm && (
        <Alert severity="info">You haven't saved any addresses yet.</Alert>
      )}

      <Grid container spacing={2}>
        {addresses?.map((address) => (
          <Grid key={address._id} size={{ xs: 12, sm: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Radio
                      checked={address.isDefault}
                      onChange={() => setAsDefault.mutate(address._id)}
                      size="small"
                    />
                    <Chip label={address.label} size="small" />
                    {address.isDefault && <Chip label="Default" size="small" color="primary" />}
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => startEdit(address)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => deleteAddress.mutate(address._id)}>
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body2" mt={1}>
                  <strong>{address.name}</strong> · {address.phone}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {address.street}, {address.city} - {address.postcode}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}