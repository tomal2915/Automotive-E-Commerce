import { useState } from "react";
import { Box, Container, Typography, IconButton } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useCategories } from "../categories/useCategories";

const FALLBACK_COLLECTIONS = [
  { _id: "1", name: "Automotive" },
  { _id: "2", name: "Electronics" },
  { _id: "3", name: "Fashion" },
  { _id: "4", name: "Home & Living" },
  { _id: "5", name: "Books" },
];

export default function HeroSection() {
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const [activeIndex, setActiveIndex] = useState(0);

  const collections =
    categories && categories.length > 0 ? categories : FALLBACK_COLLECTIONS;
  const count = collections.length;

  const next = () => setActiveIndex((i) => (i + 1) % count);
  const prev = () => setActiveIndex((i) => (i - 1 + count) % count);

  const visibleCount = window.innerWidth < 600 ? 3 : 5;
  const visibleCards = Array.from(
    { length: Math.min(visibleCount, count) },
    (_, i) => {
      const offset = i - Math.floor(Math.min(visibleCount, count) / 2);
      const index = (((activeIndex + offset) % count) + count) % count;
      return { ...collections[index], offset };
    },
  );

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: "#0B1D3A",
        py: { xs: 8, md: 11 },
      }}
    >
      {/* Soft radial glow behind the carousel, purely atmospheric */}
      <Box
        sx={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,107,53,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Container sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              component="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "2.1rem", sm: "3rem", md: "4rem" },
                lineHeight: 1.1,
                color: "#ffffff",
                mb: 2,
              }}
            >
              Everything you need,
              <br />
              delivered fast.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Typography
              sx={{
                color: "rgba(255,255,255,0.7)",
                mb: 4,
                fontSize: "1.1rem",
                maxWidth: 480,
                mx: "auto",
              }}
            >
              Auto parts, electronics, fashion, and home essentials — all in one
              place, across Bangladesh.
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ display: "flex", justifyContent: "center", gap: 12 }}
          >
            <IconButton
              onClick={prev}
              sx={{
                bgcolor: "rgba(255,255,255,0.1)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.18)" },
              }}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: 16, color: "#fff" }} />
            </IconButton>
            <IconButton
              onClick={next}
              sx={{
                bgcolor: "#FF6B35",
                "&:hover": { bgcolor: "#e85a28" },
              }}
            >
              <ArrowForwardIosIcon sx={{ fontSize: 16, color: "#fff" }} />
            </IconButton>
          </motion.div>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            gap: { xs: 1, sm: 1.5, md: 2 },
            minHeight: { xs: 200, md: 250 },
            px: { xs: 0, md: 4 },
            overflow: "hidden",
          }}
        >
          <AnimatePresence mode="popLayout">
            {visibleCards.map((card) => {
              const isCenter = card.offset === 0;
              const distance = Math.abs(card.offset);

              return (
                <motion.div
                  key={`${card._id}-${card.offset}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{
                    opacity: 1 - distance * 0.35,
                    y: isCenter ? -16 : distance * 10,
                    scale: isCenter ? 1 : 1 - distance * 0.08,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  style={{ zIndex: 10 - distance }}
                >
                  <Box
                    onClick={() =>
                      isCenter
                        ? navigate(
                            `/products?category=${encodeURIComponent(card.name)}`,
                          )
                        : setActiveIndex(
                            (activeIndex + card.offset + count) % count,
                          )
                    }
                    sx={{
                      width: { xs: 100, sm: 140, md: isCenter ? 190 : 160 },
                      bgcolor: isCenter ? "#ffffff" : "rgba(255,255,255,0.08)",
                      borderRadius: 3,
                      boxShadow: isCenter
                        ? "0 20px 40px rgba(0,0,0,0.35)"
                        : "none",
                      p: 2.5,
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                      "&:hover": { transform: "translateY(-4px)" },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: isCenter ? "1.15rem" : "0.95rem",
                        fontWeight: 700,
                        color: isCenter ? "#0B1D3A" : "rgba(255,255,255,0.75)",
                        mb: isCenter ? 1.5 : 0,
                      }}
                    >
                      {card.name}
                    </Typography>

                    {isCenter && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: "#FF6B35",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                        }}
                      >
                        Shop now <ArrowForwardIcon sx={{ fontSize: 16 }} />
                      </Box>
                    )}
                  </Box>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Box>
      </Container>
    </Box>
  );
}
