import React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { durations, easings } from "./tokens";

interface PageTransitionProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

/**
 * Clean institutional page transition:
 * Animates transform and opacity only.
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{
        duration: durations.page,
        ease: easings.out,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
