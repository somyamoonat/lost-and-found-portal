import React from "react";
import { motion, useScroll, useSpring } from "motion/react";
import {
  Inbox,
  Search,
  ShieldCheck,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { springs } from "@/motion/tokens";

interface ProtocolPhase {
  phase: string;
  tag: string;
  title: string;
  icon: React.ReactNode;
  summary: string;
  requirement: string;
}

const phases: ProtocolPhase[] = [
  {
    phase: "PHASE 01",
    tag: "Vault Lodgment",
    title: "Physical intake and logging",
    icon: <Inbox className="w-5 h-5 text-campus-green" strokeWidth={1.5} />,
    summary:
      "Surrendered articles are cataloged within two hours of intake, photographed for internal verification, and secured in Central Library Room 104 vaults.",
    requirement: "Confidential identifying markings are withheld from public view.",
  },
  {
    phase: "PHASE 02",
    tag: "Cross-Reference",
    title: "Loss registry matching",
    icon: <Search className="w-5 h-5 text-campus-green" strokeWidth={1.5} />,
    summary:
      "The registry automatically cross-references surrendered articles against active student loss reports twice daily using category taxonomy and campus location proximity.",
    requirement: "Potential matches dispatch automated university email alerts.",
  },
  {
    phase: "PHASE 03",
    tag: "Ownership Audit",
    title: "Double-sided verification",
    icon: <ShieldCheck className="w-5 h-5 text-campus-green" strokeWidth={1.5} />,
    summary:
      "Claimants must submit private proof only the owner would know—such as lock screen credentials, purchase serial invoices, or concealed scratch markings.",
    requirement: "Desk attendants cross-verify statements against private intake notes.",
  },
  {
    phase: "PHASE 04",
    tag: "Custody Release",
    title: "Handover and sign-off",
    icon: <CheckCircle2 className="w-5 h-5 text-campus-green" strokeWidth={1.5} />,
    summary:
      "Verified articles are released in person at Room 104 upon presenting an official university photo ID and providing a physical custody release signature.",
    requirement: "Generates an official custody certificate archived for 90 days.",
  },
];

export const HowItWorks: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "end 65%"],
  });

  const smoothProgress = useSpring(scrollYProgress, springs.soft);

  return (
    <section ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-line pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-[12px] text-campus-green font-semibold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" strokeWidth={1.5} />
            <span>Chain-of-custody standard protocol</span>
          </div>
          <h2 className="type-h2 text-ink">Intake and release protocol</h2>
          <p className="type-small text-ink-muted mt-0.5">
            Four mandatory custody phases governing surrendered property under University Regulation §4.2.
          </p>
        </div>
        <span className="text-[12px] text-ink-muted shrink-0 self-start sm:self-auto font-mono bg-paper px-2 py-0.5 rounded border border-line">
          Room 104 Standard Operating Procedure
        </span>
      </div>

      {/* Progress track */}
      <div className="relative w-full h-1 bg-line rounded-full overflow-hidden">
        <motion.div
          style={{ scaleX: smoothProgress, transformOrigin: "left" }}
          className="absolute inset-y-0 left-0 bg-campus-green rounded-full"
        />
      </div>

      {/* 2x2 Protocol Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pt-1">
        {phases.map((item, idx) => (
          <div
            key={item.phase}
            className="bg-surface border border-line rounded-[10px] p-5 sm:p-6 shadow-subtle flex flex-col justify-between space-y-4 hover:border-line/80 transition-colors"
          >
            <div className="space-y-3">
              {/* Card Top: Phase Tag & Icon */}
              <div className="flex items-center justify-between pb-2.5 border-b border-line">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-campus-green bg-green-tint px-2 py-0.5 rounded-[4px] border border-campus-green/20">
                    {item.phase}
                  </span>
                  <span className="text-[12px] text-ink-muted font-medium">
                    {item.tag}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-[6px] bg-paper border border-line flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h3 className="text-[16px] font-semibold text-ink leading-snug">
                  {idx + 1}. {item.title}
                </h3>
                <p className="text-[13px] text-ink-muted leading-relaxed">
                  {item.summary}
                </p>
              </div>
            </div>

            {/* Requirement Footer */}
            <div className="pt-3 border-t border-line text-[12px] text-ink-muted flex items-start gap-1.5 bg-paper/50 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 p-3.5 sm:px-5 rounded-b-[10px]">
              <span className="font-semibold text-ink shrink-0">Custody Rule:</span>
              <span className="leading-snug">{item.requirement}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
