import React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { durations } from "./tokens";
import { cn } from "@/lib/utils";

interface SkeletonProps extends HTMLMotionProps<"div"> {
  className?: string;
  shape?: "rect" | "circle" | "card";
}

/**
 * Flat opacity pulse skeleton placeholder.
 * HARD BAN COMPLIANCE:
 * - NO gradient shimmer
 * - NO purple/pink tint
 * - Pure flat opacity pulse between 0.4 and 0.85
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  shape = "rect",
  ...props
}) => {
  const shapeClass =
    shape === "circle"
      ? "rounded-full"
      : shape === "card"
      ? "rounded-[12px]"
      : "rounded-[6px]";

  return (
    <motion.div
      aria-hidden="true"
      animate={{ opacity: [0.45, 0.85, 0.45] }}
      transition={{
        duration: durations.skeleton,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={cn("bg-[#E2E6DF]", shapeClass, className)}
      {...props}
    />
  );
};
