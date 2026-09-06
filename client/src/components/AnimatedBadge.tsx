import { Badge, type BadgeProps } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

// Re-mounts (and thus re-animates) the badge count every time it changes,
// giving a quick "pop" bounce so the user notices their cart/wishlist
// count actually updated — not just a silent number swap.
export default function AnimatedBadge({
  badgeContent,
  children,
  ...rest
}: BadgeProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={String(badgeContent)}
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        style={{ display: "inline-flex" }}
      >
        <Badge badgeContent={badgeContent} {...rest}>
          {children}
        </Badge>
      </motion.div>
    </AnimatePresence>
  );
}
