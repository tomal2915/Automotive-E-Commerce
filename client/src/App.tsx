import { Toolbar } from "@mui/material";
import AppRouter from "./routes/AppRouter";
import Navbar from "./components/Navbar";
import { useSessionRestore } from "./features/auth/useSessionRestore";
import { CircularProgress, Box } from "@mui/material";
import { AppErrorBoundary } from "./components/ErrorBoundary";
import Footer from "./components/Footer";

function App() {
  const { isRestoring } = useSessionRestore();

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
      <Toolbar />
      <Box sx={{ minHeight: "calc(100vh - 200px)" }}>
        <AppRouter />
      </Box>
      <Footer />
    </AppErrorBoundary>
  );
}

export default App;
