import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { queryClient } from "./lib/queryClient";
import { getTheme } from "./theme";
import { useThemeStore } from "./store/themeStore";
import App from "./App.tsx";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";

function Root() {
  const mode = useThemeStore((state) => state.mode);
  const theme = getTheme(mode);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
