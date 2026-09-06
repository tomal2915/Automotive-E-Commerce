import { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  IconButton,
  useMediaQuery,
  Typography,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Outlet, Link as RouterLink, useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import CategoryIcon from "@mui/icons-material/Category";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import RateReviewIcon from "@mui/icons-material/RateReview";

const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard", icon: <DashboardIcon /> },
  { label: "Products", path: "/admin/products", icon: <InventoryIcon /> },
  { label: "Categories", path: "/admin/categories", icon: <CategoryIcon /> },
  { label: "Orders", path: "/admin/orders", icon: <ShoppingBagIcon /> },
  { label: "Returns", path: "/admin/returns", icon: <AssignmentReturnIcon /> },
  { label: "Coupons", path: "/admin/coupons", icon: <LocalOfferIcon /> },
  { label: "Users", path: "/admin/users", icon: <PeopleIcon /> },
  {
    label: "Testimonials",
    path: "/admin/testimonials",
    icon: <RateReviewIcon />,
  },
];

const SIDEBAR_WIDTH = 240;

export default function AdminLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <Box sx={{ width: SIDEBAR_WIDTH }}>
      <Toolbar /> {/* aligns sidebar content below the fixed top navbar */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="overline" color="text.secondary">
          Admin Panel
        </Typography>
      </Box>
      <Divider />
      <List>
        {ADMIN_NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.path}
            component={RouterLink}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={() => setMobileOpen(false)}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: SIDEBAR_WIDTH,
              boxSizing: "border-box",
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        {isMobile && (
          <Box
            sx={{
              position: "sticky",
              top: 56,
              zIndex: 1,
              bgcolor: "background.default",
              px: 1,
              py: 0.5,
            }}
          >
            <IconButton onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
          </Box>
        )}
        <Outlet />
      </Box>
    </Box>
  );
}
