import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { springs } from "./tokens";

export type ItemStatus = "lost" | "returned" | "closed" | "open" | "verified" | "tag";

interface StatusChipProps {
  status: ItemStatus;
  label?: string;
  code?: string;
  className?: string;
  onClick?: () => void;
}

const statusConfig: Record<
  ItemStatus,
  {
    bg: string;
    text: string;
    border: string;
    dot: string;
    defaultLabel: string;
  }
> = {
  lost: {
    bg: "#FAECE9",
    text: "#B24A2F",
    border: "#E9C3BA",
    dot: "#B24A2F",
    defaultLabel: "Lost",
  },
  returned: {
    bg: "#EFF1F2",
    text: "#5B6770",
    border: "#D0D5D9",
    dot: "#5B6770",
    defaultLabel: "Returned to owner",
  },
  closed: {
    bg: "#EFF1F2",
    text: "#5B6770",
    border: "#D0D5D9",
    dot: "#5B6770",
    defaultLabel: "Case closed",
  },
  open: {
    bg: "#E3EEE9",
    text: "#1E5B4B",
    border: "#B8D6CB",
    dot: "#1E5B4B",
    defaultLabel: "Logged at desk",
  },
  verified: {
    bg: "#E3EEE9",
    text: "#1E5B4B",
    border: "#B8D6CB",
    dot: "#1E5B4B",
    defaultLabel: "Identity verified",
  },
  tag: {
    bg: "#FBF3E3",
    text: "#8A5A0A",
    border: "#EED59B",
    dot: "#E3A92F",
    defaultLabel: "Claim tag",
  },
};

/**
 * StatusChip:
 * - Shape: full radius only on status chips (rounded-full)
 * - Motion: layout & animated background/text/border color morphs
 * - Tag amber used ONLY for the claim-ticket / tag motif
 * - IBM Plex Mono used ONLY for reference codes like LF-2041
 */
export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  code,
  className,
  onClick,
}) => {
  const current = statusConfig[status] || statusConfig.open;
  const displayText = label || current.defaultLabel;

  return (
    <motion.span
      layout
      transition={springs.soft}
      onClick={onClick}
      style={{
        backgroundColor: current.bg,
        color: current.text,
        borderColor: current.border,
      }}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[13px] font-medium tracking-normal select-none transition-colors",
        onClick && "cursor-pointer hover:opacity-90",
        className
      )}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: current.dot }}
      />
      <span>{displayText}</span>
      {code && (
        <span className="font-mono text-[12px] font-semibold tracking-tight border-l border-current/25 pl-1.5 ml-0.5">
          {code}
        </span>
      )}
    </motion.span>
  );
};
