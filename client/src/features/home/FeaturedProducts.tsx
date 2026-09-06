import { Container, Typography, Grid, Box } from "@mui/material";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "../products/productApi";
import ProductCard from "../products/ProductCard";
import ProductCardSkeleton from "../products/ProductCardSkeleton";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ["products", { page: 1, limit: 8 }],
    queryFn: () => fetchProducts({ page: 1, limit: 8 }),
  });

  return (
    <Container sx={{ py: 6 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Trending Now
        </Typography>
      </Box>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        <Grid container spacing={2}>
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                  <ProductCardSkeleton />
                </Grid>
              ))
            : data?.products.map((product) => (
                <Grid key={product._id} size={{ xs: 12, sm: 6, md: 3 }}>
                  <motion.div variants={itemVariants}>
                    <ProductCard product={product} />
                  </motion.div>
                </Grid>
              ))}
        </Grid>
      </motion.div>
    </Container>
  );
}
