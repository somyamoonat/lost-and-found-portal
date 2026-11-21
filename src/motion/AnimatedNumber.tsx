import React, { useEffect } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { springs } from "./tokens";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  format?: (val: number) => string;
}

/**
 * Springs smoothly between numerical values.
 * Useful for counts of lost items, desk hours remaining, or catalog metrics.
 */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  className = "",
  format,
}) => {
  const spring = useSpring(value, springs.soft);
  const display = useTransform(spring, (current) => {
    const rounded = Math.round(current);
    return format ? format(rounded) : rounded.toLocaleString();
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={className}>{display}</motion.span>;
};
