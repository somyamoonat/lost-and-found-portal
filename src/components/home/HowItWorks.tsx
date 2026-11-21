import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { springs } from "@/motion/tokens";

interface StepData {
  number: number;
  title: string;
  description: string;
}

const steps: StepData[] = [
  {
    number: 1,
    title: "Report or search",
    // 16 words:
    description:
      "File your missing property report or search the catalog of articles surrendered across campus intake desks.",
  },
  {
    number: 2,
    title: "We match and notify you",
    // 16 words:
    description:
      "Campus personnel cross-reference unique item descriptions and alert your student email when a potential match arrives.",
  },
  {
    number: 3,
    title: "Verify it's yours",
    // 12 words:
    description:
      "Confirm distinctive characteristics, unlock credentials, or serial records before custody release approval.",
  },
  {
    number: 4,
    title: "Collect from the desk",
    // 16 words:
    description:
      "Bring your university photo ID to Central Library Commons Room 104 to collect your verified article.",
  },
];

export const HowItWorks: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress through the sequence container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 55%"],
  });

  const smoothProgress = useSpring(scrollYProgress, springs.soft);

  return (
    <section className="space-y-6">
      <div className="border-b border-line pb-3">
        <h2 className="type-h2 text-ink">How it works</h2>
        <p className="type-small text-ink-muted mt-1">
          Four verified steps from reporting a lost article to safe physical retrieval.
        </p>
      </div>

      <div ref={containerRef} className="relative pl-6 sm:pl-8 py-2">
        {/* Background track line */}
        <div className="absolute left-[19px] sm:left-[27px] top-6 bottom-6 w-[2px] bg-line pointer-events-none" />

        {/* Dynamic drawing line filled with campus-green */}
        <motion.div
          style={{
            scaleY: smoothProgress,
            transformOrigin: "top",
          }}
          className="absolute left-[19px] sm:left-[27px] top-6 bottom-6 w-[2px] bg-campus-green pointer-events-none"
        />

        {/* Steps List */}
        <div className="space-y-8 sm:space-y-10">
          {steps.map((step, idx) => {
            const threshold = idx / (steps.length - 1);
            return (
              <StepItem
                key={step.number}
                step={step}
                progress={smoothProgress}
                threshold={threshold}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

interface StepItemProps {
  step: StepData;
  progress: ReturnType<typeof useSpring>;
  threshold: number;
}

const StepItem: React.FC<StepItemProps> = ({ step, progress, threshold }) => {
  // Fill number badge when line reaches threshold
  const isActive = useTransform(progress, (val) => val >= threshold - 0.05);
  const [filled, setFilled] = React.useState(threshold === 0);

  React.useEffect(() => {
    return isActive.on("change", (latest) => {
      setFilled(latest);
    });
  }, [isActive]);

  return (
    <div className="relative flex items-start gap-4 sm:gap-6 group">
      {/* Step Number Circle */}
      <motion.div
        animate={
          filled
            ? {
                backgroundColor: "#1E5B4B",
                color: "#FFFFFF",
                borderColor: "#1E5B4B",
              }
            : {
                backgroundColor: "#FFFFFF",
                color: "#1A2220",
                borderColor: "#DCDFD8",
              }
        }
        transition={springs.soft}
        className="relative z-10 w-10 h-10 rounded-full border flex items-center justify-center font-bold text-[15px] shrink-0 select-none shadow-subtle -ml-5 sm:-ml-5"
      >
        <span>{step.number}</span>
      </motion.div>

      {/* Step Content */}
      <div className="space-y-1 pt-1.5 max-w-[65ch]">
        <h3 className="text-[17px] font-semibold text-ink leading-tight">
          {step.title}
        </h3>
        <p className="type-body text-ink-muted text-[15px] leading-relaxed">
          {step.description}
        </p>
      </div>
    </div>
  );
};
