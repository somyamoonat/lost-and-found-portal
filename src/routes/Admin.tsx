import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Inbox,
  Package,
  ArrowRightLeft,
  Search,
  Check,
  ChevronDown,
  Shield,
  CheckCircle2,
  MessageSquare,
  FileText,
  User,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { collegeConfig } from "@/config/college";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/motion/StatusChip";
import { Dialog } from "@/motion/Dialog";
import { AnimatedNumber } from "@/motion/AnimatedNumber";
import { useToast } from "@/motion/Toast";
import { springs, durations } from "@/motion/tokens";
import { placeholderItems } from "@/data/items";
import { api } from "@/data/api";
import { getCategoryIcon } from "@/components/ui/ItemCard";
import { cn } from "@/lib/utils";

// Claim record structure with rich double-sided verification data
export interface AdminClaim {
  id: string;
  refCode: string;
  itemTitle: string;
  category: string;
  building: string;
  claimantName: string;
  claimantEmail: string;
  claimantId: string;
  submittedAt: string;
  status: "awaiting_review" | "ready_to_collect" | "needs_info" | "rejected" | "returned";
  finderRecorded: {
    privateDetails: string;
    surrenderedBy: string;
    heldAt: string;
    occurredDate: string;
  };
  claimantSaid: {
    privateDetails: string;
    lossCircumstances: string;
  };
  claimantProof: {
    type: string;
    title: string;
    serialMatch: string;
  };
}

const initialClaims: AdminClaim[] = [
  {
    id: "2041",
    refCode: "LF-2041",
    itemTitle: "Apple 14-inch MacBook Pro (Space Grey)",
    category: "electronics",
    building: "Main Library & Research Commons",
    claimantName: "Julian Vance",
    claimantEmail: "j.vance@stjude.edu",
    claimantId: "SJU-31213",
    submittedAt: "Today, 09:40",
    status: "awaiting_review",
    finderRecorded: {
      privateDetails: "Small circular sticker of a mountain range on the bottom casing near the left hinge. Minor scratch on the Apple logo.",
      surrenderedBy: "Library evening supervisor (Room 104 intake)",
      heldAt: "Vault Cabinet B, Shelf 3",
      occurredDate: "21 Nov 2026, 09:15",
    },
    claimantSaid: {
      privateDetails: "Space Grey 14-inch M2 Pro. Has a PNW mountain sticker on the bottom casing and faint scratch on Apple logo from backpack key clip.",
      lossCircumstances: "Left on 2nd floor library study desk when rushing to a 10:00 AM seminar.",
    },
    claimantProof: {
      type: "Purchase invoice",
      title: "University bookstore invoice with serial number matching hardware",
      serialMatch: "Serial #C02G...4MD6 (verified match)",
    },
  },
  {
    id: "2038",
    refCode: "LF-2038",
    itemTitle: "Hostel room keys on red SJU lanyard",
    category: "keys",
    building: "Student Union Dining Hall",
    claimantName: "Maya Lin",
    claimantEmail: "m.lin@stjude.edu",
    claimantId: "SJU-88492",
    submittedAt: "Today, 11:15",
    status: "awaiting_review",
    finderRecorded: {
      privateDetails: "Two Yale brass keys, dorm room 314 tag with red marker dot on reverse side, and a silver bottle opener attachment.",
      surrenderedBy: "Cafeteria cleaning attendant",
      heldAt: "Key Drawer 2, Slot 18",
      occurredDate: "20 Nov 2026, 16:30",
    },
    claimantSaid: {
      privateDetails: "Dorm room 314 key and mailbox key on red university lanyard with a silver flat bottle opener attachment.",
      lossCircumstances: "Dropped from coat pocket at the dining hall lower booths during dinner.",
    },
    claimantProof: {
      type: "Campus residence card",
      title: "Residential housing card matching Room 314 assignment",
      serialMatch: "Key tag Dorm #314",
    },
  },
  {
    id: "2035",
    refCode: "LF-2035",
    itemTitle: "Sony WH-1000XM4 wireless headphones",
    category: "electronics",
    building: "Science Quad & Laboratories",
    claimantName: "David Chen",
    claimantEmail: "d.chen@stjude.edu",
    claimantId: "SJU-40912",
    submittedAt: "Yesterday, 16:50",
    status: "awaiting_review",
    finderRecorded: {
      privateDetails: "Black carrying case with custom white zipper cord; inside mesh pocket contains airline adapter and braided black aux cable.",
      surrenderedBy: "Physics teaching assistant (Optics Lab)",
      heldAt: "Vault Cabinet A, Shelf 1",
      occurredDate: "20 Nov 2026, 14:30",
    },
    claimantSaid: {
      privateDetails: "Black XM4s in hard case with white paracord zipper pull. Aux cable and two-prong airplane jack in top net.",
      lossCircumstances: "Forgot at computer station 4 in optics laboratory 201.",
    },
    claimantProof: {
      type: "Bluetooth pairing log",
      title: "Phone screenshot showing paired Bluetooth hardware MAC address",
      serialMatch: "Sony WH-1000XM4 (Paired record)",
    },
  },
  {
    id: "2030",
    refCode: "LF-2030",
    itemTitle: "TI-84 Plus CE graphing calculator",
    category: "electronics",
    building: "Founders Engineering Hall",
    claimantName: "Sarah Jenkins",
    claimantEmail: "s.jenkins@stjude.edu",
    claimantId: "SJU-71822",
    submittedAt: "Yesterday, 14:10",
    status: "ready_to_collect",
    finderRecorded: {
      privateDetails: "Name 'S. Jenkins' engraved on inside of slide cover; small scratch on solar cell bezel.",
      surrenderedBy: "FEH Atrium Helpdesk attendant",
      heldAt: "Central Desk Pickup Shelf 4",
      occurredDate: "19 Nov 2026, 15:00",
    },
    claimantSaid: {
      privateDetails: "My name 'S. Jenkins' is engraved inside the slide case with electric pencil.",
      lossCircumstances: "Left after Calculus exam in FEH 101 lecture hall.",
    },
    claimantProof: {
      type: "Student photo ID",
      title: "University ID card matching engraved surname",
      serialMatch: "Verified by Desk Attendant",
    },
  },
];

