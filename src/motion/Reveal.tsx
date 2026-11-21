import React, { useRef } from "react";
import { motion, useInView, type HTMLMotionProps } from "motion/react";
import { durations, easings } from "./tokens";

interface RevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  yOffset?: number;
}

/**
 * Scroll reveal primitive.
 * Strictly adheres to rule: uses useInView with once: true and margin: "-80px".
 * Used sparingly for meaningful section entries.
 */
export const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  yOffset = 14,
  className = "",
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-80px",
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset }}
      transition={{
        duration: durations.ui,
        delay,
        ease: easings.out,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
