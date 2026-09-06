// src/Root.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { queryClient } from "./lib/queryClient";
import { getTheme } from "./theme";
import { useThemeStore } from "./store/themeStore";
import App from "./App.tsx";
import { SnackbarProvider } from "notistack";

export default function Root() {
  const mode = useThemeStore((state) => state.mode);
  const theme = getTheme(mode);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SnackbarProvider
            maxSnack={3}
            autoHideDuration={2500}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </SnackbarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
