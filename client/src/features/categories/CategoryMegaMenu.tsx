import { useRef, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Link as RouterLink } from "react-router-dom";
import { useCategories } from "./useCategories";
import type { Category } from "./categoryApi";

const categoryLink = (name: string) =>
  `/products?category=${encodeURIComponent(name)}`;

// Startech-style hover flyout: a horizontal strip of top-level categories;
// hovering one opens a two-column panel — left column lists its direct
// subcategories (highlighting the first, or whichever is hovered), right
// column shows that subcategory's own children (e.g. brands under "UPS").
export default function CategoryMegaMenu() {
  const { data: categories } = useCategories();
  const [activeTopId, setActiveTopId] = useState<string | null>(null);
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  const openTop = (cat: Category) => {
    clearTimeout(closeTimer.current);
    setActiveTopId(cat._id);
    // Default-highlight the first subcategory so its children show
    // immediately, matching the screenshot's default "UPS" state
    setActiveSubId(cat.subcategories?.[0]?._id ?? null);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => {
      setActiveTopId(null);
      setActiveSubId(null);
    }, 150); // small grace period so moving from the nav strip into the panel doesn't flicker-close it
  };

  const cancelClose = () => clearTimeout(closeTimer.current);

  const closeNow = () => {
    clearTimeout(closeTimer.current);
    setActiveTopId(null);
    setActiveSubId(null);
  };

  const activeTop = categories?.find((c) => c._id === activeTopId);
  const activeSub = activeTop?.subcategories?.find(
    (s) => s._id === activeSubId,
  );

  return (
    <Box sx={{ position: "relative" }} onMouseLeave={scheduleClose}>
      <Box sx={{ display: "flex", gap: 3, overflowX: "auto" }}>
        {categories?.map((cat) => (
          <Typography
            key={cat._id}
            component={RouterLink}
            to={categoryLink(cat.name)}
            onClick={closeNow}
            onMouseEnter={() => openTop(cat)}
            sx={{
              textDecoration: "none",
              color: activeTopId === cat._id ? "primary.main" : "text.primary",
              fontWeight: 600,
              fontSize: "0.9rem",
              py: 1,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {cat.name}
          </Typography>
        ))}
      </Box>

      {activeTop?.subcategories && activeTop.subcategories.length > 0 && (
        <Box
          onMouseEnter={cancelClose}
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: (t) => t.zIndex.appBar + 1,
            display: "flex",
            bgcolor: "background.paper",
            boxShadow: 4,
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          {/* Left column — direct subcategories of the hovered top category */}
          <List dense disablePadding sx={{ minWidth: 220, py: 1 }}>
            {activeTop.subcategories.map((sub) => {
              const hasChildren = !!sub.subcategories?.length;
              const isActive = sub._id === activeSubId;
              return (
                <ListItemButton
                  key={sub._id}
                  component={RouterLink}
                  to={categoryLink(sub.name)}
                  onClick={closeNow}
                  selected={isActive}
                  onMouseEnter={() => setActiveSubId(sub._id)}
                  sx={{
                    py: 0.75,
                    justifyContent: "space-between",
                    "&.Mui-selected": {
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      "&:hover": { bgcolor: "primary.dark" },
                    },
                  }}
                >
                  <ListItemText
                    primary={sub.name}
                    slotProps={{ primary: { fontSize: "0.9rem" } }}
                  />
                  {hasChildren && <ChevronRightIcon fontSize="small" />}
                </ListItemButton>
              );
            })}
            <Divider sx={{ my: 0.5 }} />
            <ListItemButton
              component={RouterLink}
              to={categoryLink(activeTop.name)}
              onClick={closeNow}
            >
              <ListItemText
                primary={`Show All ${activeTop.name}`}
                slotProps={{
                  primary: { fontSize: "0.85rem", color: "text.secondary" },
                }}
              />
            </ListItemButton>
          </List>

          {/* Right column — children of the currently highlighted subcategory */}
          {activeSub?.subcategories && activeSub.subcategories.length > 0 && (
            <List
              dense
              disablePadding
              sx={{
                minWidth: 220,
                py: 1,
                borderLeft: 1,
                borderColor: "divider",
              }}
            >
              {activeSub.subcategories.map((child) => (
                <ListItemButton
                  key={child._id}
                  component={RouterLink}
                  to={categoryLink(child.name)}
                  onClick={closeNow}
                  sx={{ py: 0.75 }}
                >
                  <ListItemText
                    primary={child.name}
                    slotProps={{ primary: { fontSize: "0.9rem" } }}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      )}
    </Box>
  );
}