type AdminNavSection = "claims" | "inventory" | "handover";

export const Admin: React.FC = () => {
  const { showToast } = useToast();

  // Navigation tab
  const [activeSection, setActiveSection] = useState<AdminNavSection>("claims");

  // Mock staff role
  const [staffRole, setStaffRole] = useState<"attendant" | "supervisor">("attendant");

  // Claims datasets
  const [claims, setClaims] = useState<AdminClaim[]>(initialClaims);
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>("2041");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "awaiting_review" | "ready_to_collect">("all");

  // Keyboard navigation row index
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(0);
  const tableRef = useRef<HTMLTableElement | null>(null);

  // Counters
  const [returnedMonthCount, setReturnedMonthCount] = useState(48);

  // Dialog targets
  const [approveTarget, setApproveTarget] = useState<AdminClaim | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminClaim | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [needsInfoTarget, setNeedsInfoTarget] = useState<AdminClaim | null>(null);
  const [needsInfoPrompt, setNeedsInfoPrompt] = useState("");

  // Handover state
  const [handoverCode, setHandoverCode] = useState("");
  const [handoverItem, setHandoverItem] = useState<AdminClaim | null>(null);
  const [isHandoverReturning, setIsHandoverReturning] = useState(false);

  // Filtered claims for review
  const filteredClaims = claims.filter((c) => {
    if (activeSection === "claims") {
      // Show unreturned claims
      if (c.status === "returned") return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        c.refCode.toLowerCase().includes(q) ||
        c.itemTitle.toLowerCase().includes(q) ||
        c.claimantName.toLowerCase().includes(q) ||
        c.claimantEmail.toLowerCase().includes(q) ||
        c.building.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const awaitingReviewCount = claims.filter((c) => c.status === "awaiting_review").length;
  const readyToCollectCount = claims.filter((c) => c.status === "ready_to_collect").length;

  // Keyboard navigation within the table
  const handleTableKeyDown = (e: React.KeyboardEvent) => {
    if (activeSection !== "claims" || filteredClaims.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedRowIndex((prev) => Math.min(prev + 1, filteredClaims.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedRowIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      if ((e.target as HTMLElement).tagName !== "BUTTON" && (e.target as HTMLElement).tagName !== "INPUT") {
        e.preventDefault();
        const currentClaim = filteredClaims[focusedRowIndex];
        if (currentClaim) {
          setExpandedClaimId((prev) => (prev === currentClaim.id ? null : currentClaim.id));
        }
      }
    }
  };

  // Bulk selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredClaims.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredClaims.map((c) => c.id)));
    }
  };

  const handleToggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Actions (with optimistic update and toast rollback)
  const handleConfirmApprove = (target: AdminClaim) => {
    const previousClaims = [...claims];

    // Optimistically update status to ready_to_collect
    setClaims((prev) =>
      prev.map((c) => (c.id === target.id ? { ...c, status: "ready_to_collect" as const } : c))
    );

    // Call API with rollback on failure
    api.approveClaim(target.id).catch((err) => {
      console.error("Failed to approve claim:", err);
      // Rollback to previous state
      setClaims(previousClaims);
      showToast({
        title: "Approval failed",
        description: `Could not approve claim ${target.refCode}. Changes have been reverted.`,
        duration: durations.toastStandard,
      });
    });

    // Row collapses out of the review queue after 0.25s
    setTimeout(() => {
      setClaims((prev) => prev.filter((c) => c.id !== target.id));
    }, 250);

    setApproveTarget(null);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(target.id);
      return next;
    });

    showToast({
      title: "Claim approved",
      description: `${target.refCode} is verified and marked ready to collect.`,
    });
  };

  const handleConfirmReject = () => {
    if (!rejectTarget || !rejectReason.trim()) return;

    const code = rejectTarget.refCode;
    setClaims((prev) =>
      prev.map((c) => (c.id === rejectTarget.id ? { ...c, status: "rejected" as const } : c))
    );

    setTimeout(() => {
      setClaims((prev) => prev.filter((c) => c.id !== rejectTarget.id));
    }, 250);

    showToast({
      title: "Claim rejected",
      description: `Reference ${code} rejected. Reason logged in audit registry.`,
    });

    setRejectTarget(null);
    setRejectReason("");
  };

  const handleConfirmNeedsInfo = () => {
    if (!needsInfoTarget) return;

    setClaims((prev) =>
      prev.map((c) => (c.id === needsInfoTarget.id ? { ...c, status: "needs_info" as const } : c))
    );

    showToast({
      title: "Clarification sent to claimant",
      description: `Inquiry delivered to ${needsInfoTarget.claimantEmail}.`,
    });

    setNeedsInfoTarget(null);
    setNeedsInfoPrompt("");
  };

  const handleBulkApprove = () => {
    const count = selectedIds.size;
    const previousClaims = [...claims];
    const approvedTargetIds = Array.from(selectedIds);

    // Optimistically remove from review queue
    setClaims((prev) => prev.filter((c) => !selectedIds.has(c.id)));
    setSelectedIds(new Set());

    // Call API with rollback on failure
    Promise.all(approvedTargetIds.map((id) => api.approveClaim(id))).catch((err) => {
      console.error("Bulk approval error:", err);
      setClaims(previousClaims);
      showToast({
        title: "Bulk approval failed",
        description: "Could not approve selected claims. Changes have been reverted.",
        duration: durations.toastStandard,
      });
    });

    showToast({
      title: `${count} claims approved`,
      description: "Batch custody passes dispatched to verified students.",
    });
  };

  // Handover lookup
  const handleHandoverCodeChange = (code: string) => {
    setHandoverCode(code);
    const clean = code.trim().toLowerCase().replace(/^lf-/i, "");
    if (!clean) {
      setHandoverItem(null);
      return;
    }

    const match = claims.find(
      (c) => c.id === clean || c.refCode.toLowerCase() === code.trim().toLowerCase()
    );
    if (match) {
      setHandoverItem(match);
    } else {
      setHandoverItem(null);
    }
  };

  const handleConfirmHandoverReturn = () => {
    if (!handoverItem) return;
    setIsHandoverReturning(true);

    setTimeout(() => {
      // Morph status to returned
      setClaims((prev) =>
        prev.map((c) => (c.id === handoverItem.id ? { ...c, status: "returned" as const } : c))
      );
      setReturnedMonthCount((prev) => prev + 1);

      showToast({
        title: "Custody transfer complete",
        description: `${handoverItem.refCode} marked as returned to claimant.`,
      });

      // Collapse preview
      setTimeout(() => {
        setIsHandoverReturning(false);
        setHandoverItem(null);
        setHandoverCode("");
      }, 400);
    }, 300);
  };

  return (
    <div
      className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-[14px]"
      onKeyDown={handleTableKeyDown}
      tabIndex={0}
      style={{ outline: "none" }}
    >
      {/* Top Staff Utility Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-2 text-[13px] text-ink-muted">
          <span>{collegeConfig.institution.shortName} Campus Safety</span>
          <span>/</span>
          <span className="text-campus-green font-medium">Intake vault & collection desk</span>
        </div>

        {/* Mock Role & Desk Schedule Status */}
        <div className="flex items-center gap-3 text-[12px]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-paper border border-line text-ink">
            <span className="w-2 h-2 rounded-full bg-campus-green animate-pulse" />
            <span>Desk open · Central Library 104</span>
          </div>

          <div className="flex items-center rounded-[6px] border border-line overflow-hidden bg-surface">
            <button
              type="button"
              onClick={() => setStaffRole("attendant")}
              className={cn(
                "px-2.5 py-1 font-medium transition-colors cursor-pointer",
                staffRole === "attendant"
                  ? "bg-campus-green text-surface"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              Attendant
            </button>
            <button
              type="button"
              onClick={() => setStaffRole("supervisor")}
              className={cn(
                "px-2.5 py-1 font-medium transition-colors cursor-pointer",
                staffRole === "supervisor"
                  ? "bg-campus-green text-surface"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              Supervisor
            </button>
          </div>
        </div>
      </div>

      {/* Plain Metrics Row: Exactly three figures, NOT cards */}
      <div className="grid grid-cols-3 divide-x divide-line border-y border-line py-3.5 select-none bg-surface/40">
        <div className="px-4 sm:px-6">
          <div className="text-[12px] text-ink-muted">Awaiting review</div>
          <div
            data-testid="stat-awaiting-review"
            className="text-[26px] font-semibold text-ink tracking-tight mt-0.5"
          >
            <AnimatedNumber value={awaitingReviewCount} />
          </div>
        </div>

        <div className="px-4 sm:px-6">
          <div className="text-[12px] text-ink-muted">Ready to collect</div>
          <div
            data-testid="stat-ready-collect"
            className="text-[26px] font-semibold text-campus-green tracking-tight mt-0.5"
          >
            <AnimatedNumber value={readyToCollectCount} />
          </div>
        </div>

        <div className="px-4 sm:px-6">
          <div className="text-[12px] text-ink-muted">Returned this month</div>
          <div
            data-testid="stat-returned-month"
            className="text-[26px] font-semibold text-slate tracking-tight mt-0.5"
          >
            <AnimatedNumber value={returnedMonthCount} />
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Narrow Left Nav & Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Nav (Narrow 3 cols) */}
        <aside className="md:col-span-3 space-y-4">
          <div className="bg-surface border border-line rounded-[8px] p-2 space-y-1 shadow-subtle">
            <button
              type="button"
              data-testid="admin-nav-claims"
              onClick={() => setActiveSection("claims")}
              className={cn(
                "w-full px-3 py-2.5 rounded-[6px] text-left font-medium transition-colors flex items-center justify-between cursor-pointer outline-none",
                activeSection === "claims"
                  ? "bg-green-tint text-campus-green font-semibold"
                  : "text-ink hover:bg-paper"
              )}
            >
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>Claims to review</span>
              </div>
              {awaitingReviewCount > 0 && (
                <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-campus-green text-surface">
                  {awaitingReviewCount}
                </span>
              )}
            </button>

            <button
              type="button"
              data-testid="admin-nav-inventory"
              onClick={() => setActiveSection("inventory")}
              className={cn(
                "w-full px-3 py-2.5 rounded-[6px] text-left font-medium transition-colors flex items-center justify-between cursor-pointer outline-none",
                activeSection === "inventory"
                  ? "bg-green-tint text-campus-green font-semibold"
                  : "text-ink hover:bg-paper"
              )}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>All items</span>
              </div>
              <span className="text-[11px] font-medium text-ink-muted">
                {placeholderItems.length}
              </span>
            </button>

            <button
              type="button"
              data-testid="admin-nav-handover"
              onClick={() => setActiveSection("handover")}
              className={cn(
                "w-full px-3 py-2.5 rounded-[6px] text-left font-medium transition-colors flex items-center justify-between cursor-pointer outline-none",
                activeSection === "handover"
                  ? "bg-green-tint text-campus-green font-semibold"
                  : "text-ink hover:bg-paper"
              )}
            >
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>Handover</span>
              </div>
              {readyToCollectCount > 0 && (
                <span className="text-[11px] font-medium px-1.5 py-0.2 rounded-full bg-paper border border-line text-ink">
                  {readyToCollectCount}
                </span>
              )}
            </button>
          </div>

          {/* Institutional Intake Information Box */}
          <div className="p-3.5 bg-paper rounded-[8px] border border-line text-[12px] text-ink-muted space-y-2">
            <div className="font-semibold text-ink flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-campus-green" />
              <span>Desk intake protocols</span>
            </div>
            <p className="leading-relaxed">
              Verify matching physical credentials against claimant identity records before sign-off. High-value property requires dual staff verification.
            </p>
          </div>
        </aside>

        {/* Main Content Area (9 cols) */}
        <main className="md:col-span-9 space-y-4">
          {/* SECTION 1: CLAIMS QUEUE */}
          {activeSection === "claims" && (
            <div className="space-y-3">
              {/* Toolbar & Filters */}
              <div className="bg-surface border border-line rounded-[8px] p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-subtle">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    data-testid="admin-claims-search"
                    placeholder="Search by ref, title, claimant..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-[13px] bg-paper text-ink rounded-[4px] border border-line outline-none focus:border-campus-green"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-ink-muted hidden sm:inline">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-2.5 py-1.5 text-[12px] bg-paper text-ink rounded-[4px] border border-line outline-none cursor-pointer"
                  >
                    <option value="all">All statuses</option>
                    <option value="awaiting_review">Awaiting review</option>
                    <option value="ready_to_collect">Ready to collect</option>
                  </select>
                </div>
              </div>

              {/* Claims Table with Sticky Header */}
              <div className="bg-surface border border-line rounded-[8px] overflow-hidden shadow-subtle">
                <div className="overflow-x-auto max-h-[640px]">
                  <table
                    ref={tableRef}
                    className="w-full text-left border-collapse"
                  >
                    {/* Sticky Table Header */}
                    <thead className="sticky top-0 bg-paper border-b border-line z-10 text-[12px] text-ink-muted uppercase tracking-wider font-semibold select-none">
                      <tr>
                        <th className="w-9 px-3 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={
                              filteredClaims.length > 0 &&
                              selectedIds.size === filteredClaims.length
                            }
                            onChange={handleToggleSelectAll}
                            className="rounded-[3px] accent-campus-green cursor-pointer"
                            aria-label="Select all claims"
                          />
                        </th>
                        <th className="px-3 py-2.5">Ref code</th>
                        <th className="px-3 py-2.5">Item & category</th>
                        <th className="px-3 py-2.5">Claimant</th>
                        <th className="px-3 py-2.5 hidden sm:table-cell">Submitted</th>
                        <th className="px-3 py-2.5">Status</th>
                        <th className="w-10 px-3 py-2.5"></th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-line text-[13px]">
                      {filteredClaims.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-ink-muted">
                            No claims matching active filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredClaims.map((claim, idx) => {
                          const isExpanded = expandedClaimId === claim.id;
                          const isSelected = selectedIds.has(claim.id);
                          const isFocused = focusedRowIndex === idx;

                          return (
                            <React.Fragment key={claim.id}>
                              {/* Summary Row */}
                              <tr
                                data-testid={`claim-row-${claim.id}`}
                                onClick={() =>
                                  setExpandedClaimId((prev) => (prev === claim.id ? null : claim.id))
                                }
                                className={cn(
                                  "cursor-pointer transition-colors select-none",
                                  isExpanded
                                    ? "bg-green-tint/20 font-medium"
                                    : isFocused
                                    ? "bg-paper/70"
                                    : "hover:bg-paper/40",
                                  isSelected && "bg-green-tint/30"
                                )}
                              >
                                {/* Checkbox */}
                                <td
                                  className="w-9 px-3 py-2.5 text-center"
                                  onClick={(e) => handleToggleSelectRow(claim.id, e)}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="rounded-[3px] accent-campus-green cursor-pointer"
                                    aria-label={`Select claim ${claim.refCode}`}
                                  />
                                </td>

                                {/* Ref code in IBM Plex Mono */}
                                <td className="px-3 py-2.5 whitespace-nowrap">
                                  <span className="font-mono text-[12px] font-bold text-ink bg-paper px-2 py-0.5 rounded-[4px] border border-line">
                                    {claim.refCode}
                                  </span>
                                </td>

                                {/* Item & Category */}
                                <td className="px-3 py-2.5 max-w-[240px]">
                                  <div className="font-medium text-ink truncate leading-snug">
                                    {claim.itemTitle}
                                  </div>
                                  <div className="text-[11px] text-ink-muted truncate">
                                    {claim.building}
                                  </div>
                                </td>

                                {/* Claimant */}
                                <td className="px-3 py-2.5 whitespace-nowrap">
                                  <div className="font-medium text-ink">{claim.claimantName}</div>
                                  <div className="text-[11px] text-ink-muted">{claim.claimantId}</div>
                                </td>

                                {/* Submitted Date */}
                                <td className="px-3 py-2.5 text-ink-muted whitespace-nowrap hidden sm:table-cell">
                                  {claim.submittedAt}
                                </td>

                                {/* Status */}
                                <td className="px-3 py-2.5 whitespace-nowrap">
                                  <StatusChip
                                    status={
                                      claim.status === "ready_to_collect"
                                        ? "verified"
                                        : claim.status === "returned"
                                        ? "returned"
                                        : "open"
                                    }
                                  />
                                </td>

                                {/* Chevron */}
                                <td className="px-3 py-2.5 text-right">
                                  <motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={springs.snappy}
                                    className="p-1 text-ink-muted"
                                  >
                                    <ChevronDown className="w-4 h-4" />
                                  </motion.div>
                                </td>
                              </tr>

                              {/* Expanded Row with Two-Column Side-by-Side Verification Panel */}
                              {isExpanded && (
                                <tr className="bg-paper/30">
                                  <td colSpan={7} className="p-0">
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={springs.soft}
                                      className="p-4 sm:p-5 border-t border-line space-y-4"
                                    >
                                      {/* Side-by-Side Verification Columns */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Left Column: What the finder recorded (private) */}
                                        <div className="bg-surface border border-line rounded-[6px] p-4 space-y-2.5">
                                          <div className="flex items-center gap-1.5 text-campus-green text-[13px] font-semibold border-b border-line pb-2">
                                            <Shield className="w-3.5 h-3.5" />
                                            <span>What the finder recorded (private)</span>
                                          </div>

                                          <div className="space-y-1 text-[13px] text-ink leading-relaxed">
                                            <div className="text-[11px] text-ink-muted uppercase font-medium">
                                              Distinguishing physical markings
                                            </div>
                                            <p className="p-2.5 bg-paper rounded-[4px] border border-line/70">
                                              {claim.finderRecorded.privateDetails}
                                            </p>
                                          </div>

                                          <div className="grid grid-cols-2 gap-2 text-[12px] text-ink-muted pt-1 border-t border-line/60">
                                            <div>
                                              <span className="block text-[10px] uppercase font-medium">Surrendered by</span>
                                              <span className="text-ink">{claim.finderRecorded.surrenderedBy}</span>
                                            </div>
                                            <div>
                                              <span className="block text-[10px] uppercase font-medium">Vault position</span>
                                              <span className="text-ink font-mono">{claim.finderRecorded.heldAt}</span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Right Column: What the claimant said & uploaded proof */}
                                        <div className="bg-surface border border-line rounded-[6px] p-4 space-y-2.5">
                                          <div className="flex items-center gap-1.5 text-ink text-[13px] font-semibold border-b border-line pb-2">
                                            <User className="w-3.5 h-3.5 text-campus-green" />
                                            <span>What the claimant said</span>
                                          </div>

                                          <div className="space-y-1 text-[13px] text-ink leading-relaxed">
                                            <div className="text-[11px] text-ink-muted uppercase font-medium">
                                              Claimant statement & secret details
                                            </div>
                                            <p className="p-2.5 bg-paper rounded-[4px] border border-line/70">
                                              {claim.claimantSaid.privateDetails}
                                            </p>
                                          </div>

                                          {/* Uploaded proof card */}
                                          <div className="p-2.5 bg-green-tint/30 rounded-[4px] border border-campus-green/20 space-y-1 text-[12px]">
                                            <div className="flex items-center gap-1.5 font-medium text-campus-green">
                                              <FileText className="w-3.5 h-3.5" />
                                              <span>{claim.claimantProof.title}</span>
                                            </div>
                                            <div className="text-[11px] text-ink-muted">
                                              Corroborating record: <strong className="text-ink">{claim.claimantProof.serialMatch}</strong>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Staff Action Buttons */}
                                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-line">
                                        <div className="flex items-center gap-2">
                                          {/* Approve and Notify */}
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="primary"
                                            data-testid={`approve-btn-${claim.id}`}
                                            onClick={() => setApproveTarget(claim)}
                                            leftIcon={<Check className="w-3.5 h-3.5" strokeWidth={2} />}
                                          >
                                            Approve and notify
                                          </Button>

                                          {/* Ask for more details */}
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            data-testid={`needs-info-btn-${claim.id}`}
                                            onClick={() => setNeedsInfoTarget(claim)}
                                            leftIcon={<MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />}
                                          >
                                            Ask for more details
                                          </Button>
                                        </div>

                                        {/* Reject */}
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="quiet"
                                          data-testid={`reject-btn-${claim.id}`}
                                          onClick={() => setRejectTarget(claim)}
                                          className="text-brick hover:bg-brick/5"
                                        >
                                          Reject claim
                                        </Button>
                                      </div>
                                    </motion.div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Floating Action Bar for Bulk Selection (Rises from bottom with sheet spring) */}
              <AnimatePresence>
                {selectedIds.size > 0 && (
                  <motion.div
                    data-testid="floating-action-bar"
                    initial={{ y: "150%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "150%", opacity: 0 }}
                    transition={springs.sheet}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-surface border border-line rounded-[10px] shadow-elevated px-5 py-3 flex items-center gap-4 text-[13px] select-none"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-campus-green" />
                      <span className="font-semibold text-ink">
                        {selectedIds.size} {selectedIds.size === 1 ? "claim" : "claims"} selected
                      </span>
                    </div>

                    <div className="h-4 w-[1px] bg-line" />

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        data-testid="bulk-approve-btn"
                        onClick={handleBulkApprove}
                        leftIcon={<Check className="w-3.5 h-3.5" />}
                      >
                        Approve selected
                      </Button>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedIds(new Set())}
                      >
                        Clear selection
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* SECTION 2: HANDOVER DESK */}
          {activeSection === "handover" && (
            <div className="bg-surface border border-line rounded-[8px] p-6 shadow-subtle space-y-6">
              <div className="space-y-1">
                <h2 className="text-[17px] font-semibold text-ink">Physical collection handover</h2>
                <p className="text-ink-muted text-[13px]">
                  Type or scan a claim reference code from student custody passes to execute physical release.
                </p>
              </div>

              {/* Reference Code Scanner / Input */}
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-ink select-none">
                  Reference code or barcode scan
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    data-testid="handover-input"
                    placeholder="e.g. LF-2030 or LF-2041"
                    value={handoverCode}
                    onChange={(e) => handleHandoverCodeChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-[14px] font-mono uppercase bg-paper text-ink placeholder:font-sans placeholder:normal-case rounded-[6px] border border-line outline-none focus:border-campus-green focus:ring-1 focus:ring-campus-green"
                  />
                </div>

                {/* Quick Selection Chips */}
                <div className="flex items-center gap-2 text-[12px] pt-1 text-ink-muted">
                  <span>Quick pick:</span>
                  {claims
                    .filter((c) => c.status === "ready_to_collect" || c.status === "awaiting_review")
                    .slice(0, 3)
                    .map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        data-testid={`quick-handover-${item.refCode}`}
                        onClick={() => handleHandoverCodeChange(item.refCode)}
                        className="font-mono text-campus-green bg-green-tint px-2 py-0.5 rounded-[4px] border border-campus-green/20 hover:bg-green-tint/80 transition-colors cursor-pointer"
                      >
                        {item.refCode}
                      </button>
                    ))}
                </div>
              </div>

              {/* Matching Item Preview Card */}
              <AnimatePresence>
                {handoverItem && (
                  <motion.div
                    data-testid="handover-preview-card"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, scale: 0.98 }}
                    transition={springs.soft}
                    className="bg-paper border border-line rounded-[8px] p-5 space-y-4"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <StatusChip
                            status={isHandoverReturning ? "returned" : "verified"}
                          />
                          <span className="font-mono text-[13px] font-bold text-ink">
                            {handoverItem.refCode}
                          </span>
                        </div>
                        <h3 className="text-[16px] font-semibold text-ink">
                          {handoverItem.itemTitle}
                        </h3>
                        <p className="text-[12px] text-ink-muted">
                          Intake from {handoverItem.building} · Vault location:{" "}
                          <strong className="text-ink">{handoverItem.finderRecorded.heldAt}</strong>
                        </p>
                      </div>

                      <div className="w-10 h-10 rounded-[6px] bg-surface border border-line flex items-center justify-center text-campus-green shrink-0">
                        {getCategoryIcon(handoverItem.category)}
                      </div>
                    </div>

                    {/* Claimant Verification Details */}
                    <div className="bg-surface border border-line rounded-[6px] p-4 space-y-2 text-[13px]">
                      <div className="font-semibold text-ink flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-campus-green" />
                        <span>Verified claimant record</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-ink-muted">
                        <div>
                          Student name: <strong className="text-ink">{handoverItem.claimantName}</strong>
                        </div>
                        <div>
                          Student ID: <strong className="text-ink">{handoverItem.claimantId}</strong>
                        </div>
                        <div>
                          University email: <strong className="text-ink">{handoverItem.claimantEmail}</strong>
                        </div>
                        <div>
                          Submitted: <span className="text-ink">{handoverItem.submittedAt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        data-testid="mark-returned-btn"
                        isLoading={isHandoverReturning}
                        onClick={handleConfirmHandoverReturn}
                        leftIcon={<CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />}
                      >
                        Mark as returned
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* SECTION 3: INVENTORY */}
          {activeSection === "inventory" && (
            <div className="bg-surface border border-line rounded-[8px] overflow-hidden shadow-subtle divide-y divide-line">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] font-semibold text-ink">Master property register</h2>
                  <p className="text-[12px] text-ink-muted">Full catalog inventory across university facilities.</p>
                </div>
                <span className="text-[12px] text-ink-muted">
                  {placeholderItems.length} active articles
                </span>
              </div>

              <div className="divide-y divide-line max-h-[600px] overflow-y-auto">
                {placeholderItems.map((item) => (
                  <div key={item.id} className="p-3.5 px-4 flex items-center justify-between gap-3 hover:bg-paper/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[4px] bg-paper border border-line flex items-center justify-center text-campus-green shrink-0">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold text-ink">{item.refCode}</span>
                          <StatusChip status={item.status} />
                        </div>
                        <div className="text-[13px] font-medium text-ink">{item.title}</div>
                        <div className="text-[11px] text-ink-muted">{item.location} · {item.timeAgo}</div>
                      </div>
                    </div>

                    <Link to={`/items/${item.id}`}>
                      <Button variant="quiet" size="sm" rightIcon={<ExternalLink className="w-3 h-3" />}>
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CONFIRM APPROVE DIALOG */}
      <Dialog
        open={!!approveTarget}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        title="Approve claim and notify student?"
        description={
          approveTarget
            ? `Confirming this claim will dispatch an automated collection pass for reference ${approveTarget.refCode} to ${approveTarget.claimantEmail}.`
            : ""
        }
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-paper rounded-[6px] border border-line text-[13px] text-ink-muted leading-relaxed">
            Vault holding location: <strong className="text-ink">{approveTarget?.finderRecorded.heldAt}</strong>.
            The article status will morph to Ready to collect and move out of the active review queue.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
            <Button variant="secondary" onClick={() => setApproveTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              data-testid="confirm-approve-modal-btn"
              onClick={() => approveTarget && handleConfirmApprove(approveTarget)}
            >
              Confirm and approve
            </Button>
          </div>
        </div>
      </Dialog>

      {/* REJECT CLAIM DIALOG (Requires Reason) */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title="Reject claim (reason required)"
        description={
          rejectTarget
            ? `State the official basis for rejecting claim ${rejectTarget.refCode}. This note will be recorded in the audit log.`
            : ""
        }
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-ink select-none">
              Official rejection reason <span className="text-brick">*</span>
            </label>
            <textarea
              rows={3}
              data-testid="reject-reason-input"
              placeholder="e.g. Serial credentials do not match physical article; distinctive scratches contradict claimant description."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 text-[13px] bg-surface text-ink placeholder:text-ink-muted/60 rounded-[6px] border border-line outline-none focus:border-brick"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
            <Button variant="secondary" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              data-testid="confirm-reject-modal-btn"
              disabled={!rejectReason.trim()}
              onClick={handleConfirmReject}
              className="bg-brick hover:bg-brick/90 text-surface border-brick disabled:opacity-50"
            >
              Confirm rejection
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ASK FOR MORE DETAILS DIALOG */}
      <Dialog
        open={!!needsInfoTarget}
        onOpenChange={(open) => !open && setNeedsInfoTarget(null)}
        title="Request clarification from claimant"
        description={
          needsInfoTarget
            ? `Send an inquiry to ${needsInfoTarget.claimantName} (${needsInfoTarget.claimantEmail}) regarding claim ${needsInfoTarget.refCode}.`
            : ""
        }
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-ink select-none">
              Clarification prompt
            </label>
            <textarea
              rows={3}
              value={needsInfoPrompt}
              onChange={(e) => setNeedsInfoPrompt(e.target.value)}
              placeholder="e.g. Please upload additional photo proof or provide the last 4 digits of the serial number."
              className="w-full px-3 py-2 text-[13px] bg-surface text-ink placeholder:text-ink-muted/60 rounded-[6px] border border-line outline-none focus:border-campus-green"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
            <Button variant="secondary" onClick={() => setNeedsInfoTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmNeedsInfo}
            >
              Send clarification
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
