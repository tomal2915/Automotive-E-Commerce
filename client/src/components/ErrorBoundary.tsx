import * as Sentry from "@sentry/react";
import { Box, Typography, Button, Container } from "@mui/material";

// Wraps the app so any uncaught render error shows a friendly fallback
// screen instead of a blank white page, and reports the error to Sentry
const ErrorFallback = ({ resetError }: { resetError: () => void }) => (
  <Container sx={{ py: 8, textAlign: "center" }}>
    <Typography sx={{ variant: "h4", mb: 2 }}>Something went wrong</Typography>
    <Typography sx={{ color: "text.secondary", mb: 3 }}>
      We've been notified and are looking into it. Please try refreshing the
      page.
    </Typography>
    <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
      <Button variant="contained" onClick={() => window.location.reload()}>
        Refresh Page
      </Button>
      <Button variant="outlined" onClick={() => (window.location.href = "/")}>
        Go Home
      </Button>
    </Box>
  </Container>
);

export const AppErrorBoundary = Sentry.withErrorBoundary(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
  { fallback: ErrorFallback },
);
