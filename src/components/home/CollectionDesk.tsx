import React from "react";
import { motion } from "motion/react";
import {
  MapPin,
  Clock,
  Phone,
  IdCard,
  ShieldCheck,
  Building,
} from "lucide-react";
import { collegeConfig } from "@/config/college";
import { durations } from "@/motion/tokens";

export function getDeskStatus(date: Date = new Date()): {
  isOpen: boolean;
  statusText: string;
} {
  const dayIndex = date.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const hour = date.getHours() + date.getMinutes() / 60;

  if (dayIndex >= 1 && dayIndex <= 4) {
    // Mon-Thu: 08:30 – 18:00
    if (hour >= 8.5 && hour < 18) {
      return { isOpen: true, statusText: "Open until 6:00 pm" };
    }
  } else if (dayIndex === 5) {
    // Fri: 08:30 – 17:00
    if (hour >= 8.5 && hour < 17) {
      return { isOpen: true, statusText: "Open until 5:00 pm" };
    }
  } else if (dayIndex === 6) {
    // Sat: 10:00 – 14:00
    if (hour >= 10 && hour < 14) {
      return { isOpen: true, statusText: "Open until 2:00 pm" };
    }
  }

  // Closed logic
  if (dayIndex === 0) {
    return { isOpen: false, statusText: "Opens Monday at 8:30 am" };
  } else if (dayIndex === 6 && hour >= 14) {
    return { isOpen: false, statusText: "Opens Monday at 8:30 am" };
  } else if (dayIndex === 5 && hour >= 17) {
    return { isOpen: false, statusText: "Opens tomorrow at 10:00 am" };
  } else if (hour < 8.5) {
    return { isOpen: false, statusText: "Opens today at 8:30 am" };
  } else {
    return { isOpen: false, statusText: "Opens tomorrow at 8:30 am" };
  }
}

