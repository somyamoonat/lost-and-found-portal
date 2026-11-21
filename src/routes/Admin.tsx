import React, { useState } from "react";
import { ShieldCheck, Package, CheckCircle2, Clock } from "lucide-react";
import { collegeConfig } from "@/config/college";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/motion/StatusChip";
import { ClaimTicketTag } from "@/components/ui/ClaimTicketTag";
import { AnimatedNumber } from "@/motion/AnimatedNumber";
import { useToast } from "@/motion/Toast";

interface IntakeEntry {
  id: string;
  code: string;
  title: string;
  building: string;
  loggedDate: string;
  status: "open" | "verified" | "returned";
}

const initialQueue: IntakeEntry[] = [
  {
    id: "2041",
    code: "LF-2041",
    title: "Apple 14-inch MacBook Pro",
    building: "Main Library & Research Commons",
    loggedDate: "21 Nov 2026, 09:15",
    status: "open",
  },
  {
    id: "2042",
    code: "LF-2042",
    title: "Sony WH-1000XM4 wireless headphones",
    building: "Science Quad Lab 201",
    loggedDate: "20 Nov 2026, 14:30",
    status: "open",
  },
  {
    id: "2043",
    code: "LF-2043",
    title: "Brown leather bifold wallet",
    building: "Student Union Dining Hall",
    loggedDate: "19 Nov 2026, 17:05",
    status: "verified",
  },
];

export const Admin: React.FC = () => {
  const { showToast } = useToast();
  const [queue, setQueue] = useState<IntakeEntry[]>(initialQueue);

  const handleRelease = (code: string) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.code === code ? { ...item, status: "returned" as const } : item
      )
    );
    showToast({
      title: "Custody transfer finalized",
      description: `Physical release sign-off recorded for item ${code}.`,
      action: {
        label: "Undo",
        onClick: () => {
          setQueue((prev) =>
            prev.map((item) =>
              item.code === code ? { ...item, status: "open" as const } : item
            )
          );
        },
      },
    });
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-line pb-6 space-y-2">
        <div className="flex items-center gap-2 text-[13px] text-ink-muted">
          <span>{collegeConfig.institution.shortName} Campus Safety</span>
          <span>/</span>
          <span className="text-campus-green font-medium">Vault custody administration</span>
        </div>
        <h1 className="type-h1 text-ink">Administrative custody console</h1>
        <p className="type-body text-ink-muted">
          Operational queue for property intake logging, claimant identity verification, and physical custody handover.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-line rounded-[12px] p-5 shadow-subtle space-y-1">
          <div className="flex items-center gap-2 text-ink-muted text-[13px]">
            <Package className="w-4 h-4 text-campus-green" strokeWidth={1.5} />
            <span>Active items in vault</span>
          </div>
          <span className="text-[28px] font-bold text-ink block">
            <AnimatedNumber value={queue.filter((i) => i.status !== "returned").length} />
          </span>
        </div>

        <div className="bg-surface border border-line rounded-[12px] p-5 shadow-subtle space-y-1">
          <div className="flex items-center gap-2 text-ink-muted text-[13px]">
            <ShieldCheck className="w-4 h-4 text-campus-green" strokeWidth={1.5} />
            <span>Verification pending</span>
          </div>
          <span className="text-[28px] font-bold text-ink block">
            <AnimatedNumber value={queue.filter((i) => i.status === "verified").length} />
          </span>
        </div>

        <div className="bg-surface border border-line rounded-[12px] p-5 shadow-subtle space-y-1">
          <div className="flex items-center gap-2 text-ink-muted text-[13px]">
            <Clock className="w-4 h-4 text-campus-green" strokeWidth={1.5} />
            <span>Desk hours today</span>
          </div>
          <span className="text-[18px] font-medium text-campus-green block pt-1">
            08:30 – 18:00
          </span>
        </div>
      </div>

      {/* Custody Queue Table */}
      <div className="bg-surface border border-line rounded-[12px] overflow-hidden shadow-subtle">
        <div className="p-5 border-b border-line flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-ink">Current desk custody queue</h2>
          <span className="text-[13px] text-ink-muted">
            Location: Central Library Commons 104
          </span>
        </div>

        <div className="divide-y divide-line">
          {queue.map((item) => (
            <div
              key={item.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-paper/30 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <StatusChip status={item.status} />
                  <ClaimTicketTag code={item.code} />
                </div>
                <h3 className="text-[16px] font-semibold text-ink">{item.title}</h3>
                <p className="text-[12px] text-ink-muted">
                  Intake from {item.building} · Logged {item.loggedDate}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {item.status !== "returned" ? (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleRelease(item.code)}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />}
                  >
                    Confirm release
                  </Button>
                ) : (
                  <span className="text-[13px] text-slate font-medium">
                    Released to verified claimant
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
