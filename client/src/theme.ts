import { createTheme, type PaletteMode } from "@mui/material/styles";

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: "#FF6B35", contrastText: "#ffffff" },
      secondary: { main: "#0B1D3A" },
      success: { main: "#16A34A" },
      background:
        mode === "dark"
          ? { default: "#0B1D3A", paper: "#132a52" }
          : { default: "#FAFAFA", paper: "#ffffff" },
    },
    shape: {
      borderRadius: 12, // slightly softer, more modern corners app-wide
    },
    typography: {
      fontFamily: '"Manrope", "Inter", sans-serif',
      h1: { fontWeight: 800, letterSpacing: -0.5 },
      h2: { fontWeight: 800, letterSpacing: -0.5 },
      h5: { fontWeight: 700 },
      button: { fontWeight: 700 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none", // no ALL CAPS — more modern, readable
            fontWeight: 600,
            borderRadius: 10,
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
            border: "1px solid",
            borderColor: mode === "dark" ? "rgba(255,255,255,0.08)" : "#EDEDE8",
            boxShadow: "none",
            transition: "box-shadow 0.2s ease, transform 0.2s ease",
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow: "0 12px 24px rgba(11,29,58,0.08)",
            },
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
