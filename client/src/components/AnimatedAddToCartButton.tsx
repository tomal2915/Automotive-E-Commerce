import { useState } from "react";
import { Button, type ButtonProps } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import CheckIcon from "@mui/icons-material/Check";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

interface Props extends Omit<ButtonProps, "onClick"> {
  onAddToCart: () => void;
  isPending: boolean;
}

// Shows a satisfying "added" state briefly after clicking — instead of a
// plain button that gives no feedback beyond a badge count changing
// somewhere else on the screen (which the user might not even notice).
export default function AnimatedAddToCartButton({
  onAddToCart,
  isPending,
  disabled,
  ...rest
}: Props) {
  const [justAdded, setJustAdded] = useState(false);

  const handleClick = () => {
    onAddToCart();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <Button
      {...rest}
      onClick={handleClick}
      disabled={disabled || isPending}
      component={motion.button}
      whileTap={{ scale: 0.95 }}
      sx={{ position: "relative", overflow: "hidden", ...rest.sx }}
    >
      <AnimatePresence mode="wait">
        {justAdded ? (
          <motion.span
            key="added"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <CheckIcon fontSize="small" /> Added!
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <ShoppingCartIcon fontSize="small" />{" "}
            {isPending ? "Adding..." : "Add to Cart"}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
