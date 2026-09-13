import { useRef, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Link as RouterLink } from "react-router-dom";
import { useCategories } from "./useCategories";
import type { Category } from "./categoryApi";

// Recursive indented list — used by the MOBILE drawer, unchanged from before.
export function CategoryColumnList({
  categories,
  onNavigate,
  depth = 0,
}: {
  categories: Category[];
  onNavigate: () => void;
  depth?: number;
}) {
  return (
    <List dense disablePadding>
      {categories.map((cat) => (
        <Box key={cat._id}>
          <ListItemButton
            component={RouterLink}
            to={`/products?category=${encodeURIComponent(cat.name)}`}
            onClick={onNavigate}
            sx={{ py: 0.5, pl: depth * 2 }}
          >
            <ListItemText
              primary={cat.name}
              slotProps={{
                primary: {
                  fontWeight: depth === 0 ? 600 : 400,
                  fontSize: depth === 0 ? "0.9rem" : "0.85rem",
                },
              }}
            />
          </ListItemButton>
          {cat.subcategories && cat.subcategories.length > 0 && (
            <CategoryColumnList
              categories={cat.subcategories}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          )}
        </Box>
      ))}
    </List>
  );
}

const CLOSE_DELAY = 150; // grace period so moving across small gaps doesn't close the menu

// Desktop cascading mega-menu: a horizontal bar of top-level categories,
// hovering one opens a flyout panel; hovering an item within that panel
// that has children opens another column to its right — Startech-style.
export default function CategoryMegaMenu() {
  const { data: categories } = useCategories();
  const [openTopId, setOpenTopId] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<Category[]>([]);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setOpenTopId(null);
      setActivePath([]);
    }, CLOSE_DELAY);
  };

  const closeAll = () => {
    setOpenTopId(null);
    setActivePath([]);
  };

  const openTopCategory = categories?.find((c) => c._id === openTopId);

  // Build the columns to render: the top category's own subcategories,
  // then one extra column per level the user has hovered into
  const columns: Category[][] = [];
  if (openTopCategory?.subcategories?.length) {
    columns.push(openTopCategory.subcategories);
    let current = openTopCategory.subcategories;
    for (const activeItem of activePath) {
      const match = current.find((c) => c._id === activeItem._id);
      if (match?.subcategories?.length) {
        columns.push(match.subcategories);
        current = match.subcategories;
      } else {
        break;
      }
    }
  }

  const handleHoverAtDepth = (depth: number, cat: Category) => {
    cancelClose();
    // Truncate the path at this depth, then extend — hovering a sibling
    // in an earlier column collapses whatever was open deeper than it
    setActivePath((prev) => [...prev.slice(0, depth), cat]);
  };

  return (
    <Box
      sx={{ position: "relative" }}
      onMouseLeave={scheduleClose}
      onMouseEnter={cancelClose}
    >
      <Box
        sx={{
          display: "flex",
          gap: 3,
          px: 2,
          py: 1,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          overflowX: "auto",
        }}
      >
        {categories?.map((cat) => (
          <Typography
            key={cat._id}
            component={RouterLink}
            to={`/products?category=${encodeURIComponent(cat.name)}`}
            onMouseEnter={() => {
              cancelClose();
              setOpenTopId(cat._id);
              setActivePath([]);
            }}
            sx={{
              textDecoration: "none",
              whiteSpace: "nowrap",
              fontSize: "0.9rem",
              fontWeight: 500,
              color: cat._id === openTopId ? "primary.main" : "text.primary",
              cursor: "pointer",
              "&:hover": { color: "primary.main" },
            }}
          >
            {cat.name}
          </Typography>
        ))}
      </Box>

      {openTopCategory && columns.length > 0 && (
        <Paper
          elevation={4}
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: (t) => t.zIndex.appBar + 1,
            display: "flex",
          }}
        >
          {columns.map((columnItems, depth) => (
            <List
              key={depth}
              dense
              sx={{
                minWidth: 220,
                py: 0,
                borderRight: depth < columns.length - 1 ? 1 : 0,
                borderColor: "divider",
                maxHeight: 420,
                overflowY: "auto",
              }}
            >
              {columnItems.map((item) => {
                const isActiveInPath = activePath[depth]?._id === item._id;
                const hasChildren = (item.subcategories?.length ?? 0) > 0;
                return (
                  <ListItemButton
                    key={item._id}
                    component={RouterLink}
                    to={`/products?category=${encodeURIComponent(item.name)}`}
                    onMouseEnter={() => handleHoverAtDepth(depth, item)}
                    onClick={closeAll}
                    selected={isActiveInPath}
                    sx={{
                      justifyContent: "space-between",
                      "&.Mui-selected": {
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        "&:hover": { bgcolor: "primary.dark" },
                      },
                    }}
                  >
                    <ListItemText primary={item.name} />
                    {hasChildren && <ChevronRightIcon fontSize="small" />}
                  </ListItemButton>
                );
              })}
            </List>
          ))}
        </Paper>
      )}
    </Box>
  );
}
