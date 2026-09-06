import { useState } from "react";
import { Box, Container, Typography, IconButton } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useCategories } from "../categories/useCategories";
import { useTheme, useMediaQuery } from "@mui/material";

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

  // Builds a fixed-size window of 5 cards centered on activeIndex,
  // wrapping around circularly — offset -2..2 drives the visual styling
  // (center card is large/white, neighbors fade and shrink with distance)
  const visibleCount = window.innerWidth < 600 ? 3 : 5;
  const visibleCards = Array.from(
    { length: Math.min(visibleCount, count) },
    (_, i) => {
      const offset = i - Math.floor(Math.min(visibleCount, count) / 2);
      // ... rest unchanged
      const index = (((activeIndex + offset) % count) + count) % count;
      return { ...collections[index], offset };
    },
  );

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(160deg, #f4f3f1 0%, #e9e7e3 50%, #eeecea 100%)",
        py: { xs: 8, md: 10 },
      }}
    >
      {/* Subtle marble-like diagonal veining, purely decorative */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.5,
          background:
            "repeating-linear-gradient(115deg, transparent 0px, transparent 60px, rgba(0,0,0,0.03) 61px, transparent 62px, transparent 140px)",
          pointerEvents: "none",
        }}
      />

      <Container sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontStyle: "italic",
                fontSize: { xs: "0.9rem", md: "1rem" },
                letterSpacing: 3,
                color: "#8a8578",
                mb: 1,
              }}
            >
              CURATED FOR EVERY LIFESTYLE
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
                fontFamily: '"Playfair Display", serif',
                fontWeight: 600,
                fontSize: { xs: "2rem", sm: "2.8rem", md: "4.5rem" },
                lineHeight: 1.1,
                color: "#26241f",
                letterSpacing: { xs: 1, md: 2 },
              }}
            >
              THOUGHTFULLY
              <br />
              SOURCED GOODS
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Typography
              sx={{ color: "#6b6558", mt: 2, mb: 3, fontSize: "1.05rem" }}
            >
              From auto parts to electronics, fashion to home essentials.
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
                bgcolor: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                "&:hover": { bgcolor: "#fff" },
              }}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: 16, color: "#26241f" }} />
            </IconButton>
            <IconButton
              onClick={next}
              sx={{
                bgcolor: "#26241f",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                "&:hover": { bgcolor: "#3a372f" },
              }}
            >
              <ArrowForwardIosIcon sx={{ fontSize: 16, color: "#fff" }} />
            </IconButton>
          </motion.div>
        </Box>

        {/* Collection carousel — center card highlighted, neighbors fade with distance */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            gap: { xs: 1, sm: 1.5, md: 2 },
            minHeight: { xs: 220, md: 280 },
            px: { xs: 0, md: 4 },
            overflow: "hidden", // prevents side cards from causing horizontal scroll on narrow screens
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
                    y: isCenter ? -20 : distance * 10,
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
                      width: { xs: 100, sm: 140, md: isCenter ? 200 : 170 },
                      bgcolor: isCenter ? "#fff" : "rgba(255,255,255,0.5)",
                      borderRadius: 3,
                      boxShadow: isCenter
                        ? "0 20px 40px rgba(0,0,0,0.15)"
                        : "none",
                      p: 2.5,
                      cursor: "pointer",
                      filter: isCenter ? "none" : "grayscale(0.3)",
                      transition: "box-shadow 0.3s ease",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: isCenter
                          ? '"Playfair Display", serif'
                          : "inherit",
                        fontStyle: isCenter ? "italic" : "normal",
                        fontSize: isCenter ? "1.3rem" : "1rem",
                        fontWeight: isCenter ? 400 : 500,
                        color: isCenter ? "#26241f" : "#8a8578",
                        mb: 0.5,
                      }}
                    >
                      {card.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        letterSpacing: 1,
                        color: "#a8a296",
                        mb: isCenter ? 2 : 0,
                      }}
                    >
                      COLLECTION
                    </Typography>

                    {isCenter && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: "#26241f",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          mt: 1,
                        }}
                      >
                        Discover <ArrowForwardIcon sx={{ fontSize: 16 }} />
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
