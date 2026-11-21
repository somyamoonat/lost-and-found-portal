import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  MapPin,
  ChevronDown,
  Clock,
  Trash2,
  ExternalLink,
  Check,
  Package,
} from "lucide-react";
import { collegeConfig } from "@/config/college";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/motion/StatusChip";
import { Dialog } from "@/motion/Dialog";
import { useToast } from "@/motion/Toast";
import { springs, easings, durations } from "@/motion/tokens";
import { getCategoryIcon } from "@/components/ui/ItemCard";
import { useAuth } from "@/auth";
import { api } from "@/data/api";
import { cn } from "@/lib/utils";

export interface TimelineStage {
  id: string;
  name: string;
  date: string;
  note: string;
}

export interface UserReportItem {
  id: string;
  refCode: string;
  title: string;
  category: string;
  location: string;
  buildingCode: string;
  updatedAt: string;
  status: "open" | "verified" | "returned";
  currentStageIndex: number; // 0 to 4
  photo: string | null;
  stages: TimelineStage[];
}

const STAGE_NAMES = [
  "Reported",
  "Matched",
  "Verified",
  "Ready to collect",
  "Returned",
];

// Initial mock datasets
const initialLostItems: UserReportItem[] = [
  {
    id: "2041",
    refCode: "LF-2041",
    title: "Casio fx-991EX scientific calculator",
    category: "electronics",
    location: "Main Library & Research Commons",
    buildingCode: "MLC",
    updatedAt: "2 hours ago",
    status: "verified",
    currentStageIndex: 2, // Verified
    photo: null,
    stages: [
      { id: "s-0", name: "Reported", date: "21 Nov 2026, 09:15", note: "Filed by student via campus portal" },
      { id: "s-1", name: "Matched", date: "21 Nov 2026, 11:30", note: "Surrendered item matched by Central Desk staff" },
      { id: "s-2", name: "Verified", date: "21 Nov 2026, 13:45", note: "Serial markings verified against student ID record" },
      { id: "s-3", name: "Ready to collect", date: "Pending custody transfer", note: "Available at Service Wing Room 104" },
      { id: "s-4", name: "Returned", date: "Pending student sign-off", note: "Physical signature required on intake log" },
    ],
  },
  {
    id: "2038",
    refCode: "LF-2038",
    title: "Hostel room keys on red SJU lanyard",
    category: "keys",
    location: "Student Union & Dining Hall",
    buildingCode: "SUD",
    updatedAt: "Yesterday",
    status: "open",
    currentStageIndex: 0, // Reported
    photo: null,
    stages: [
      { id: "s-0", name: "Reported", date: "20 Nov 2026, 16:30", note: "Intake record registered with Campus Safety" },
      { id: "s-1", name: "Matched", date: "Awaiting surrendered match", note: "Cross-referenced twice daily" },
      { id: "s-2", name: "Verified", date: "Pending", note: "Owner identification verification" },
      { id: "s-3", name: "Ready to collect", date: "Pending", note: "Held at Central Library Intake Vault" },
      { id: "s-4", name: "Returned", date: "Pending", note: "Custody transfer complete" },
    ],
  },
  {
    id: "1983",
    refCode: "LF-1983",
    title: "Navy blue Herschel backpack with broken zip",
    category: "bags-backpacks",
    location: "Founders Engineering Hall",
    buildingCode: "FEH",
    updatedAt: "04 Nov 2026",
    status: "returned",
    currentStageIndex: 4, // Returned
    photo: null,
    stages: [
      { id: "s-0", name: "Reported", date: "04 Nov 2026, 10:10", note: "Misplaced in robotics makerspace" },
      { id: "s-1", name: "Matched", date: "05 Nov 2026, 14:20", note: "Found by lab technician and surrendered" },
      { id: "s-2", name: "Verified", date: "06 Nov 2026, 09:30", note: "Contents verified by claimant" },
      { id: "s-3", name: "Ready to collect", date: "06 Nov 2026, 11:00", note: "Intake pass issued" },
      { id: "s-4", name: "Returned", date: "06 Nov 2026, 16:15", note: "Signed out and returned to student" },
    ],
  },
];

