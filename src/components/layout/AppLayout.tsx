import React, { useEffect, useRef } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { TopProgressBar } from "./TopProgressBar";
import { durations, easings } from "@/motion/tokens";

/**
 * AppLayout:
 * - Top 2px progress bar
 * - Sticky responsive navbar
 * - Page transition with AnimatePresence (mode="popLayout") keyed by pathname
 * - Enter: opacity 0->1, y 10->0, 0.45s, out easing
 * - Exit: opacity->0, 0.18s
 * - Scroll to top on navigation, but restores scroll when navigating back to /browse
 * - Footer with institutional hours and 90-day retention policy
 */
export const AppLayout: React.FC = () => {
  const location = useLocation();
  const previousPathRef = useRef<string>("");
  const scrollPositionsRef = useRef<Record<string, number>>({});

  // Track and restore scroll positions
  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousPathRef.current;

    // Save scroll position of previous route
    if (previousPath) {
      scrollPositionsRef.current[previousPath] = window.scrollY;
    }

    // Scroll handling for new route
    if (currentPath === "/browse" || currentPath === "/") {
      const savedY = scrollPositionsRef.current[currentPath] || 0;
      // Slight delay to allow DOM transition to settle
      requestAnimationFrame(() => {
        window.scrollTo({ top: savedY, behavior: "instant" });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }

    previousPathRef.current = currentPath;
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink font-sans antialiased selection:bg-green-tint selection:text-campus-green">
      {/* 2px campus-green top progress bar */}
      <TopProgressBar />

      {/* Sticky Navbar */}
      <Navbar />

      {/* Main Content Area with Overlapping popLayout Transitions */}
      <main className="flex-1 relative w-full overflow-x-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: durations.page,
              ease: easings.out,
            }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Quiet Institutional Footer */}
      <Footer />
    </div>
  );
};
