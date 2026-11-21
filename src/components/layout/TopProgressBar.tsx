import React, { useEffect, useState } from "react";
import { useNavigation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { easings } from "@/motion/tokens";

interface TopProgressBarProps {
  isManualLoading?: boolean;
}

/**
 * 2px campus-green progress bar at the very top of the viewport.
 * Shows activity during page routing or data loading.
 */
export const TopProgressBar: React.FC<TopProgressBarProps> = ({ isManualLoading = false }) => {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading" || isManualLoading;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setVisible(true);
    } else {
      timer = setTimeout(() => {
        setVisible(false);
      }, 350);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[2px] pointer-events-none overflow-hidden bg-transparent">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={
              isLoading
                ? { x: ["-100%", "-20%", "0%"], width: ["20%", "70%", "90%"] }
                : { x: "0%", width: "100%" }
            }
            exit={{ opacity: 0 }}
            transition={
              isLoading
                ? {
                    duration: 1.4,
                    repeat: Infinity,
                    ease: easings.out,
                  }
                : {
                    duration: 0.25,
                    ease: easings.out,
                  }
            }
            className="h-full bg-campus-green"
          />
        )}
      </AnimatePresence>
    </div>
  );
};
