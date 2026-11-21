import React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { springs } from "./tokens";

interface PressableProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  disabled?: boolean;
}

/**
 * Interactive pressable primitive providing tactile spring feedback (scale 0.98 on tap).
 * Animate transform only.
 */
export const Pressable = React.forwardRef<HTMLButtonElement, PressableProps>(
  ({ children, disabled = false, className = "", ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        transition={springs.snappy}
        disabled={disabled}
        className={className}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Pressable.displayName = "Pressable";