const initialFoundItems: UserReportItem[] = [
  {
    id: "2035",
    refCode: "LF-2035",
    title: "Brown leather bifold wallet with student ID",
    category: "wallets-ids",
    location: "Student Union Dining Hall",
    buildingCode: "SUD",
    updatedAt: "Today, 10:00",
    status: "verified",
    currentStageIndex: 2, // Verified
    photo: null,
    stages: [
      { id: "s-0", name: "Reported", date: "21 Nov 2026, 10:00", note: "Handed in by student finder" },
      { id: "s-1", name: "Matched", date: "21 Nov 2026, 11:15", note: "Owner registered matching missing report" },
      { id: "s-2", name: "Verified", date: "21 Nov 2026, 13:00", note: "Confidential verification photo confirmed" },
      { id: "s-3", name: "Ready to collect", date: "In vault", note: "Held in Central Library Room 104" },
      { id: "s-4", name: "Returned", date: "Pending pickup", note: "Claimant notified via university email" },
    ],
  },
  {
    id: "1850",
    refCode: "LF-1850",
    title: "Black hydro-flask travel mug (24oz)",
    category: "bottles-mugs",
    location: "Athletics & Recreation Complex",
    buildingCode: "ARC",
    updatedAt: "12 Oct 2026",
    status: "returned",
    currentStageIndex: 4, // Returned
    photo: null,
    stages: [
      { id: "s-0", name: "Reported", date: "12 Oct 2026, 08:30", note: "Found near gymnasium bleachers" },
      { id: "s-1", name: "Matched", date: "12 Oct 2026, 12:00", note: "Matched with student lost inquiry" },
      { id: "s-2", name: "Verified", date: "12 Oct 2026, 14:10", note: "Distinctive base dent verified" },
      { id: "s-3", name: "Ready to collect", date: "12 Oct 2026, 14:30", note: "Transferred to desk collection" },
      { id: "s-4", name: "Returned", date: "13 Oct 2026, 10:00", note: "Claimant collected with student card" },
    ],
  },
];

const initialClaimItems: UserReportItem[] = [
  {
    id: "2040",
    refCode: "LF-2040",
    title: "Apple 14-inch MacBook Pro (Space Grey)",
    category: "electronics",
    location: "Science Quad & Laboratories",
    buildingCode: "SQL",
    updatedAt: "30 mins ago",
    status: "verified",
    currentStageIndex: 3, // Ready to collect
    photo: null,
    stages: [
      { id: "s-0", name: "Reported", date: "20 Nov 2026, 18:00", note: "Found in Physics Lecture Hall 201" },
      { id: "s-1", name: "Matched", date: "21 Nov 2026, 09:00", note: "Claim pass submitted by student" },
      { id: "s-2", name: "Verified", date: "21 Nov 2026, 11:30", note: "Lock screen credentials verified" },
      { id: "s-3", name: "Ready to collect", date: "Ready now", note: "Visit Service Wing 104 with photo ID" },
      { id: "s-4", name: "Returned", date: "Pending collection", note: "Release form ready for physical signature" },
    ],
  },
];

type TabKey = "lost" | "found" | "claims";

const TAB_CONFIG: { key: TabKey; label: string; index: number }[] = [
  { key: "lost", label: "Lost by me", index: 0 },
  { key: "found", label: "Found by me", index: 1 },
  { key: "claims", label: "My claims", index: 2 },
];

