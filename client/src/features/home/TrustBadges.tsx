import { Container, Grid, Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SecurityIcon from "@mui/icons-material/Security";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

const badges = [
  {
    icon: <LocalShippingIcon fontSize="large" />,
    title: "Fast Delivery",
    desc: "Across Bangladesh",
  },
  {
    icon: <SecurityIcon fontSize="large" />,
    title: "Secure Payment",
    desc: "SSLCommerz protected",
  },
  {
    icon: <AssignmentReturnIcon fontSize="large" />,
    title: "Easy Returns",
    desc: "7-day return window",
  },
  {
    icon: <SupportAgentIcon fontSize="large" />,
    title: "24/7 Support",
    desc: "We're here to help",
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function TrustBadges() {
  return (
    <Container sx={{ py: 6 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <Grid container spacing={3}>
          {badges.map((badge) => (
            <Grid key={badge.title} size={{ xs: 6, md: 3 }}>
              <motion.div variants={itemVariants}>
                <Box sx={{ textAlign: "center" }}>
                  <Box sx={{ color: "primary.main", mb: 1 }}>{badge.icon}</Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {badge.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {badge.desc}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Container>
  );
}
