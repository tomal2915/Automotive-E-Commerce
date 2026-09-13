import { useState } from "react";
import { Box, Container, Typography, TextField, Button } from "@mui/material";
import { motion } from "framer-motion";
import { enqueueSnackbar } from "notistack";

export default function NewsletterBanner() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // NOTE: purely front-end confirmation for now — wire this to a real
    // subscribe endpoint later if newsletter functionality is needed
    enqueueSnackbar("Thanks for subscribing!", { variant: "success" });
    setEmail("");
  };

  return (
    <Box sx={{ bgcolor: "#0B1D3A", py: 7 }}>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: "center", maxWidth: 500, mx: "auto" }}>
            <Typography
              variant="h5"
              fontWeight={700}
              mb={1}
              sx={{ color: "#fff" }}
            >
              Get exclusive deals in your inbox
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.7)" }} mb={3}>
              Subscribe for early access to sales, new arrivals, and special
              discounts.
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", gap: 1 }}
            >
              <TextField
                fullWidth
                size="small"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  bgcolor: "#fff",
                  borderRadius: 1,
                  "& fieldset": { border: "none" },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{ bgcolor: "#FF6B35", "&:hover": { bgcolor: "#e85a28" } }}
                component={motion.button}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