export const MyReports: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabKey>("lost");
  const [previousTab, setPreviousTab] = useState<TabKey>("lost");

  // Tab datasets with withdraw and undo support
  const [lostItems, setLostItems] = useState<UserReportItem[]>(initialLostItems);
  const [foundItems, setFoundItems] = useState<UserReportItem[]>(initialFoundItems);
  const [claimItems, setClaimItems] = useState<UserReportItem[]>(initialClaimItems);

  // Expanded row tracker
  const [expandedRowId, setExpandedRowId] = useState<string | null>("2041");

  // Confirm withdrawal dialog state
  const [confirmWithdrawTarget, setConfirmWithdrawTarget] = useState<UserReportItem | null>(null);

  const handleTabChange = (newTab: TabKey) => {
    setPreviousTab(activeTab);
    setActiveTab(newTab);
  };

  const getActiveList = (): UserReportItem[] => {
    switch (activeTab) {
      case "lost":
        return lostItems;
      case "found":
        return foundItems;
      case "claims":
        return claimItems;
    }
  };

  const setActiveList = (updater: (prev: UserReportItem[]) => UserReportItem[]) => {
    switch (activeTab) {
      case "lost":
        setLostItems(updater);
        break;
      case "found":
        setFoundItems(updater);
        break;
      case "claims":
        setClaimItems(updater);
        break;
    }
  };

  // Direction for tab transition (-1 or 1)
  const activeIndex = TAB_CONFIG.find((t) => t.key === activeTab)?.index ?? 0;
  const prevIndex = TAB_CONFIG.find((t) => t.key === previousTab)?.index ?? 0;
  const tabDirection = activeIndex >= prevIndex ? 1 : -1;

  // Withdraw Confirmation and Undo logic (Optimistic update with toast rollback)
  const handleConfirmWithdraw = (item: UserReportItem) => {
    const currentList = getActiveList();
    const itemIndex = currentList.findIndex((i) => i.id === item.id);
    if (itemIndex === -1) return;

    // Optimistically remove from active list
    setActiveList((prev) => prev.filter((i) => i.id !== item.id));
    setConfirmWithdrawTarget(null);

    // Call API with rollback on failure
    api.withdrawReport(item.id).catch((err) => {
      console.error("Failed to withdraw report:", err);
      // Rollback to previous state
      setActiveList((prev) => {
        const copy = [...prev];
        copy.splice(itemIndex, 0, item);
        return copy;
      });
      showToast({
        title: "Withdrawal failed",
        description: `Could not withdraw reference ${item.refCode}. Changes have been reverted.`,
        duration: durations.toastStandard,
      });
    });

    // Show toast with Undo for 6 seconds
    showToast({
      title: "Report withdrawn",
      description: `Reference code ${item.refCode} has been deactivated from intake registry.`,
      action: {
        label: "Undo",
        onClick: () => {
          // Reinsert at original position
          setActiveList((prev) => {
            const copy = [...prev];
            copy.splice(itemIndex, 0, item);
            return copy;
          });
        },
      },
      duration: durations.toastUndo,
    });
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[13px] text-ink-muted">
            <span>{collegeConfig.institution.shortName} Lost & Found</span>
            <span>/</span>
            <span className="text-campus-green font-medium">Claimant records</span>
          </div>
          <h1 className="type-h1 text-ink">My submitted reports</h1>
          <p className="type-body text-ink-muted">
            {user
              ? `Tracking active articles filed under ${user.email} (${user.studentId}).`
              : "Track active reports and past custody verifications filed under your student identity."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/report">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" strokeWidth={1.5} />}
            >
              Report an item
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs with layoutId sliding underline */}
      <div className="border-b border-line">
        <div className="flex items-center gap-6 sm:gap-8 -mb-[1px]">
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.key;
            let count = 0;
            if (tab.key === "lost") count = lostItems.length;
            if (tab.key === "found") count = foundItems.length;
            if (tab.key === "claims") count = claimItems.length;

            return (
              <button
                key={tab.key}
                type="button"
                data-testid={`tab-${tab.key}`}
                onClick={() => handleTabChange(tab.key)}
                className={cn(
                  "relative pb-3 text-[14px] sm:text-[15px] font-medium transition-colors flex items-center gap-2 cursor-pointer outline-none select-none",
                  isActive
                    ? "text-campus-green font-semibold"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-[11px] px-1.5 py-0.2 rounded-full font-semibold transition-colors",
                    isActive
                      ? "bg-green-tint text-campus-green"
                      : "bg-paper text-ink-muted"
                  )}
                >
                  {count}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="my-reports-active-tab"
                    transition={springs.snappy}
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-campus-green"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content with 8px direction-aware x-shift and crossfade */}
      <AnimatePresence mode="wait" custom={tabDirection}>
        <motion.div
          key={activeTab}
          custom={tabDirection}
          variants={{
            enter: (d: number) => ({
              x: d * 8,
              opacity: 0,
            }),
            center: {
              x: 0,
              opacity: 1,
              transition: {
                x: { duration: durations.step, ease: easings.out },
                opacity: { duration: durations.uiExit, ease: easings.out },
              },
            },
            exit: (d: number) => ({
              x: d * -8,
              opacity: 0,
              transition: {
                x: { duration: durations.uiExit, ease: easings.out },
                opacity: { duration: durations.micro, ease: easings.out },
              },
            }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          className="space-y-4"
        >
          {getActiveList().length === 0 ? (
            /* Empty State per tab with direct action */
            <div
              data-testid={`empty-state-${activeTab}`}
              className="bg-surface border border-line rounded-[12px] p-8 sm:p-12 text-center space-y-4 shadow-subtle max-w-lg mx-auto"
            >
              <div className="w-12 h-12 rounded-full bg-paper border border-line flex items-center justify-center text-ink-muted mx-auto">
                <Package className="w-6 h-6" strokeWidth={1.5} />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-[17px] font-semibold text-ink">
                  {activeTab === "lost"
                    ? "No lost property reports filed"
                    : activeTab === "found"
                    ? "No found property registered"
                    : "No active property claims"}
                </h3>
                <p className="text-[13px] text-ink-muted leading-relaxed max-w-sm mx-auto">
                  {activeTab === "lost"
                    ? "If you misplaced an item on campus, register a report so intake staff can cross-reference surrendered articles."
                    : activeTab === "found"
                    ? "Discovered unattended property on campus? Log it here or deliver it to Central Library Service Wing 104."
                    : "When you identify your belongings in the campus catalog, submit a claim to begin custody verification."}
                </p>
              </div>

              <div className="pt-2">
                {activeTab === "lost" && (
                  <Link to="/report?type=lost">
                    <Button variant="primary">Report a lost item</Button>
                  </Link>
                )}
                {activeTab === "found" && (
                  <Link to="/report?type=found">
                    <Button variant="primary">Report a found item</Button>
                  </Link>
                )}
                {activeTab === "claims" && (
                  <Link to="/browse">
                    <Button variant="primary">Browse campus catalog</Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            /* Rows list */
            <div className="bg-surface border border-line rounded-[12px] divide-y divide-line overflow-hidden shadow-subtle">
              <AnimatePresence initial={false}>
                {getActiveList().map((item) => {
                  const isExpanded = expandedRowId === item.id;
                  const currentStage = item.currentStageIndex;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0, scale: 0.96 }}
                      transition={springs.soft}
                      data-testid={`report-row-${item.id}`}
                      className="overflow-hidden bg-surface"
                    >
                      {/* Main Row Summary */}
                      <div
                        onClick={() => setExpandedRowId((prev) => (prev === item.id ? null : item.id))}
                        className={cn(
                          "p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer transition-colors select-none",
                          isExpanded ? "bg-paper/40" : "hover:bg-paper/30"
                        )}
                      >
                        {/* Left: Thumbnail & Title */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* 44px Thumbnail or category color block */}
                          <div className="w-11 h-11 rounded-[6px] bg-paper border border-line flex items-center justify-center shrink-0 text-campus-green overflow-hidden">
                            {getCategoryIcon(item.category)}
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusChip status={item.status} />
                              <span
                                data-testid={`ref-code-${item.id}`}
                                className="font-mono text-[12px] font-bold text-ink bg-paper px-2 py-0.5 rounded-[4px] border border-line"
                              >
                                {item.refCode}
                              </span>
                              <span className="text-[12px] text-ink-muted hidden sm:inline">
                                · Updated {item.updatedAt}
                              </span>
                            </div>
                            <h3 className="text-[15px] sm:text-[16px] font-semibold text-ink truncate leading-tight">
                              {item.title}
                            </h3>
                            <div className="text-[12px] text-ink-muted flex items-center gap-1.5 sm:hidden">
                              <MapPin className="w-3 h-3 text-campus-green shrink-0" />
                              <span className="truncate">{item.location}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Meta & Chevron */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="hidden sm:flex flex-col items-end text-right">
                            <span className="text-[13px] text-ink font-medium">{item.location}</span>
                            <span className="text-[11px] text-ink-muted">Code: {item.buildingCode}</span>
                          </div>

                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={springs.snappy}
                            className="p-1 rounded-[4px] text-ink-muted hover:text-ink"
                          >
                            <ChevronDown className="w-5 h-5" strokeWidth={1.5} />
                          </motion.div>
                        </div>
                      </div>

                      {/* Expanded Section with Status Timeline */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={springs.soft}
                            className="border-t border-line/80 bg-paper/20 px-4 sm:px-6 py-5 sm:py-6 space-y-6"
                          >
                            {/* Status Timeline */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[12px] font-semibold text-ink uppercase tracking-wider">
                                  Custody timeline
                                </span>
                                <span className="text-[12px] text-ink-muted">
                                  Current stage: <strong className="text-campus-green font-medium">{STAGE_NAMES[currentStage]}</strong>
                                </span>
                              </div>

                              {/* Stepper timeline track */}
                              <div className="relative pt-2 pb-1">
                                {/* Base track line */}
                                <div className="absolute top-5 left-4 right-4 h-0.5 bg-line pointer-events-none" />

                                {/* Active green progress line drawn up to current stage */}
                                <motion.div
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: currentStage / 4 }}
                                  style={{ transformOrigin: "left" }}
                                  transition={{ duration: durations.page, ease: easings.out }}
                                  className="absolute top-5 left-4 right-4 h-0.5 bg-campus-green pointer-events-none"
                                />

                                {/* 5 Stage Dots */}
                                <div className="relative flex justify-between">
                                  {STAGE_NAMES.map((stageName, stageIdx) => {
                                    const isCompleted = stageIdx < currentStage;
                                    const isCurrent = stageIdx === currentStage;

                                    return (
                                      <div
                                        key={stageName}
                                        className="flex flex-col items-center text-center max-w-[80px] sm:max-w-[100px]"
                                      >
                                        {/* Dot Indicator */}
                                        <div className="w-7 h-7 rounded-full bg-surface flex items-center justify-center relative z-10">
                                          {isCurrent ? (
                                            /* Current stage: slow 2s scale pulse (only looping animation allowed in app) */
                                            <span className="relative flex h-4 w-4">
                                              <motion.span
                                                animate={{ scale: [1, 1.45, 1], opacity: [1, 0.65, 1] }}
                                                transition={{ duration: durations.pulse, repeat: Infinity, ease: "easeInOut" }}
                                                className="absolute inline-flex h-full w-full rounded-full bg-campus-green"
                                              />
                                              <span className="relative inline-flex rounded-full h-4 w-4 bg-campus-green items-center justify-center text-surface text-[9px] font-bold">
                                                {stageIdx + 1}
                                              </span>
                                            </span>
                                          ) : isCompleted ? (
                                            /* Completed stage */
                                            <div className="w-4 h-4 rounded-full bg-campus-green text-surface flex items-center justify-center">
                                              <Check className="w-2.5 h-2.5" strokeWidth={3} />
                                            </div>
                                          ) : (
                                            /* Upcoming stage */
                                            <div className="w-4 h-4 rounded-full border-2 border-line bg-surface" />
                                          )}
                                        </div>

                                        {/* Stage Label */}
                                        <span
                                          className={cn(
                                            "text-[11px] sm:text-[12px] mt-1.5 leading-tight select-none",
                                            isCurrent
                                              ? "font-semibold text-ink"
                                              : isCompleted
                                              ? "font-medium text-ink"
                                              : "text-ink-muted/70"
                                          )}
                                        >
                                          {stageName}
                                        </span>

                                        {/* Timestamp if available */}
                                        <span className="text-[10px] text-ink-muted mt-0.5 hidden sm:block truncate max-w-full">
                                          {item.stages[stageIdx]?.date.split(",")[0] || ""}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Stage Details / Logs */}
                            <div className="bg-surface border border-line rounded-[8px] p-4 text-[13px] text-ink space-y-2">
                              <div className="font-semibold text-ink flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-campus-green" />
                                <span>Recent log update</span>
                              </div>
                              <p className="text-ink-muted leading-relaxed">
                                {item.stages[currentStage]?.note || "Awaiting central desk updates."}
                              </p>
                              <div className="text-[11px] text-ink-muted pt-1 border-t border-line/60 flex items-center justify-between">
                                <span>Timestamp: {item.stages[currentStage]?.date}</span>
                                <span>Desk location: Central Library Room 104</span>
                              </div>
                            </div>

                            {/* Row Action Buttons: Withdraw report + View full detail */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                data-testid={`withdraw-btn-${item.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmWithdrawTarget(item);
                                }}
                                className="text-brick hover:border-brick/50 hover:bg-brick/5"
                                leftIcon={<Trash2 className="w-3.5 h-3.5 text-brick" strokeWidth={1.5} />}
                              >
                                Withdraw report
                              </Button>

                              <Link
                                to={`/items/${item.id}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  rightIcon={<ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />}
                                >
                                  View catalog record
                                </Button>
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Confirm Withdraw Dialog */}
      <Dialog
        open={!!confirmWithdrawTarget}
        onOpenChange={(open) => !open && setConfirmWithdrawTarget(null)}
        title="Withdraw property report?"
        description={
          confirmWithdrawTarget
            ? `Are you sure you want to withdraw reference ${confirmWithdrawTarget.refCode} (${confirmWithdrawTarget.title})? This will deactivate the article from active campus intake cross-referencing.`
            : ""
        }
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-paper rounded-[6px] border border-line text-[13px] text-ink-muted leading-relaxed">
            You can restore this report immediately using the Undo button that appears right after withdrawal.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
            <Button
              variant="secondary"
              onClick={() => setConfirmWithdrawTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              data-testid="confirm-withdraw-btn"
              onClick={() => confirmWithdrawTarget && handleConfirmWithdraw(confirmWithdrawTarget)}
              className="bg-brick hover:bg-brick/90 text-surface border-brick"
            >
              Confirm withdrawal
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
