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
 * - All durations, springs, and easings must come from this token registry.
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
  tagSwing: {
    stiffness: 110,
    damping: 9,
  },
} as const;

export const durations = {
  micro: 0.15,
  ui: 0.3,
  page: 0.45,
  step: 0.35,
  // Exits run at about 60% of entrance duration
  microExit: 0.09,
  uiExit: 0.18,
  pageExit: 0.27,
  // Continuous & specialized timings
  skeleton: 1.6,
  pulse: 2.0,
  tagHighlight: 1.2,
  progress: 1.4,
  toastStandard: 4000,
  toastUndo: 6000,
} as const;

export const delays = {
  headlineStagger: 0.08,
  itemStagger: 0.04,
  minStagger: 0.02,
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
  stepOut: {
    duration: durations.step,
    ease: easings.out,
  },
  stepExit: {
    duration: durations.uiExit,
    ease: easings.out,
  },
  softSpring: springs.soft,
  snappySpring: springs.snappy,
  sheetSpring: springs.sheet,
  tagSpring: springs.tagSwing,
} as const;
