import { Card, CardContent, Skeleton } from "@mui/material";
import { motion } from "framer-motion";

export default function ProductCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ height: "100%" }}>
        <Skeleton variant="rectangular" height={160} />
        <CardContent>
          <Skeleton variant="text" height={32} width="80%" />
          <Skeleton variant="text" height={20} width="60%" sx={{ mb: 1 }} />
          <Skeleton variant="rounded" height={24} width={100} sx={{ mb: 1 }} />
          <Skeleton variant="text" height={32} width="40%" />
        </CardContent>
      </Card>
    </motion.div>
  );
}
