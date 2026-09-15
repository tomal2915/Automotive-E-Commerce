import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import Navbar, { NAVBAR_APPBAR_ID } from "./components/Navbar";
import { useSessionRestore } from "./features/auth/useSessionRestore";
import { CircularProgress, Box } from "@mui/material";
import { AppErrorBoundary } from "./components/ErrorBoundary";
import Footer from "./components/Footer";
import { useSocket } from "./hooks/useSocket";

function App() {
  useSocket(); // connects/disconnects automatically as auth state changes
  const { isRestoring } = useSessionRestore();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const [navbarHeight, setNavbarHeight] = useState(64);

  // Measures the AppBar's actual rendered height (main toolbar + the
  // category bar row when present) instead of assuming a fixed value —
  // so this keeps working if the navbar's height changes again later
  // (extra rows, responsive breakpoints, etc).
  useEffect(() => {
    const measure = () => {
      const el = document.getElementById(NAVBAR_APPBAR_ID);
      if (el) setNavbarHeight(el.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isRestoring]);

  if (isRestoring) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AppErrorBoundary>
      <Navbar />
      <Box sx={{ height: navbarHeight }} />{" "}
      <Box sx={{ minHeight: `calc(100vh - ${navbarHeight}px - 200px)` }}>
        <AppRouter />
      </Box>
      {!isAdminRoute && <Footer />}
    </AppErrorBoundary>
  );
}

export default App;
