import type { Variants } from "motion/react";
import { easings, durations, transitions } from "./tokens";

/**
 * Standard variants for the motion system.
 * Animates transform and opacity ONLY.
 */

// Text slides up from inside an overflow-hidden wrapper line
export const maskedLineVariants: Variants = {
  initial: {
    y: "100%",
  },
  animate: {
    y: 0,
    transition: transitions.uiOut,
  },
  exit: {
    y: "100%",
    transition: transitions.uiExit,
  },
};

// Clean rise in for cards, list items, and sections
export const riseInVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.uiOut,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: transitions.uiExit,
  },
};

// Stagger container: stagger max 0.04s, total never above 0.4s
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

// Subtle fade and scale for popovers, menus and dialogs
export const fadeScaleVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.96,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: transitions.uiOut,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: transitions.uiExit,
  },
};

// Sheet slide in from right (desktop) or bottom (mobile)
export const slideSheetRightVariants: Variants = {
  initial: {
    x: "100%",
    opacity: 1,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: transitions.sheetSpring,
  },
  exit: {
    x: "100%",
    opacity: 1,
    transition: {
      duration: durations.uiExit,
      ease: easings.out,
    },
  },
};

export const slideSheetBottomVariants: Variants = {
  initial: {
    y: "100%",
    opacity: 1,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: transitions.sheetSpring,
  },
  exit: {
    y: "100%",
    opacity: 1,
    transition: {
      duration: durations.uiExit,
      ease: easings.out,
    },
  },
};

// Overlay backdrop fade (flat color tint, NO backdrop blur)
export const backdropFadeVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: durations.ui,
      ease: easings.out,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: durations.uiExit,
      ease: easings.out,
    },
  },
};
