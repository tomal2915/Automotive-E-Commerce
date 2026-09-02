import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Box,
  Divider,
  Button,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCart } from "../features/cart/useCart";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateCartItemRequest,
  removeFromCartRequest,
} from "../features/cart/cartApi";
import { initiateCheckoutRequest } from "../features/orders/orderApi";
import { validateCouponRequest } from "../features/coupons/couponApi";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAddresses } from "../features/addresses/addressApi";
import { MenuItem, TextField as MTextField } from "@mui/material"; // TextField already imported probably, alias avoided if not needed
import { useNavigate, Link as RouterLink } from "react-router-dom";

export default function CartPage() {
  const { data: cart, isLoading } = useCart();
  const queryClient = useQueryClient();

  const updateQuantity = useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => updateCartItemRequest(productId, quantity),
    onSuccess: (updatedCart) => queryClient.setQueryData(["cart"], updatedCart),
  });

  const removeItem = useMutation({
    mutationFn: (productId: string) => removeFromCartRequest(productId),
    onSuccess: (updatedCart) => queryClient.setQueryData(["cart"], updatedCart),
  });

  const checkout = useMutation({
    mutationFn: initiateCheckoutRequest,
    onSuccess: (data) => {
      // Redirect the browser to SSLCommerz's hosted payment page
      window.location.href = data.gatewayUrl;
    },
  });

  if (isLoading) return <Container sx={{ py: 4 }}>Loading cart...</Container>;

  const items = cart?.items ?? [];
  const total = items.reduce(
    (sum, item) => sum + item.priceAtAdd * item.quantity,
    0,
  );

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");

  const applyCoupon = useMutation({
    mutationFn: (amount: number) => validateCouponRequest(couponCode, amount),
    onSuccess: (data) => {
      setAppliedCoupon({ code: couponCode, discount: data.discount });
      setCouponError("");
    },
    onError: (error: any) => {
      setCouponError(error?.response?.data?.message || "Invalid coupon");
      setAppliedCoupon(null);
    },
  });

  const finalTotal = appliedCoupon ? total - appliedCoupon.discount : total;

  const navigate = useNavigate();
  const { data: addresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: fetchAddresses,
  });
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  // Once addresses load, default to the user's default address (if any)
  // This is safe to compute on every render — it's cheap and idempotent
  const defaultAddress = addresses?.find((a) => a.isDefault);
  const activeAddressId = selectedAddressId || defaultAddress?._id || "";
  const selectedAddress = addresses?.find((a) => a._id === activeAddressId);

  const handleCheckout = () => {
    if (!selectedAddress) {
      alert("Please select or add a shipping address first");
      return;
    }

    checkout.mutate({
      shippingAddress: {
        name: selectedAddress.name,
        phone: selectedAddress.phone,
        address: selectedAddress.street,
        city: selectedAddress.city,
        postcode: selectedAddress.postcode,
      },
      couponCode: appliedCoupon?.code,
    });
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" mb={3}>
        Your Cart
      </Typography>

      {items.length === 0 ? (
        <Typography color="text.secondary">Your cart is empty.</Typography>
      ) : (
        <>
          <List>
            {items.map((item) => (
              <Box key={item.product._id}>
                <ListItem
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => removeItem.mutate(item.product._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={item.product.title}
                    secondary={`$${item.priceAtAdd.toFixed(2)} each`}
                  />
                  <TextField
                    type="number"
                    size="small"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity.mutate({
                        productId: item.product._id,
                        quantity: Math.max(1, Number(e.target.value)),
                      })
                    }
                    sx={{ width: 80, mx: 2 }}
                    inputProps={{ min: 1 }}
                  />
                </ListItem>
                <Divider />
              </Box>
            ))}
          </List>

          <Box display="flex" gap={1} alignItems="center" mb={2}>
            <TextField
              size="small"
              label="Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              disabled={!!appliedCoupon}
            />
            <Button
              variant="outlined"
              onClick={() => applyCoupon.mutate(total)}
              disabled={!couponCode || !!appliedCoupon || applyCoupon.isPending}
            >
              Apply
            </Button>
            {appliedCoupon && (
              <Button
                size="small"
                color="error"
                onClick={() => {
                  setAppliedCoupon(null);
                  setCouponCode("");
                }}
              >
                Remove
              </Button>
            )}
          </Box>
          {couponError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {couponError}
            </Alert>
          )}
          {appliedCoupon && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Coupon "{appliedCoupon.code}" applied — $
              {appliedCoupon.discount.toFixed(2)} off
            </Alert>
          )}

          <Box mb={3}>
            <Typography variant="subtitle1" mb={1}>
              Shipping Address
            </Typography>

            {!addresses || addresses.length === 0 ? (
              <Alert
                severity="warning"
                action={
                  <Button size="small" component={RouterLink} to="/addresses">
                    Add Address
                  </Button>
                }
              >
                No saved addresses. Please add one to checkout.
              </Alert>
            ) : (
              <TextField
                select
                fullWidth
                label="Select delivery address"
                value={activeAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
              >
                {addresses.map((addr) => (
                  <MenuItem key={addr._id} value={addr._id}>
                    {addr.label} — {addr.street}, {addr.city} ({addr.name},{" "}
                    {addr.phone})
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Box>

          <Box display="flex" justifyContent="space-between" mt={3}>
            <Typography variant="h6">
              {appliedCoupon && (
                <Typography
                  component="span"
                  sx={{
                    textDecoration: "line-through",
                    color: "text.secondary",
                    mr: 1,
                  }}
                >
                  ${total.toFixed(2)}
                </Typography>
              )}
              Total: ${finalTotal.toFixed(2)}
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={handleCheckout}
              disabled={checkout.isPending || !selectedAddress}
            >
              {checkout.isPending ? "Redirecting..." : "Checkout"}
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
}
