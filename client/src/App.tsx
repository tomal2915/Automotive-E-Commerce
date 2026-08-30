import AppRouter from "./routes/AppRouter";
import ThemeToggle from "./components/ThemeToggle";
import { useSessionRestore } from "./features/auth/useSessionRestore";
import { CircularProgress, Box } from "@mui/material";

function App() {
  const { isRestoring } = useSessionRestore();

  // Show a loading state while we check for an existing session,
  // so the app doesn't briefly flash a "logged out" UI on reload.
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
    <div style={{ padding: "1rem" }}>
      <ThemeToggle />
      <AppRouter />
    </div>
  );
}

export default App;
