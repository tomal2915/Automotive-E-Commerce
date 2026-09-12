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
import BrandingWatermarkIcon from "@mui/icons-material/BrandingWatermark";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import RateReviewIcon from "@mui/icons-material/RateReview";
import PermMediaIcon from "@mui/icons-material/PermMedia";
// ASSUMPTION: adjust this path to wherever usePermission actually lives

import TuneIcon from '@mui/icons-material/Tune';
import SecurityIcon from '@mui/icons-material/Security';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { useAuthStore } from "../store/authStore";

const ADMIN_NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <DashboardIcon />,
    permission: "dashboard:watch",
  },
  {
    label: "Products",
    path: "/admin/products",
    icon: <InventoryIcon />,
    permission: "product:watch",
  },
  {
    label: "Categories",
    path: "/admin/categories",
    icon: <CategoryIcon />,
    permission: "category:watch",
  },
  {
    label: "Brands",
    path: "/admin/brands",
    icon: <BrandingWatermarkIcon />,
    permission: "brand:watch",
  },
  {
    label: "Attributes",
    path: "/admin/attributes",
    icon: <TuneIcon />,
    permission: "attribute:watch",
  },
  {
    label: "Media Library",
    path: "/admin/media",
    icon: <PermMediaIcon />,
    permission: "media:watch",
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: <ShoppingBagIcon />,
    permission: "order:watch",
  },
  {
    label: "Returns",
    path: "/admin/returns",
    icon: <AssignmentReturnIcon />,
    permission: "order:watch",
  },
  {
    label: "Coupons",
    path: "/admin/coupons",
    icon: <LocalOfferIcon />,
    permission: "coupon:watch",
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: <PeopleIcon />,
    permission: "user:watch",
  },
  {
    label: "Roles",
    path: "/admin/roles",
    icon: <SecurityIcon />,
    permission: "role:watch",
  },
  {
    label: "Permissions",
    path: "/admin/permissions",
    icon: <VpnKeyIcon />,
    permission: "permission:watch",
  },
  {
    label: "Testimonials",
    path: "/admin/testimonials",
    icon: <RateReviewIcon />,
    permission: "testimonial:watch",
  },
];

const SIDEBAR_WIDTH = 240;

export default function AdminLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const permissions = useAuthStore((state) => state.permissions);
  const visibleItems = ADMIN_NAV_ITEMS.filter((item) =>
    permissions.includes(item.permission),
  );

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
        {visibleItems.map((item) => (
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
