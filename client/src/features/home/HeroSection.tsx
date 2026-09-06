import { Box, Container, Typography, Button, Grid } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0c1a2e 100%)",
        color: "#fff",
        py: { xs: 8, md: 12 },
      }}
    >
      {/* Ambient animated glow blobs — purely decorative, GPU-cheap */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: "-15%",
          left: "-10%",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      <Container sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography
                variant="overline"
                sx={{ color: "#38bdf8", letterSpacing: 2, fontWeight: 600 }}
              >
                YOUR ONE-STOP MARKETPLACE
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: "2.2rem", md: "3.5rem" },
                  fontWeight: 800,
                  lineHeight: 1.15,
                  mb: 2,
                }}
              >
                Everything you need,
                <br />
                <Box component="span" sx={{ color: "#38bdf8" }}>
                  delivered to your door.
                </Box>
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography
                sx={{
                  color: "#94a3b8",
                  fontSize: "1.1rem",
                  mb: 4,
                  maxWidth: 480,
                }}
              >
                From auto parts to electronics, fashion to home essentials —
                shop thousands of quality products with fast delivery across
                Bangladesh.
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/products")}
                  sx={{ px: 4, py: 1.5, fontSize: "1rem" }}
                >
                  Start Shopping
                </Button>
                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  variant="outlined"
                  size="large"
                  onClick={() => navigate("/register")}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: "1rem",
                    borderColor: "rgba(255,255,255,0.3)",
                    color: "#fff",
                  }}
                >
                  Create Account
                </Button>
              </Box>
            </motion.div>
          </Grid>

          <Grid
            size={{ xs: 12, md: 5 }}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotate: -3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              whileHover={{ rotate: 1, scale: 1.02 }}
            >
              <Box
                sx={{
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Box
                  component="img"
                  src="/placeholder-part.svg"
                  alt="Featured products"
                  sx={{ width: "100%", display: "block" }}
                />
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
