import React from "react";
import { motion } from "motion/react";
import { MapPin, Clock, Phone, IdCard } from "lucide-react";
import { collegeConfig } from "@/config/college";

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
      <div className="border-b border-line pb-3">
        <h2 className="type-h2 text-ink">Central collection desk</h2>
        <p className="type-small text-ink-muted mt-1">
          Physical intake office, property vault, and claimant verification center.
        </p>
      </div>

      <div className="bg-surface border border-line rounded-[12px] p-6 shadow-subtle text-ink">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Desk Location & Live Status */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {/* Status indicator with slow opacity pulse ONLY while open */}
                <motion.span
                  animate={isOpen ? { opacity: [1, 0.35, 1] } : { opacity: 1 }}
                  transition={
                    isOpen
                      ? {
                          duration: 2.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }
                      : undefined
                  }
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    isOpen ? "bg-campus-green" : "bg-slate"
                  }`}
                />
                <span className="text-[14px] font-semibold text-ink">{statusText}</span>
              </div>
              <h3 className="text-[18px] font-semibold text-ink leading-snug">
                {collegeConfig.contact.deskLocation}
              </h3>
              <p className="text-[14px] text-ink-muted mt-0.5">
                {collegeConfig.contact.room}
              </p>
            </div>

            <div className="pt-2 border-t border-line space-y-2 text-[14px] text-ink-muted">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-campus-green shrink-0" strokeWidth={1.5} />
                <span>Central Campus Quadrangle</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-campus-green shrink-0" strokeWidth={1.5} />
                <span className="text-ink font-medium">{collegeConfig.contact.phone}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Hours Schedule */}
          <div className="space-y-3 lg:border-l lg:border-line lg:pl-8">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-campus-green shrink-0" strokeWidth={1.5} />
              <h4 className="text-[14px] font-semibold text-ink">Weekly operating schedule</h4>
            </div>

            <div className="bg-paper border border-line rounded-[6px] divide-y divide-line text-[13px]">
              {collegeConfig.deskHours.schedule.map((item) => (
                <div key={item.day} className="px-3 py-1.5 flex items-center justify-between">
                  <span className={item.isOpen ? "font-medium text-ink" : "text-ink-muted"}>
                    {item.day}
                  </span>
                  <span className={item.isOpen ? "text-ink" : "text-brick font-medium"}>
                    {item.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: What to Bring & Verification */}
          <div className="space-y-3 lg:border-l lg:border-line lg:pl-8">
            <div className="flex items-center gap-2">
              <IdCard className="w-4 h-4 text-campus-green shrink-0" strokeWidth={1.5} />
              <h4 className="text-[14px] font-semibold text-ink">What to bring</h4>
            </div>

            <div className="p-4 bg-paper rounded-[8px] border border-line space-y-2 text-[13px]">
              <p className="font-medium text-ink">
                University photo identification required:
              </p>
              <ul className="space-y-1 text-ink-muted list-disc pl-4">
                <li>Active student ID card or faculty identification</li>
                <li>Or government-issued photo ID (driver licence or passport)</li>
                <li>Device unlock passcode or distinctive property proof</li>
              </ul>
            </div>

            <p className="text-[12px] text-ink-muted leading-relaxed">
              Third-party collections require prior written authorization via official student email.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
