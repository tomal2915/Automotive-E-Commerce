import { Box, Container, Typography, Link as MuiLink } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{ mt: 6, py: 3, borderTop: 1, borderColor: "divider" }}
    >
      <Container
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Shop BD. All rights reserved.
        </Typography>
        <Box sx={{ display: "flex", gap: 3 }}>
          <MuiLink
            component={RouterLink}
            to="/terms"
            variant="body2"
            color="text.secondary"
          >
            Terms of Service
          </MuiLink>
          <MuiLink
            component={RouterLink}
            to="/privacy"
            variant="body2"
            color="text.secondary"
          >
            Privacy Policy
          </MuiLink>
        </Box>
      </Container>
    </Box>
  );
}
