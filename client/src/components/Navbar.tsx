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
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
import SearchBar from "./SearchBar";
import AnimatedBadge from "./AnimatedBadge";
import { useAuthStore } from "../store/authStore";
import { useCart } from "../features/cart/useCart";
import { useWishlist } from "../features/wishlist/useWishlist";
import { setAccessToken } from "../lib/tokenStore";
import { api } from "../lib/api";

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // < 900px

  const navigate = useNavigate();
  const { user, isAuthenticated, setUser } = useAuthStore();
  const { data: cart } = useCart();
  const { data: wishlist } = useWishlist();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const itemCount =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const wishlistCount = wishlist?.products.length ?? 0;

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
      setAnchorEl(null);
      setDrawerOpen(false);
      navigate("/login");
    }
  };

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={1}
        sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ gap: { xs: 0.5, sm: 1 } }}>
          {/* Hamburger — mobile/tablet only */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 0.5 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo — hides on mobile when the inline search is expanded, to save space */}
          {!(isMobile && mobileSearchOpen) && (
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: "none",
                color: "inherit",
                fontWeight: 700,
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
                whiteSpace: "nowrap",
              }}
            >
              Shop
            </Typography>
          )}

          {/* Desktop/tablet: search bar always visible, takes remaining space */}
          {!isMobile && (
            <Box sx={{ mx: 2, flexGrow: 1, display: "flex", maxWidth: 480 }}>
              <SearchBar />
            </Box>
          )}

          {/* Mobile: search either collapses to an icon, or expands to fill the bar */}
          {isMobile && mobileSearchOpen && (
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <SearchBar />
              <IconButton
                color="inherit"
                onClick={() => setMobileSearchOpen(false)}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          )}

          <Box sx={{ flexGrow: isMobile && mobileSearchOpen ? 0 : 1 }} />

          {!(isMobile && mobileSearchOpen) && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0, sm: 0.5 },
              }}
            >
              {isMobile && (
                <IconButton
                  color="inherit"
                  onClick={() => setMobileSearchOpen(true)}
                >
                  <SearchIcon />
                </IconButton>
              )}

              {/* Theme toggle — hidden on mobile (moved into the drawer instead) */}
              {!isMobile && <ThemeToggle />}

              {isAuthenticated && (
                <>
                  <IconButton
                    color="inherit"
                    component={RouterLink}
                    to="/wishlist"
                    sx={{ display: { xs: "none", sm: "inline-flex" } }}
                  >
                    <AnimatedBadge badgeContent={wishlistCount} color="error">
                      <FavoriteIcon />
                    </AnimatedBadge>
                  </IconButton>

                  <IconButton color="inherit" component={RouterLink} to="/cart">
                    <AnimatedBadge badgeContent={itemCount} color="primary">
                      <ShoppingCartIcon />
                    </AnimatedBadge>
                  </IconButton>

                  <Box sx={{ display: { xs: "none", sm: "inline-flex" } }}>
                    <NotificationBell />
                  </Box>
                </>
              )}

              {/* Avatar menu — desktop/tablet only; mobile uses the drawer instead */}
              {!isMobile &&
                (isAuthenticated ? (
                  <>
                    <IconButton
                      onClick={(e) => setAnchorEl(e.currentTarget)}
                      size="small"
                      sx={{ ml: 0.5 }}
                    >
                      <Avatar src={user?.avatar} sx={{ width: 32, height: 32 }}>
                        {user?.name?.charAt(0).toUpperCase()}
                      </Avatar>
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={() => setAnchorEl(null)}
                    >
                      <MenuItem disabled>{user?.email}</MenuItem>
                      <MenuItem
                        component={RouterLink}
                        to="/profile"
                        onClick={() => setAnchorEl(null)}
                      >
                        My Profile
                      </MenuItem>
                      <MenuItem
                        component={RouterLink}
                        to="/my-orders"
                        onClick={() => setAnchorEl(null)}
                      >
                        My Orders
                      </MenuItem>
                      <MenuItem
                        component={RouterLink}
                        to="/addresses"
                        onClick={() => setAnchorEl(null)}
                      >
                        Address Book
                      </MenuItem>
                      {user?.role?.name === "Super Admin" && (
                        <MenuItem
                          component={RouterLink}
                          to="/admin/dashboard"
                          onClick={() => setAnchorEl(null)}
                        >
                          Admin Dashboard
                        </MenuItem>
                      )}
                      <Divider />
                      <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Button color="inherit" component={RouterLink} to="/login">
                    Login
                  </Button>
                ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile navigation drawer — replaces the avatar dropdown menu entirely on small screens */}
      <Drawer anchor="left" open={drawerOpen} onClose={closeDrawer}>
        <Box sx={{ width: 280 }} role="presentation">
          {isAuthenticated && (
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar src={user?.avatar} sx={{ width: 44, height: 44 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ overflow: "hidden" }}>
                <Typography variant="subtitle2" noWrap>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {user?.email}
                </Typography>
              </Box>
            </Box>
          )}
          <Divider />

          <List>
            <ListItemButton component={RouterLink} to="/" onClick={closeDrawer}>
              <ListItemText primary="Home" />
            </ListItemButton>
            <ListItemButton
              component={RouterLink}
              to="/products"
              onClick={closeDrawer}
            >
              <ListItemText primary="Shop" />
            </ListItemButton>

            {isAuthenticated ? (
              <>
                <ListItemButton
                  component={RouterLink}
                  to="/profile"
                  onClick={closeDrawer}
                >
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="My Profile" />
                </ListItemButton>
                <ListItemButton
                  component={RouterLink}
                  to="/my-orders"
                  onClick={closeDrawer}
                >
                  <ListItemText primary="My Orders" />
                </ListItemButton>
                <ListItemButton
                  component={RouterLink}
                  to="/wishlist"
                  onClick={closeDrawer}
                >
                  <ListItemIcon>
                    <FavoriteIcon />
                  </ListItemIcon>
                  <ListItemText primary={`Wishlist (${wishlistCount})`} />
                </ListItemButton>
                <ListItemButton
                  component={RouterLink}
                  to="/addresses"
                  onClick={closeDrawer}
                >
                  <ListItemText primary="Address Book" />
                </ListItemButton>

                {user?.role?.name === "Super Admin" && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <ListItemButton
                      component={RouterLink}
                      to="/admin/dashboard"
                      onClick={closeDrawer}
                    >
                      <ListItemText primary="Admin Dashboard" />
                    </ListItemButton>
                  </>
                )}

                <Divider sx={{ my: 1 }} />
                <ListItemButton onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </>
            ) : (
              <ListItemButton
                component={RouterLink}
                to="/login"
                onClick={closeDrawer}
              >
                <ListItemText primary="Login" />
              </ListItemButton>
            )}

            <Divider sx={{ my: 1 }} />
            <Box
              sx={{
                px: 2,
                py: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="body2">Theme</Typography>
              <ThemeToggle />
            </Box>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
