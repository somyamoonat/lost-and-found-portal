import React from "react";
import { motion } from "motion/react";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { springs, easings, durations } from "@/motion/tokens";
import { StatusChip } from "@/motion/StatusChip";
import { cn } from "@/lib/utils";

export interface ClaimTicketProps {
  refCode: string;
  itemTitle: string;
  date?: string;
  location?: string;
  status?: "open" | "verified" | "returned";
  animateEntrance?: boolean;
  className?: string;
}

/**
 * ClaimTicket:
 * The signature element of the whole site.
 * 
 * Physical properties:
 * - White ticket with a dashed perforation line
 * - Two half-circle notches cut into the sides/edges at the perforation
 * - Tag-amber (#E3A92F) stub on the left holding the reference code in IBM Plex Mono
 * - Details (item title, date, location, status) on the right
 * - Entrance: slides down about 24px out of a 6px dark slot line at the top
 *   using soft spring over 0.7s, followed by a 0.3s opacity highlight on the code.
 * 
 * HARD BANS:
 * - NO gradients
 * - NO glow
 * - NO purple/pink
 * - Sentence case everywhere
 */
export const ClaimTicket: React.FC<ClaimTicketProps> = ({
  refCode,
  itemTitle,
  date = "21 Nov 2026, 09:15 AM",
  location = "Central Library Intake Vault, Room 104",
  status = "open",
  animateEntrance = true,
  className,
}) => {
  return (
    <div className="relative overflow-hidden pt-3 pb-2 w-full max-w-lg mx-auto select-none">
      {/* 6px dark slot line aperture at the top */}
      <div
        data-testid="ticket-slot-line"
        className="w-36 sm:w-48 h-1.5 bg-[#1A2220] rounded-full mx-auto mb-2 relative z-10"
      />

      {/* Ticket Container sliding out of the slot */}
      <motion.div
        data-testid="claim-ticket-card"
        initial={animateEntrance ? { y: -24, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          y: springs.soft,
          opacity: { duration: durations.ui, ease: easings.out },
        }}
        className={cn(
          "relative bg-surface border border-line rounded-[10px] shadow-subtle overflow-hidden flex flex-col sm:flex-row items-stretch",
          className
        )}
      >
        {/* Left Stub: Tag-Amber solid background with reference code */}
        <div className="w-full sm:w-48 bg-tag-amber p-4 sm:p-5 flex flex-col justify-between shrink-0 text-[#1A2220] relative">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#1A2220]/80">
              <Ticket className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Campus custody pass</span>
            </div>
            <div className="text-[12px] font-medium text-[#1A2220]/75 mt-1">
              Claim reference
            </div>
          </div>

          {/* Reference code in IBM Plex Mono with 0.3s opacity highlight */}
          <div className="my-2.5">
            <motion.span
              data-testid="ticket-ref-code"
              initial={animateEntrance ? { opacity: 0.35 } : false}
              animate={{ opacity: 1 }}
              transition={{ delay: durations.page, duration: durations.ui, ease: easings.out }}
              className="font-mono text-[17px] sm:text-[19px] font-bold text-[#1A2220] tracking-tight bg-surface/90 px-2.5 py-1 rounded-[4px] border border-[#1A2220]/20 inline-block shadow-subtle"
            >
              {refCode}
            </motion.span>
          </div>

          <div className="text-[11px] text-[#1A2220]/75 font-normal leading-tight">
            Retain for desk intake
          </div>
        </div>

        {/* Desktop Vertical Perforation Line and Notches */}
        <div className="hidden sm:block absolute top-0 bottom-0 left-48 w-[1px] border-r border-dashed border-[#1A2220]/25 z-10" />
        <div
          data-testid="notch-top"
          className="hidden sm:block absolute top-[-9px] left-48 -translate-x-1/2 w-4 h-4 rounded-full bg-paper border border-line z-20"
        />
        <div
          data-testid="notch-bottom"
          className="hidden sm:block absolute bottom-[-9px] left-48 -translate-x-1/2 w-4 h-4 rounded-full bg-paper border border-line z-20"
        />

        {/* Mobile Horizontal Perforation Line and Notches */}
        <div className="sm:hidden w-full border-b border-dashed border-[#1A2220]/25 relative z-10" />
        <div
          className="sm:hidden absolute top-[118px] -left-2 w-4 h-4 rounded-full bg-paper border border-line z-20"
        />
        <div
          className="sm:hidden absolute top-[118px] -right-2 w-4 h-4 rounded-full bg-paper border border-line z-20"
        />

        {/* Right Details Section */}
        <div className="flex-1 p-4 sm:p-5 bg-surface flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-medium text-ink-muted">
                Official intake registry
              </span>
              <StatusChip status={status} />
            </div>
            <h4 className="text-[15px] sm:text-[16px] font-semibold text-ink line-clamp-2 leading-snug">
              {itemTitle}
            </h4>
          </div>

          <div className="space-y-1.5 pt-1 text-[13px] text-ink-muted border-t border-line/60">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-campus-green shrink-0" strokeWidth={1.5} />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-campus-green shrink-0" strokeWidth={1.5} />
              <span className="truncate">{location}</span>
            </div>
          </div>

          <p className="text-[11px] text-ink-muted leading-relaxed pt-1">
            Present this ticket along with student photo ID at Central Library Service Wing 104 to collect.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
