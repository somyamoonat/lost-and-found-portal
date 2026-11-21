import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Copy,
  Check,
  Calendar,
  MapPin,
  Building2,
  Tag,
  ShieldCheck,
  UploadCloud,
  FileText,
  Clock,
  Loader2,
  X,
  Lock,
} from "lucide-react";
import { collegeConfig } from "@/config/college";
import { api, type ClaimSubmission } from "@/data/api";
import type { Item } from "@/data/items";
import { StatusChip } from "@/motion/StatusChip";
import { ItemCard, getCategoryIcon } from "@/components/ui/ItemCard";
import { ClaimTicket } from "@/components/ui/ClaimTicket";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/motion/Skeleton";
import { springs, durations, easings, transitions } from "@/motion/tokens";
import {
  slideSheetRightVariants,
  slideSheetBottomVariants,
  backdropFadeVariants,
  riseInVariants,
} from "@/motion/variants";
import { cn } from "@/lib/utils";

export const ItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Item state
  const [item, setItem] = useState<Item | null>(null);
  const [similarItems, setSimilarItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Thumbnail selection
  const [activeThumbnailIndex, setActiveThumbnailIndex] = useState(0);

  // Reference code copy feedback
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Claim sheet state
  const [claimSheetOpen, setClaimSheetOpen] = useState(false);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [isClaimedState, setIsClaimedState] = useState(false);

  // Claim form fields
  const [claimDescription, setClaimDescription] = useState("");
  const [identifyingDetail, setIdentifyingDetail] = useState("");
  const [lostDate, setLostDate] = useState("2026-11-21T08:30");
  const [lostLocation, setLostLocation] = useState(collegeConfig.buildings[0]?.name || "Main Library");
  const [proofFileName, setProofFileName] = useState<string | null>(null);
  const [claimantName, setClaimantName] = useState("");
  const [claimantEmail, setClaimantEmail] = useState("");

  // Track viewport width for responsive sheet behavior (right slide on desktop, bottom sheet on mobile)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch item and similar items on mount or ID change
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setActiveThumbnailIndex(0);
    setClaimSubmitted(false);

    async function loadData() {
      if (!id) return;
      try {
        const foundItem = await api.getItemById(id);
        if (!active) return;

        if (foundItem) {
          setItem(foundItem);
          setIsClaimedState(foundItem.status === "returned");
          const similar = await api.getSimilarItems(foundItem.category, foundItem.id, 4);
          if (active) {
            setSimilarItems(similar);
            setIsLoading(false);
          }
        } else {
          setItem(null);
          setIsLoading(false);
        }
      } catch (err) {
        if (active) {
          console.error("Failed to load item:", err);
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, [id]);

  // Lock body scroll when claim sheet is open
  useEffect(() => {
    if (claimSheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [claimSheetOpen]);

  // Handle reference code copy with 1.5s morph
  const handleCopyCode = async () => {
    if (!item) return;
    try {
      await navigator.clipboard.writeText(item.refCode);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  // Handle claim form submission
  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setIsSubmittingClaim(true);
    const submission: ClaimSubmission = {
      description: claimDescription,
      identifyingDetail,
      lostDate,
      lostLocation,
      proofFileName: proofFileName || undefined,
      claimantName,
      claimantEmail,
    };

    try {
      await api.submitClaim(item.id, submission);
      setIsSubmittingClaim(false);
      setClaimSubmitted(true);
      setIsClaimedState(true);
      setItem((prev) => (prev ? { ...prev, status: "verified" } : null));
    } catch (err) {
      console.error("Claim submission failed:", err);
      setIsSubmittingClaim(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 select-none">
        <div className="w-36 h-4">
          <Skeleton className="h-4 w-36 rounded-[4px]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-3">
            <Skeleton shape="rect" className="w-full aspect-[4/3] rounded-[10px]" />
            <div className="flex gap-2">
              <Skeleton className="w-20 h-14 rounded-[6px]" />
              <Skeleton className="w-20 h-14 rounded-[6px]" />
              <Skeleton className="w-20 h-14 rounded-[6px]" />
            </div>
          </div>
          <div className="lg:col-span-7 space-y-5">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-8 w-3/4 rounded-[6px]" />
            <Skeleton className="h-5 w-48 rounded-[4px]" />
            <Skeleton className="h-24 w-full rounded-[8px]" />
            <Skeleton className="h-40 w-full rounded-[10px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <h2 className="text-[20px] font-semibold text-ink">Item not found</h2>
        <p className="text-[14px] text-ink-muted">
          The property reference code LF-{id} does not correspond to an active intake record.
        </p>
        <Link
          to="/browse"
          className="inline-flex items-center gap-2 text-campus-green font-medium hover:underline pt-2"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          <span>Return to browse catalog</span>
        </Link>
      </div>
    );
  }

  const categoryConfig = collegeConfig.categories.find((c) => c.id === item.category);
  const categoryLabel = categoryConfig?.label || item.category;

  const thumbnails = item.thumbnails || [
    { id: "view-1", label: "Front perspective", angle: "Front" },
    { id: "view-2", label: "Markings & condition", angle: "Markings" },
    { id: "view-3", label: "Serial label & markings", angle: "Serial tag" },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Top Navigation Row: Back link */}
      <div>
        <Link
          to="/browse"
          data-testid="back-to-browse"
          className="inline-flex items-center gap-2 text-[14px] font-medium text-ink-muted hover:text-ink transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.5} />
          <span>Back to browse property</span>
        </Link>
      </div>

      {/* Main 2-Column Inspection Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* =========================================================================
            LEFT COLUMN: Main Image & Thumbnails
            Shared layoutId image transition with crossfading views & sliding underline
            ========================================================================= */}
        <div className="lg:col-span-5 space-y-3">
          {/* Main 4:3 Image View with Shared layoutId */}
          <div className="relative w-full aspect-[4/3] rounded-[10px] overflow-hidden bg-surface border border-line shadow-subtle">
            <motion.div
              layoutId={`item-image-${item.id}`}
              className="w-full h-full flex items-center justify-center bg-[#ECEFEA]"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeThumbnailIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: durations.uiExit, ease: easings.out }}
                  className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none"
                >
                  {item.photo ? (
                    <img
                      src={item.photo}
                      alt={`${item.title} - ${thumbnails[activeThumbnailIndex]?.label || "View"}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 rounded-[8px] bg-surface border border-line flex items-center justify-center shadow-subtle">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div className="space-y-1">
                        <span className="font-mono text-[13px] font-semibold text-ink-muted block">
                          {item.refCode}
                        </span>
                        <span className="text-[12px] text-ink-muted block">
                          {thumbnails[activeThumbnailIndex]?.label || "Intake inspection"}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Thumbnails Row with layoutId sliding underline */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {thumbnails.map((thumb, idx) => {
              const isActive = activeThumbnailIndex === idx;
              return (
                <button
                  key={thumb.id}
                  type="button"
                  onClick={() => setActiveThumbnailIndex(idx)}
                  className={cn(
                    "relative px-3 py-2 rounded-[6px] border text-left transition-colors cursor-pointer shrink-0 select-none",
                    isActive
                      ? "bg-surface border-campus-green text-ink"
                      : "bg-paper border-line text-ink-muted hover:text-ink hover:border-line/80"
                  )}
                >
                  <span className="text-[12px] font-medium block">
                    {thumb.angle}
                  </span>
                  <span className="text-[10px] text-ink-muted block truncate max-w-[90px]">
                    {thumb.label}
                  </span>

                  {/* Sliding active indicator underline via layoutId */}
                  {isActive && (
                    <motion.div
                      layoutId="thumbnail-underline"
                      transition={springs.snappy}
                      className="absolute bottom-[-1px] left-2 right-2 h-[2px] bg-campus-green rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-paper rounded-[6px] border border-line text-[12px] text-ink-muted flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-campus-green shrink-0 mt-0.5" strokeWidth={1.5} />
            <span>
              Identifying marks, serial characters, and contents are concealed for owner verification.
            </span>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: Title, Mono Code with Copy, Definition List & History Timeline
            Content staggers in at 0.05s on entry
            ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header Block: Status Chip, Title, and Ref Code */}
          <motion.div
            variants={riseInVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.05, duration: durations.ui }}
            className="space-y-3 border-b border-line pb-5"
          >
            <div className="flex items-center gap-2.5">
              <StatusChip status={isClaimedState ? "returned" : item.status} />
              <span className="text-[13px] text-ink-muted">· {categoryLabel}</span>
            </div>

            <h1 className="text-[26px] sm:text-[32px] font-semibold text-ink leading-tight">
              {item.title}
            </h1>

            {/* Reference Code in Mono with Interactive 1.5s Copy Morph */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5 bg-surface border border-line rounded-[6px] px-2.5 py-1 shadow-subtle">
                <Tag className="w-3.5 h-3.5 text-campus-green shrink-0" strokeWidth={1.5} />
                <span className="text-[12px] text-ink-muted">Ref:</span>
                <span className="font-mono text-[14px] font-bold text-ink tracking-tight">
                  {item.refCode}
                </span>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  data-testid="copy-ref-button"
                  aria-label="Copy reference code"
                  className="ml-1 p-1 rounded-[4px] hover:bg-paper transition-colors text-ink-muted hover:text-ink cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-green"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {copied ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={transitions.microOut}
                        className="flex items-center"
                      >
                        <Check className="w-3.5 h-3.5 text-campus-green" strokeWidth={1.5} />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={transitions.microOut}
                        className="flex items-center"
                      >
                        <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              {/* "Copied" Feedback Label fading in/out */}
              <AnimatePresence>
                {copied && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={transitions.microOut}
                    className="text-[12px] font-medium text-campus-green"
                  >
                    Copied
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            variants={riseInVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1, duration: durations.ui }}
            className="space-y-2"
          >
            <h2 className="text-[15px] font-semibold text-ink">Intake description</h2>
            <p className="text-[15px] text-ink leading-relaxed">
              {item.description}
            </p>
          </motion.div>

          {/* Definition List: Category, Where Found, Date and Time, Currently Held At */}
          <motion.div
            variants={riseInVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.15, duration: durations.ui }}
            className="bg-surface border border-line rounded-[12px] p-5 shadow-subtle"
          >
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <dt className="text-[12px] text-ink-muted flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-campus-green shrink-0" strokeWidth={1.5} />
                  <span>Category</span>
                </dt>
                <dd className="text-[14px] font-medium text-ink">
                  {categoryLabel}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-[12px] text-ink-muted flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-campus-green shrink-0" strokeWidth={1.5} />
                  <span>Where found</span>
                </dt>
                <dd className="text-[14px] font-medium text-ink">
                  {item.location} ({item.buildingCode})
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-[12px] text-ink-muted flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-campus-green shrink-0" strokeWidth={1.5} />
                  <span>Date and time</span>
                </dt>
                <dd className="text-[14px] font-medium text-ink">
                  {new Date(item.occurredAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-[12px] text-ink-muted flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-campus-green shrink-0" strokeWidth={1.5} />
                  <span>Currently held at</span>
                </dt>
                <dd className="text-[14px] font-medium text-ink">
                  {item.currentlyHeldAt || "Central Library Intake Vault, Room 104"}
                </dd>
              </div>
            </dl>
          </motion.div>

          {/* "Item History" Timeline */}
          <motion.div
            variants={riseInVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2, duration: durations.ui }}
            className="bg-surface border border-line rounded-[12px] p-5 shadow-subtle space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-line pb-3">
              <Clock className="w-4 h-4 text-campus-green" strokeWidth={1.5} />
              <h2 className="text-[15px] font-semibold text-ink">Item history</h2>
            </div>

            <div className="space-y-4 pl-2 relative before:content-[''] before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[1px] before:bg-line">
              {(item.history || []).map((step, idx) => (
                <div key={step.id || idx} className="relative flex items-start gap-3.5">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full mt-1 shrink-0 z-10 border-2",
                      idx === 0
                        ? "bg-campus-green border-surface ring-2 ring-campus-green/20"
                        : "bg-surface border-campus-green"
                    )}
                  />
                  <div className="space-y-0.5 text-left flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[13px] font-semibold text-ink">
                        {step.title}
                      </span>
                      <span className="text-[11px] text-ink-muted">
                        {step.timestamp.includes("T")
                          ? new Date(step.timestamp).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : step.timestamp}
                      </span>
                    </div>
                    <p className="text-[12px] text-ink-muted leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Action Area: Claim Flow Button or "This item has been claimed" Text */}
          <motion.div
            variants={riseInVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.25, duration: durations.ui }}
            className="pt-2"
          >
            {isClaimedState ? (
              <div
                data-testid="claimed-message"
                className="p-4 bg-paper border border-line rounded-[8px] flex items-center justify-between gap-3 text-ink"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-campus-green shrink-0" strokeWidth={1.5} />
                  <span className="text-[15px] font-medium text-ink">
                    This item has been claimed.
                  </span>
                </div>
                <StatusChip status="returned" label="Claim verified" />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  data-testid="claim-item-button"
                  variant="primary"
                  size="lg"
                  onClick={() => setClaimSheetOpen(true)}
                  className="flex-1 justify-center text-[15px]"
                >
                  Claim this item
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate("/my-reports")}
                  className="justify-center"
                >
                  View my reports
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* =========================================================================
          SIMILAR ITEMS ROW
          Revealed once on scroll with whileInView
          ========================================================================= */}
      {similarItems.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: durations.page, ease: easings.out }}
          className="pt-8 border-t border-line space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[20px] font-semibold text-ink">Similar items</h2>
              <p className="text-[13px] text-ink-muted">
                Other property cataloged in {categoryLabel} or nearby buildings.
              </p>
            </div>
            <Link
              to={`/browse?categories=${item.category}`}
              className="text-[13px] text-campus-green font-medium hover:underline"
            >
              See all {categoryLabel}
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {similarItems.map((similar) => (
              <div key={similar.id} className="h-full">
                <ItemCard item={similar} viewMode="grid" />
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* =========================================================================
          CLAIM FLOW SHEET
          Slide from right on desktop, bottom with drag-to-dismiss on mobile (<768px).
          Content crossfades into self-drawing checkmark and signature ClaimTicket.
          ========================================================================= */}
      <AnimatePresence>
        {claimSheetOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Flat neutral backdrop - strictly NO blur */}
            <motion.div
              variants={backdropFadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={() => {
                if (!isSubmittingClaim) setClaimSheetOpen(false);
              }}
              className="fixed inset-0 bg-[#1A2220]/45"
            />

            {/* Unified Responsive Slide Sheet Container */}
            <motion.div
              variants={isMobile ? slideSheetBottomVariants : slideSheetRightVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              drag={isMobile ? "y" : false}
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_e, info) => {
                if (isMobile && info.offset.y > 100 && !isSubmittingClaim) {
                  setClaimSheetOpen(false);
                }
              }}
              className={cn(
                "fixed bg-surface shadow-elevated flex flex-col overflow-hidden z-20",
                isMobile
                  ? "bottom-0 left-0 right-0 max-h-[90vh] rounded-t-[16px] border-t border-line"
                  : "top-0 right-0 bottom-0 w-full max-w-xl border-l border-line"
              )}
            >
              {/* Drag Handle Bar on Mobile */}
              {isMobile && (
                <div className="pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
                  <div className="w-10 h-1 rounded-full bg-line" />
                </div>
              )}

              {/* Sheet Header */}
              <div className="px-5 sm:px-6 py-4 border-b border-line flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-[17px] sm:text-[18px] font-semibold text-ink">
                    {claimSubmitted ? "Claim receipt" : "Claim this item"}
                  </h3>
                  <p className="text-[12px] text-ink-muted">
                    Reference {item.refCode} · Central Library Desk
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setClaimSheetOpen(false)}
                  data-testid="close-sheet-btn"
                  className="p-1.5 rounded-[6px] text-ink-muted hover:text-ink hover:bg-paper cursor-pointer"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Sheet Body with Crossfade Transition between Form and Success */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                <AnimatePresence mode="wait">
                  {claimSubmitted ? (
                    /* Success State: Self-drawing check mark, text, and ClaimTicket */
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: durations.step, ease: easings.out }}
                      className="space-y-6 text-center py-4"
                    >
                      {/* Self-Drawing Check Mark (pathLength 0->1, 0.5s) */}
                      <div className="w-16 h-16 mx-auto flex items-center justify-center">
                        <svg className="w-16 h-16 text-campus-green" viewBox="0 0 52 52">
                          <motion.circle
                            cx="26"
                            cy="26"
                            r="24"
                            fill="none"
                            stroke="#1E5B4B"
                            strokeWidth="2.5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: durations.page, ease: easings.out }}
                          />
                          <motion.path
                            fill="none"
                            stroke="#1E5B4B"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 27l8 8 15-16"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: durations.page, delay: durations.pageExit, ease: easings.out }}
                          />
                        </svg>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-[20px] font-semibold text-ink">
                          Claim sent. The desk will review it within 2 working days.
                        </h4>
                        <p className="text-[14px] text-ink-muted max-w-md mx-auto leading-relaxed">
                          Your ownership statement has been forwarded to the intake supervisor. Retain the pass below for collection at Room 104.
                        </p>
                      </div>

                      {/* Signature ClaimTicket Component */}
                      <div className="pt-2">
                        <ClaimTicket
                          refCode={item.refCode}
                          itemTitle={item.title}
                          date={new Date().toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          location={item.currentlyHeldAt || item.location}
                          status="verified"
                          animateEntrance={true}
                        />
                      </div>

                      <div className="pt-4">
                        <Button
                          variant="primary"
                          className="w-full justify-center h-11 text-[15px]"
                          onClick={() => setClaimSheetOpen(false)}
                        >
                          Return to item details
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    /* Claim Form */
                    <motion.form
                      key="form"
                      onSubmit={handleSubmitClaim}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-5 text-left"
                    >
                      <div className="p-3.5 bg-paper rounded-[8px] border border-line text-[13px] text-ink-muted leading-relaxed">
                        <strong>Institutional verification:</strong> Because anyone could attempt to claim property, describe details that establish sole ownership. The finder's intake verification detail is kept strictly confidential.
                      </div>

                      {/* Field 1: Describe in own words */}
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-ink block">
                          Describe the item in your own words <span className="text-brick">*</span>
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={claimDescription}
                          onChange={(e) => setClaimDescription(e.target.value)}
                          placeholder="e.g. Matte black scientific calculator with a slight adhesive residue on the rear slide cover..."
                          className="w-full p-3 text-[14px] text-ink bg-paper border border-line rounded-[6px] outline-none focus:border-campus-green focus:ring-2 focus:ring-campus-green resize-none"
                        />
                      </div>

                      {/* Field 2: ONE identifying detail only owner would know */}
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-ink block">
                          One identifying detail only the owner would know <span className="text-brick">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={identifyingDetail}
                          onChange={(e) => setIdentifyingDetail(e.target.value)}
                          placeholder="Contents, lock screen photo, scratches, pouch items, serial digits"
                          className="w-full h-10 px-3 text-[14px] text-ink bg-paper border border-line rounded-[6px] outline-none focus:border-campus-green focus:ring-2 focus:ring-campus-green"
                        />
                        <span className="text-[12px] text-ink-muted block">
                          Never shared publicly. Used by desk supervisors to confirm ownership.
                        </span>
                      </div>

                      {/* Field 3: When and where you lost it */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-semibold text-ink block">
                            When did you lose it? <span className="text-brick">*</span>
                          </label>
                          <input
                            type="datetime-local"
                            required
                            value={lostDate}
                            onChange={(e) => setLostDate(e.target.value)}
                            className="w-full h-10 px-3 text-[13px] text-ink bg-paper border border-line rounded-[6px] outline-none focus:border-campus-green focus:ring-2 focus:ring-campus-green"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[13px] font-semibold text-ink block">
                            Where did you lose it? <span className="text-brick">*</span>
                          </label>
                          <select
                            value={lostLocation}
                            onChange={(e) => setLostLocation(e.target.value)}
                            className="w-full h-10 px-3 text-[13px] text-ink bg-paper border border-line rounded-[6px] outline-none focus:border-campus-green focus:ring-2 focus:ring-campus-green"
                          >
                            {collegeConfig.buildings.map((b) => (
                              <option key={b.id} value={b.name}>
                                {b.name} ({b.code})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Field 4: Optional proof upload */}
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-ink block">
                          Optional proof upload
                        </label>
                        <div className="border border-dashed border-line rounded-[8px] p-4 bg-paper/60 text-center hover:bg-paper transition-colors">
                          <UploadCloud className="w-6 h-6 text-ink-muted mx-auto mb-1.5" strokeWidth={1.5} />
                          <div className="text-[13px] text-ink font-medium">
                            {proofFileName ? (
                              <span className="text-campus-green flex items-center justify-center gap-1.5">
                                <FileText className="w-4 h-4" /> {proofFileName}
                              </span>
                            ) : (
                              <span>Upload purchase receipt, serial registration, or item photo</span>
                            )}
                          </div>
                          <p className="text-[11px] text-ink-muted mt-1">
                            PDF, PNG, JPG up to 10MB (optional)
                          </p>
                          <input
                            type="file"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setProofFileName(e.target.files[0].name);
                              }
                            }}
                            className="hidden"
                            id="proof-upload-input-desktop"
                          />
                          <label
                            htmlFor="proof-upload-input-desktop"
                            className="inline-block mt-2.5 text-[12px] font-semibold text-campus-green hover:underline cursor-pointer"
                          >
                            {proofFileName ? "Choose another file" : "Browse files"}
                          </label>
                        </div>
                      </div>

                      {/* Claimant Contact Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-semibold text-ink block">
                            Your full name <span className="text-brick">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={claimantName}
                            onChange={(e) => setClaimantName(e.target.value)}
                            placeholder="e.g. Alex Morgan"
                            className="w-full h-10 px-3 text-[14px] text-ink bg-paper border border-line rounded-[6px] outline-none focus:border-campus-green focus:ring-2 focus:ring-campus-green"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[13px] font-semibold text-ink block">
                            College email address <span className="text-brick">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={claimantEmail}
                            onChange={(e) => setClaimantEmail(e.target.value)}
                            placeholder="username@stjude.edu"
                            className="w-full h-10 px-3 text-[14px] text-ink bg-paper border border-line rounded-[6px] outline-none focus:border-campus-green focus:ring-2 focus:ring-campus-green"
                          />
                        </div>
                      </div>

                      {/* Submit Button with NO WIDTH CHANGE during spinner state */}
                      <div className="pt-3">
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={isSubmittingClaim}
                          data-testid="submit-claim-btn"
                          className="w-full h-11 justify-center text-[15px]"
                        >
                          <div className="flex items-center justify-center min-w-[120px] text-center">
                            {isSubmittingClaim ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin shrink-0 mr-2" strokeWidth={1.5} />
                                <span>Verifying...</span>
                              </>
                            ) : (
                              <span>Submit claim</span>
                            )}
                          </div>
                        </Button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
