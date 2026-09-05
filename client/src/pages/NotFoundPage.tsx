import { Container, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Container sx={{ py: 10, textAlign: "center" }}>
      <SEO
        title="Page Not Found"
        description="The page you're looking for doesn't exist."
      />

      <Typography
        variant="h1"
        sx={{ fontSize: "6rem", fontWeight: 700, color: "primary.main" }}
      >
        404
      </Typography>
      <Typography sx={{ variant: "h5", mb: 2 }}>Page Not Found</Typography>
      <Typography sx={{ color: "text.secondary", mb: 4 }}>
        The page you're looking for doesn't exist or may have been moved.
      </Typography>

      <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
        <Button variant="contained" onClick={() => navigate("/")}>
          Go to Homepage
        </Button>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    </Container>
  );
}
