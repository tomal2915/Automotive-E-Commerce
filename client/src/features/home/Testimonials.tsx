import { Container, Typography, Grid, Box, Avatar } from "@mui/material";
import { motion } from "framer-motion";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import Rating from "@mui/material/Rating";
import { useQuery } from "@tanstack/react-query";
import { fetchTestimonials } from "../testimonials/testimonialApi";

// Static placeholder testimonials — swap these for real customer reviews
// once you have them (or pull the highest-rated product reviews dynamically)
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Testimonials() {
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: fetchTestimonials,
  });

  if (!isLoading && (!testimonials || testimonials.length === 0)) return null; // hide the whole section gracefully if admin hasn't added any yet

  return (
    <Box sx={{ bgcolor: "background.default", py: 8 }}>
      <Container>
        {/* ... existing header markup ... */}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <Grid container spacing={3}>
            {(testimonials ?? []).map((t) => (
              <Grid key={t._id} size={{ xs: 12, md: 4 }}>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -6 }}
                  style={{ height: "100%" }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      p: 3,
                      borderRadius: 3,
                      bgcolor: "background.paper",
                      boxShadow: 2,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <FormatQuoteIcon
                      sx={{
                        color: "primary.main",
                        fontSize: 32,
                        opacity: 0.5,
                        mb: 1,
                      }}
                    />
                    <Typography
                      sx={{
                        flexGrow: 1,
                        color: "text.secondary",
                        mb: 2,
                        fontStyle: "italic",
                      }}
                    >
                      "{t.quote}"
                    </Typography>
                    <Rating
                      value={t.rating}
                      readOnly
                      size="small"
                      sx={{ mb: 1.5 }}
                    />
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Avatar src={t.avatar} sx={{ bgcolor: "primary.main" }}>
                        {t.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography
                          sx={{ variant: "subtitle2", fontWeight: 700 }}
                        >
                          {t.name}
                        </Typography>
                        <Typography
                          sx={{ variant: "caption", color: "text.secondary" }}
                        >
                          {t.role}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
}
