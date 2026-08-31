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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCart } from "../features/cart/useCart";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateCartItemRequest,
  removeFromCartRequest,
} from "../features/cart/cartApi";
import { initiateCheckoutRequest } from "../features/orders/orderApi";

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

  const handleCheckout = () => {
    checkout.mutate({
      name: "Test User",
      phone: "01700000000",
      address: "Mirpur-02, Dhaka",
      city: "Dhaka",
      postcode: "1216",
    });
  };

  if (isLoading) return <Container sx={{ py: 4 }}>Loading cart...</Container>;

  const items = cart?.items ?? [];
  const total = items.reduce(
    (sum, item) => sum + item.priceAtAdd * item.quantity,
    0,
  );

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

          <Box display="flex" justifyContent="space-between" mt={3}>
            <Typography variant="h6">Total: ${total.toFixed(2)}</Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleCheckout}
              disabled={checkout.isPending}
            >
              {checkout.isPending ? "Redirecting..." : "Checkout"}
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
}
