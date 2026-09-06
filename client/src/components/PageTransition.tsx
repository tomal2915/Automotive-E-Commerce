import { motion } from "framer-motion";

// Wraps any page's content with a subtle fade+slide-up entrance —
// makes route changes feel less like an abrupt page-swap and more
// like a continuous, polished experience.
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
