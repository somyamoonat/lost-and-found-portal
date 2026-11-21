import React from "react";
import { MotionConfig } from "motion/react";

interface MotionProviderProps {
  children: React.ReactNode;
}

/**
 * Top-level motion config that enforces user accessibility preferences:
 * Automatically disables or simplifies animations when prefers-reduced-motion is set.
 */
export const MotionProvider: React.FC<MotionProviderProps> = ({ children }) => {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
};