export const CollectionDesk: React.FC = () => {
  const { isOpen, statusText } = getDeskStatus();

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-line pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-[12px] text-campus-green font-semibold uppercase tracking-wider mb-1">
            <Building className="w-4 h-4" strokeWidth={1.5} />
            <span>Central campus intake & custody facility</span>
          </div>
          <h2 className="type-h2 text-ink">Physical collection desk & retention vault</h2>
          <p className="type-small text-ink-muted mt-0.5">
            On-campus verification office, secure property vaults, and statutory 90-day retention custody.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <motion.span
            animate={isOpen ? { opacity: [1, 0.35, 1] } : { opacity: 1 }}
            transition={
              isOpen
                ? {
                    duration: durations.pulse,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
                : undefined
            }
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isOpen ? "bg-campus-green" : "bg-slate"
            }`}
          />
          <span className="text-[13px] font-semibold text-ink font-mono bg-paper px-2 py-0.5 rounded border border-line">
            {statusText}
          </span>
        </div>
      </div>

      {/* Asymmetric 7 : 5 Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: Physical Desk Operations & Schedule */}
        <div className="lg:col-span-7 bg-surface border border-line rounded-[10px] p-5 sm:p-6 shadow-subtle space-y-6">
          {/* Location & Contact Bar */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-line">
            <div>
              <span className="text-[11px] font-bold text-campus-green uppercase tracking-wider block mb-1">
                Walk-In Custody Office
              </span>
              <h3 className="text-[18px] font-semibold text-ink leading-snug">
                {collegeConfig.contact.deskLocation}
              </h3>
              <p className="text-[13px] text-ink-muted mt-0.5">
                {collegeConfig.contact.room} · Central Campus Quadrangle
              </p>
            </div>

            <div className="flex flex-col gap-1.5 text-[13px] text-ink shrink-0 bg-paper p-3 rounded-[6px] border border-line">
              <div className="flex items-center gap-2 text-ink-muted">
                <Phone className="w-3.5 h-3.5 text-campus-green shrink-0" strokeWidth={1.5} />
                <span className="font-mono text-[12px] font-semibold text-ink">{collegeConfig.contact.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-ink-muted text-[12px]">
                <MapPin className="w-3.5 h-3.5 text-campus-green shrink-0" strokeWidth={1.5} />
                <span>Service Wing ground floor entry</span>
              </div>
            </div>
          </div>

          {/* Schedule Table */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-campus-green shrink-0" strokeWidth={1.5} />
              <h4 className="text-[14px] font-semibold text-ink">Intake desk weekly schedule</h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[12px]">
              {collegeConfig.deskHours.schedule.map((item) => (
                <div
                  key={item.day}
                  className="p-2.5 bg-paper rounded-[6px] border border-line flex flex-col justify-between gap-1"
                >
                  <span className={item.isOpen ? "font-semibold text-ink" : "text-ink-muted font-medium"}>
                    {item.day}
                  </span>
                  <span className={item.isOpen ? "text-campus-green font-medium" : "text-brick font-medium"}>
                    {item.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Protocol Notice */}
          <div className="p-3.5 bg-paper/70 rounded-[6px] border border-line flex items-start gap-3 text-[12px] text-ink-muted">
            <IdCard className="w-4 h-4 text-campus-green shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="space-y-0.5 leading-relaxed">
              <strong className="text-ink font-semibold">Physical identification requirement:</strong>
              <p>All custody releases require active university photo credentials or government photo ID with an intake sign-off signature.</p>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: 90-Day Statutory Retention Lifecycle Protocol */}
        <div className="lg:col-span-5 bg-surface border border-line rounded-[10px] p-5 sm:p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div>
              <span className="font-mono text-[11px] font-bold text-campus-green uppercase tracking-wider block">
                Statutory Protocol §4.2
              </span>
              <h3 className="text-[15px] font-semibold text-ink leading-tight mt-0.5">
                90-day custody retention
              </h3>
            </div>
            <ShieldCheck className="w-5 h-5 text-campus-green shrink-0" strokeWidth={1.5} />
          </div>

          <p className="text-[12px] text-ink-muted leading-relaxed">
            Surrendered property is cataloged and secured according to mandatory university statutory retention timeframes:
          </p>

          {/* 3-Stage Lifecycle Timeline */}
          <div className="space-y-3 pt-1">
            <div className="p-3 rounded-[6px] bg-paper border border-line space-y-1">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-semibold text-ink">Days 1 – 30</span>
                <span className="font-mono text-[11px] font-medium text-campus-green bg-green-tint px-1.5 py-0.2 rounded border border-campus-green/20">
                  Primary Hold
                </span>
              </div>
              <p className="text-[12px] text-ink-muted leading-snug">
                Held in Room 104 intake lockers for immediate student claiming and active loss matching.
              </p>
            </div>

            <div className="p-3 rounded-[6px] bg-paper border border-line space-y-1">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-semibold text-ink">Days 31 – 90</span>
                <span className="font-mono text-[11px] font-medium text-ink-muted bg-surface px-1.5 py-0.2 rounded border border-line">
                  Secondary Vault
                </span>
              </div>
              <p className="text-[12px] text-ink-muted leading-snug">
                Transferred to central campus safety vault storage; retrieval requires attendant supervisor review.
              </p>
            </div>

            <div className="p-3 rounded-[6px] bg-paper border border-line space-y-1">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-semibold text-ink">Day 91+</span>
                <span className="font-mono text-[11px] font-medium text-brick bg-surface px-1.5 py-0.2 rounded border border-line">
                  Statutory Release
                </span>
              </div>
              <p className="text-[12px] text-ink-muted leading-snug">
                Unclaimed non-sensitive property donated to campus welfare programs; sensitive IDs securely destroyed.
              </p>
            </div>
          </div>

          {/* Policy citation */}
          <div className="pt-2 text-[11px] text-ink-muted/80 leading-relaxed border-t border-line">
            University Property Custody Code §4.2 · Office of Campus Safety & Custodial Services.
          </div>
        </div>
      </div>
    </section>
  );
};
