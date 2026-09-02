import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useAuthStore } from "../store/authStore";
import { setAccessToken } from "../lib/tokenStore";
import { api } from "../lib/api";
import { useCart } from "../features/cart/useCart";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, setUser } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      // Clear client-side state regardless of whether the API call succeeded
      setAccessToken(null);
      setUser(null);
      handleMenuClose();
      navigate("/login");
    }
  };

  const { data: cart } = useCart();
  const itemCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: "none",
            color: "inherit",
            fontWeight: 700,
          }}
        >
          AutoParts
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <ThemeToggle />

          <IconButton color="inherit" component={RouterLink} to="/cart">
            <Badge badgeContent={itemCount} color="primary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {isAuthenticated ? (
            <>
              <IconButton onClick={handleMenuOpen} size="small">
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem disabled>{user?.email}</MenuItem>
                <MenuItem
                  component={RouterLink}
                  to="/my-orders"
                  onClick={handleMenuClose}
                >
                  My Orders
                </MenuItem>
                {user?.role === "admin" && (
                  <>
                    <MenuItem
                      component={RouterLink}
                      to="/admin/orders"
                      onClick={handleMenuClose}
                    >
                      Manage Orders
                    </MenuItem>
                    <MenuItem
                      component={RouterLink}
                      to="/admin/products/new"
                      onClick={handleMenuClose}
                    >
                      Add Product
                    </MenuItem>
                  </>
                )}
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
