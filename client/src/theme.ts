import { createTheme, type PaletteMode } from "@mui/material/styles";

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: "#38bdf8" },
      background:
        mode === "dark"
          ? { default: "#0f172a", paper: "#1e293b" }
          : { default: "#f8fafc", paper: "#ffffff" },
    },
    shape: {
      borderRadius: 10, // slightly softer, more modern corners app-wide
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none", // no ALL CAPS — more modern, readable
            fontWeight: 600,
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            "&:hover": {
              transform: "translateY(-1px)",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            transition: "box-shadow 0.2s ease, transform 0.2s ease",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
        },
      },
    },
  });
