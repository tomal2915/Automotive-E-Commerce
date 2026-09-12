import { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Switch,
  Button,
  TextField,
  MenuItem,
  Grid,
  Box,
  Chip,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import {
  fetchCoupons,
  createCouponRequest,
  toggleCouponRequest,
  updateCouponRequest,
  deleteCouponRequest,
  type Coupon,
} from "../features/coupons/couponApi";
import { formatCurrency } from "../utils/formatCurrency";
import PageTransition from "../components/PageTransition";

const emptyForm = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  maxDiscountAmount: "",
  minOrderAmount: "",
  expiresAt: "",
  usageLimit: "",
};

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { data: coupons } = useQuery({
    queryKey: ["coupons"],
    queryFn: fetchCoupons,
  });

  const [form, setForm] = useState(emptyForm);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const createCoupon = useMutation({
    mutationFn: (payload: any) => createCouponRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      enqueueSnackbar("Coupon created successfully", { variant: "success" });
      setForm(emptyForm);
    },
    onError: (err: any) =>
      enqueueSnackbar(
        err?.response?.data?.message || "Failed to create coupon",
        { variant: "error" },
      ),
  });

  const toggleCoupon = useMutation({
    mutationFn: toggleCouponRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      enqueueSnackbar("Coupon status updated", { variant: "success" });
    },
    onError: (err: any) =>
      enqueueSnackbar(
        err?.response?.data?.message || "Failed to update coupon status",
        { variant: "error" },
      ),
  });

  const updateCoupon = useMutation({
    mutationFn: (payload: { id: string; data: any }) =>
      updateCouponRequest(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      enqueueSnackbar("Coupon updated successfully", { variant: "success" });
      setEditingCoupon(null);
      setForm(emptyForm);
    },
    onError: (err: any) =>
      enqueueSnackbar(
        err?.response?.data?.message || "Failed to update coupon",
        { variant: "error" },
      ),
  });

  const deleteCoupon = useMutation({
    mutationFn: deleteCouponRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      enqueueSnackbar("Coupon deleted successfully", { variant: "success" });
    },
    onError: (err: any) =>
      enqueueSnackbar(
        err?.response?.data?.message || "Failed to delete coupon",
        { variant: "error" },
      ),
  });

  const startEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      maxDiscountAmount: coupon.maxDiscountAmount
        ? String(coupon.maxDiscountAmount)
        : "",
      minOrderAmount: String(coupon.minOrderAmount),
      expiresAt: coupon.expiresAt.split("T")[0],
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
    });
  };

  const cancelEdit = () => {
    setEditingCoupon(null);
    setForm(emptyForm);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: form.code,
      discountType: form.discountType as "percentage" | "fixed",
      discountValue: Number(form.discountValue),
      maxDiscountAmount: form.maxDiscountAmount
        ? Number(form.maxDiscountAmount)
        : null,
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
      expiresAt: form.expiresAt,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    };

    if (editingCoupon) {
      updateCoupon.mutate({ id: editingCoupon._id, data: payload });
    } else {
      createCoupon.mutate(payload);
    }
  };

  return (
    <PageTransition>
      <Container sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Manage Coupons
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
          </Typography>
          <Box
            component="form"
            onSubmit={handleFormSubmit}
            key={editingCoupon?._id ?? "new"}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label="Code"
                  fullWidth
                  required
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  select
                  label="Type"
                  fullWidth
                  value={form.discountType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      discountType: e.target.value,
                      // Max discount only applies to percentage coupons —
                      // clear it so a stale value can't silently persist
                      maxDiscountAmount:
                        e.target.value === "fixed"
                          ? ""
                          : form.maxDiscountAmount,
                    })
                  }
                >
                  <MenuItem value="percentage">Percentage (%)</MenuItem>
                  <MenuItem value="fixed">Fixed Amount (৳)</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label="Discount Value"
                  type="number"
                  fullWidth
                  required
                  value={form.discountValue}
                  onChange={(e) =>
                    setForm({ ...form, discountValue: e.target.value })
                  }
                />
              </Grid>
              {form.discountType === "percentage" && (
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    label="Max Discount (৳, optional)"
                    type="number"
                    fullWidth
                    value={form.maxDiscountAmount}
                    onChange={(e) =>
                      setForm({ ...form, maxDiscountAmount: e.target.value })
                    }
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label="Min Order Amount"
                  type="number"
                  fullWidth
                  value={form.minOrderAmount}
                  onChange={(e) =>
                    setForm({ ...form, minOrderAmount: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label="Expires At"
                  type="date"
                  fullWidth
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm({ ...form, expiresAt: e.target.value })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label="Usage Limit (optional)"
                  type="number"
                  fullWidth
                  value={form.usageLimit}
                  onChange={(e) =>
                    setForm({ ...form, usageLimit: e.target.value })
                  }
                />
              </Grid>
              <Grid
                size={{ xs: 12, sm: 3 }}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  disabled={createCoupon.isPending || updateCoupon.isPending}
                  fullWidth
                >
                  {editingCoupon
                    ? updateCoupon.isPending
                      ? "Saving..."
                      : "Update Coupon"
                    : createCoupon.isPending
                      ? "Creating..."
                      : "Create Coupon"}
                </Button>
                {editingCoupon && (
                  <Button onClick={cancelEdit} fullWidth>
                    Cancel
                  </Button>
                )}
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Min Order</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell>Usage</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coupons?.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell>
                    <Chip label={coupon.code} size="small" />
                  </TableCell>
                  <TableCell>
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}%`
                      : `${formatCurrency(coupon.discountValue)}`}
                    {coupon.discountType === "percentage" &&
                      coupon.maxDiscountAmount &&
                      ` (max ${formatCurrency(coupon.maxDiscountAmount)})`}
                  </TableCell>
                  <TableCell>{formatCurrency(coupon.minOrderAmount)}</TableCell>
                  <TableCell>
                    {new Date(coupon.expiresAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {coupon.usedCount} / {coupon.usageLimit ?? "∞"}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={coupon.isActive}
                      onChange={() => toggleCoupon.mutate(coupon._id)}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => startEdit(coupon)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => deleteCoupon.mutate(coupon._id)}
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Container>
    </PageTransition>
  );
}
