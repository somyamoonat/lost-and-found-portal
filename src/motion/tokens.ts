/**
 * Motion System Design Tokens
 * 
 * Philosophy: Every animation must answer one of:
 * - What changed
 * - Where did it go
 * - What can I press
 * - What is happening now
 * 
 * Rules:
 * - Animate transform and opacity only.
 * - Never animate width/height/top/left directly.
 * - Exits run at roughly 60% of entrance duration.
 */

export const easings = {
  out: [0.22, 1, 0.36, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
};

export const springs = {
  soft: {
    stiffness: 260,
    damping: 30,
  },
  snappy: {
    stiffness: 420,
    damping: 34,
  },
  sheet: {
    stiffness: 300,
    damping: 32,
  },
} as const;

export const durations = {
  micro: 0.15,
  ui: 0.3,
  page: 0.45,
  // Exits run at about 60% of entrance duration
  microExit: 0.09,
  uiExit: 0.18,
  pageExit: 0.27,
} as const;

export const transitions = {
  microOut: {
    duration: durations.micro,
    ease: easings.out,
  },
  microExit: {
    duration: durations.microExit,
    ease: easings.out,
  },
  uiOut: {
    duration: durations.ui,
    ease: easings.out,
  },
  uiExit: {
    duration: durations.uiExit,
    ease: easings.out,
  },
  pageOut: {
    duration: durations.page,
    ease: easings.out,
  },
  pageExit: {
    duration: durations.pageExit,
    ease: easings.out,
  },
  softSpring: springs.soft,
  snappySpring: springs.snappy,
  sheetSpring: springs.sheet,
} as const;
