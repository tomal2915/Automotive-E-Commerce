import { Toolbar } from "@mui/material";
import AppRouter from "./routes/AppRouter";
import Navbar from "./components/Navbar";
import { useSessionRestore } from "./features/auth/useSessionRestore";
import { CircularProgress, Box } from "@mui/material";

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
    <>
      <Navbar />
      {/* This empty Toolbar pushes page content below the fixed AppBar,
          matching its height exactly (including responsive breakpoints) */}
      <Toolbar />
      <AppRouter />
    </>
  );
}

export default App;
