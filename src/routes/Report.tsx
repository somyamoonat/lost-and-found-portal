import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Check,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  X,
  AlertCircle,
  Info,
  Shield,
  Calculator,
  Key,
  Backpack,
  CreditCard,
  Coffee,
  BookOpen,
  Glasses,
  Umbrella,
  Package,
} from "lucide-react";
import { collegeConfig } from "@/config/college";
import { api, type ReportSubmission } from "@/data/api";
import { ClaimTicket } from "@/components/ui/ClaimTicket";
import { Button } from "@/components/ui/Button";
import { springs, easings } from "@/motion/tokens";
import { cn } from "@/lib/utils";

// Category icon helper
const getCategoryIcon = (id: string, className = "w-5 h-5") => {
  switch (id) {
    case "electronics":
      return <Calculator className={className} strokeWidth={1.5} />;
    case "wallets-ids":
      return <CreditCard className={className} strokeWidth={1.5} />;
    case "keys":
      return <Key className={className} strokeWidth={1.5} />;
    case "books-stationery":
      return <BookOpen className={className} strokeWidth={1.5} />;
    case "bags-backpacks":
      return <Backpack className={className} strokeWidth={1.5} />;
    case "clothing":
      return <Package className={className} strokeWidth={1.5} />;
    case "bottles-mugs":
      return <Coffee className={className} strokeWidth={1.5} />;
    case "eyewear":
      return <Glasses className={className} strokeWidth={1.5} />;
    default:
      return <Umbrella className={className} strokeWidth={1.5} />;
  }
};

const STEP_TITLES = [
  "Choice",
  "What is it",
  "Where and when",
  "Photo & details",
  "Handover",
  "Review",
];

const LOCAL_STORAGE_KEY = "sju_report_draft";

export const Report: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initial values from query string
  const paramType = searchParams.get("type");
  const initialType: "lost" | "found" = paramType === "found" ? "found" : "lost";
  const initialTitle = searchParams.get("title") || searchParams.get("q") || "";

  // Step state & navigation direction
  const [step, setStep] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMaxStepReached((prev) => Math.max(prev, step));
  }, [step]);
  const [submittedResult, setSubmittedResult] = useState<{
    refCode: string;
    itemTitle: string;
    date: string;
    location: string;
    type: "lost" | "found";
  } | null>(null);

  // Form Fields State
  const [reportType, setReportType] = useState<"lost" | "found">(initialType);
  const [category, setCategory] = useState("electronics");
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");
  const [brand, setBrand] = useState("");

  const [building, setBuilding] = useState(collegeConfig.buildings[0]?.id || "bldg-lib");
  const [spot, setSpot] = useState("");
  const [dateTime, setDateTime] = useState("2026-11-21T10:30");

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [verificationDetail, setVerificationDetail] = useState("");

  const [handoverMethod, setHandoverMethod] = useState<"desk" | "finder_holding">("desk");
  const [contactPreference, setContactPreference] = useState<"email" | "phone" | "desk_pickup">("email");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Autosave indicator state
  const [draftSaved, setDraftSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync URL query when reportType changes
  useEffect(() => {
    const currentParam = searchParams.get("type");
    if (currentParam !== reportType) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("type", reportType);
          return next;
        },
        { replace: true }
      );
    }
  }, [reportType, searchParams, setSearchParams]);

  // Load draft from localStorage on mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.reportType && !paramType) setReportType(draft.reportType);
        if (draft.category) setCategory(draft.category);
        if (draft.title && !initialTitle) setTitle(draft.title);
        if (draft.description) setDescription(draft.description);
        if (draft.color) setColor(draft.color);
        if (draft.brand) setBrand(draft.brand);
        if (draft.building) setBuilding(draft.building);
        if (draft.spot) setSpot(draft.spot);
        if (draft.dateTime) setDateTime(draft.dateTime);
        if (draft.verificationDetail) setVerificationDetail(draft.verificationDetail);
        if (draft.contactName) setContactName(draft.contactName);
        if (draft.contactEmail) setContactEmail(draft.contactEmail);
        if (draft.contactPhone) setContactPhone(draft.contactPhone);
        if (draft.handoverMethod) setHandoverMethod(draft.handoverMethod);
        if (draft.contactPreference) setContactPreference(draft.contactPreference);
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);

  // Autosave to localStorage on changes
  useEffect(() => {
    if (submittedResult) return;
    const timer = setTimeout(() => {
      try {
        const draftData = {
          reportType,
          category,
          title,
          description,
          color,
          brand,
          building,
          spot,
          dateTime,
          verificationDetail,
          handoverMethod,
          contactPreference,
          contactName,
          contactEmail,
          contactPhone,
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draftData));
        setDraftSaved(true);
        const hideTimer = setTimeout(() => setDraftSaved(false), 2200);
        return () => clearTimeout(hideTimer);
      } catch {
        // Ignore storage write errors
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [
    reportType,
    category,
    title,
    description,
    color,
    brand,
    building,
    spot,
    dateTime,
    verificationDetail,
    handoverMethod,
    contactPreference,
    contactName,
    contactEmail,
    contactPhone,
    submittedResult,
  ]);

  // Validation logic per step
  const validateStep = (stepIndex: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepIndex === 1) {
      if (!title.trim()) {
        newErrors.title = "Article headline or title is required.";
      }
      if (!description.trim()) {
        newErrors.description = "Please provide a brief description.";
      }
    } else if (stepIndex === 2) {
      if (!building) {
        newErrors.building = "Please select a campus building.";
      }
      if (!spot.trim()) {
        newErrors.spot = "Specific location or spot is required.";
      }
      if (!dateTime) {
        newErrors.dateTime = "Date and approximate time are required.";
      }
    } else if (stepIndex === 3) {
      if (reportType === "found" && !verificationDetail.trim()) {
        newErrors.verificationDetail =
          "Private verification detail is required for found items to verify the rightful owner.";
      }
    } else if (stepIndex === 4) {
      if (!contactName.trim()) {
        newErrors.contactName = "Your name is required.";
      }
      if (!contactEmail.trim()) {
        newErrors.contactEmail = "University email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
        newErrors.contactEmail = "Please enter a valid email address.";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Focus first invalid element
      setTimeout(() => {
        const firstErrorKey = Object.keys(newErrors)[0];
        const el = document.querySelector(`[data-field="${firstErrorKey}"]`) as
          | HTMLInputElement
          | HTMLTextAreaElement
          | null;
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus();
        }
      }, 50);
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    if (step < 5) {
      setDirection(1);
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const jumpToStep = (targetStep: number) => {
    setDirection(targetStep > step ? 1 : -1);
    setStep(targetStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Keyboard navigation: Enter advances (when not in multiline textarea)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && (e.target as HTMLElement).tagName !== "TEXTAREA") {
      e.preventDefault();
      handleNext();
    }
  };

  // Drag and Drop Photo Handling
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processPhotoFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processPhotoFile(e.target.files[0]);
    }
  };

  const processPhotoFile = (file: File) => {
    setPhotoName(file.name);
    setUploadProgress(10);

    // Simulate progress ring
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 30;
      });
    }, 80);

    const objectUrl = URL.createObjectURL(file);
    setPhotoUrl(objectUrl);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    setPhotoName(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Final Form Submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const selectedBldg = collegeConfig.buildings.find((b) => b.id === building);
    const bldgName = selectedBldg ? selectedBldg.name : building;

    const payload: ReportSubmission = {
      type: reportType,
      category,
      title: title.trim(),
      description: description.trim(),
      color: color.trim() || undefined,
      brand: brand.trim() || undefined,
      building: bldgName,
      spot: spot.trim(),
      dateTime,
      photoUrl,
      photoName,
      verificationDetail: reportType === "found" ? verificationDetail.trim() : undefined,
      handoverMethod: reportType === "found" ? handoverMethod : undefined,
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim() || undefined,
    };

    try {
      const response = await api.submitReport(payload);
      // Clear draft on successful submit
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      setSubmittedResult({
        refCode: response.refCode,
        itemTitle: payload.title,
        date: "21 Nov 2026, 14:00",
        location: `${bldgName}${payload.spot ? ` (${payload.spot})` : ""}`,
        type: reportType,
      });
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Character counter helper
  const descMax = 300;
  const descCount = description.length;
  const descColorClass =
    descCount > 290
      ? "text-brick font-medium"
      : descCount > 250
      ? "text-tag-amber font-medium"
      : "text-ink-muted";

  // Transition variants for direction-aware animations
  const stepVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 24 : -24,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { duration: 0.35, ease: easings.out },
        opacity: { duration: 0.25, ease: easings.out },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -24 : 24,
      opacity: 0,
      transition: {
        x: { duration: 0.18, ease: easings.out },
        opacity: { duration: 0.15, ease: easings.out },
      },
    }),
  };

  return (
    <div
      className="max-w-[760px] mx-auto px-4 sm:px-6 py-8 sm:py-12"
      onKeyDown={handleKeyDown}
    >
      {/* Screen reader announcement for step changes */}
      <div aria-live="polite" className="sr-only">
        Step {step + 1} of {STEP_TITLES.length}: {STEP_TITLES[step]}
      </div>

      {/* SUCCESS STATE */}
      <AnimatePresence mode="wait">
        {submittedResult ? (
          <motion.div
            key="success-container"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: easings.out }}
            className="space-y-8 text-center pt-2"
          >
            {/* Header copy */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-tint text-campus-green text-[13px] font-medium border border-campus-green/20">
                <Check className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Report successfully registered</span>
              </div>
              <h1 className="type-h2 text-ink">
                {submittedResult.type === "lost"
                  ? "Your lost item report has been logged"
                  : "Thank you for registering found property"}
              </h1>
              <p className="type-body text-ink-muted max-w-lg mx-auto">
                Official intake registry confirmation for {submittedResult.itemTitle}.
              </p>
            </div>

            {/* Signature ClaimTicket Printing Out of the Slot */}
            <div className="pt-2 pb-4">
              <ClaimTicket
                refCode={submittedResult.refCode}
                itemTitle={submittedResult.itemTitle}
                date={submittedResult.date}
                location={submittedResult.location}
                status="open"
                animateEntrance={true}
              />
            </div>

            {/* What happens next: Exactly three plain sentences */}
            <div className="bg-surface border border-line rounded-[12px] p-6 text-left max-w-lg mx-auto shadow-subtle space-y-3">
              <div className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                <Info className="w-4 h-4 text-campus-green" strokeWidth={1.5} />
                <span>What happens next</span>
              </div>
              <div className="space-y-2.5 text-[14px] text-ink-muted leading-relaxed">
                <p>
                  1. Your report has been logged in the campus intake registry with reference code{" "}
                  <span className="font-mono text-ink font-semibold">{submittedResult.refCode}</span>.
                </p>
                <p>
                  2. Campus Safety cross-references new surrendered items against open reports twice daily.
                </p>
                <p>
                  3. We will contact you via your registered email ({contactEmail || "student@stjude.edu"}) the moment a verified match is confirmed at Central Desk.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/my-reports")}
                className="w-full sm:w-auto"
              >
                View in my reports
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  setSubmittedResult(null);
                  setStep(0);
                  setTitle("");
                  setDescription("");
                  setColor("");
                  setBrand("");
                  setSpot("");
                  setVerificationDetail("");
                  setPhotoUrl(null);
                  setPhotoName(null);
                }}
                className="w-full sm:w-auto"
              >
                Report another item
              </Button>
            </div>
          </motion.div>
        ) : (
          <div key="report-flow-container" className="space-y-6">
            {/* Top Stepper Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[13px] text-ink-muted">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink">
                    Step {step + 1} of {STEP_TITLES.length}
                  </span>
                  <span>·</span>
                  <span className="text-ink-muted">{STEP_TITLES[step]}</span>
                </div>

                {/* Draft autosave indicator */}
                <div className="h-5 flex items-center">
                  <AnimatePresence>
                    {draftSaved && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-1 text-[12px] text-campus-green"
                      >
                        <Check className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>Draft saved</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Animated Progress Bar Track: green fill animates scaleX */}
              <div className="w-full h-1.5 bg-line rounded-full overflow-hidden relative">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-campus-green rounded-full"
                  style={{ transformOrigin: "left" }}
                  initial={false}
                  animate={{ scaleX: (step + 1) / STEP_TITLES.length }}
                  transition={{ duration: 0.35, ease: easings.out }}
                  data-testid="stepper-progress-fill"
                />
              </div>

              {/* Stepper Step Labels (Desktop & Tablet) */}
              <div className="hidden sm:grid grid-cols-6 gap-2 text-[12px] pt-1 select-none">
                {STEP_TITLES.map((titleText, idx) => {
                  const isCompleted = idx < step;
                  const isCurrent = idx === step;
                  const isClickable = idx <= maxStepReached;
                  return (
                    <button
                      key={titleText}
                      type="button"
                      disabled={!isClickable}
                      onClick={() => isClickable && jumpToStep(idx)}
                      className={cn(
                        "flex items-center gap-1.5 text-left transition-colors",
                        isCurrent
                          ? "text-ink font-semibold"
                          : isClickable
                          ? "text-campus-green hover:underline cursor-pointer"
                          : "text-ink-muted/60 cursor-default"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px]",
                          isCurrent
                            ? "bg-campus-green text-surface"
                            : isCompleted
                            ? "bg-green-tint text-campus-green border border-campus-green/30"
                            : "bg-line text-ink-muted"
                        )}
                      >
                        {isCompleted ? (
                          <svg
                            className="w-2.5 h-2.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <motion.path
                              d="M20 6L9 17l-5-5"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.35, ease: easings.out }}
                            />
                          </svg>
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      <span className="truncate">{titleText}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Step Container with layout animation to prevent jumping */}
            <motion.div
              layout
              transition={springs.soft}
              className="bg-surface border border-line rounded-[12px] p-6 sm:p-8 shadow-subtle overflow-hidden"
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={`step-${step}`}
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6"
                >
                  {/* STEP 0: CHOICE */}
                  {step === 0 && (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h2 className="type-h2 text-ink">What would you like to report?</h2>
                        <p className="type-body text-ink-muted">
                          Select whether you are searching for missing property or surrendering found items.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {/* Option 1: Lost */}
                        <div
                          data-testid="choice-lost"
                          onClick={() => setReportType("lost")}
                          className={cn(
                            "relative p-5 rounded-[10px] border-2 cursor-pointer transition-colors text-left flex flex-col justify-between h-44 select-none",
                            reportType === "lost"
                              ? "border-campus-green bg-green-tint/30"
                              : "border-line bg-surface hover:border-line/80"
                          )}
                        >
                          {reportType === "lost" && (
                            <motion.div
                              layoutId="choice-active-indicator"
                              className="absolute inset-0 border-2 border-campus-green rounded-[10px] pointer-events-none"
                              transition={springs.snappy}
                            />
                          )}
                          <div className="space-y-2">
                            <div className="w-10 h-10 rounded-[6px] bg-paper border border-line flex items-center justify-center text-brick">
                              <Search className="w-5 h-5" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-[17px] font-semibold text-ink">I lost something</h3>
                            <p className="text-[13px] text-ink-muted leading-relaxed">
                              Register an item you misplaced on campus so staff can notify you when matching articles arrive.
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 text-[12px] font-medium text-campus-green pt-2">
                            <span>Continue as owner</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        {/* Option 2: Found */}
                        <div
                          data-testid="choice-found"
                          onClick={() => setReportType("found")}
                          className={cn(
                            "relative p-5 rounded-[10px] border-2 cursor-pointer transition-colors text-left flex flex-col justify-between h-44 select-none",
                            reportType === "found"
                              ? "border-campus-green bg-green-tint/30"
                              : "border-line bg-surface hover:border-line/80"
                          )}
                        >
                          {reportType === "found" && (
                            <motion.div
                              layoutId="choice-active-indicator"
                              className="absolute inset-0 border-2 border-campus-green rounded-[10px] pointer-events-none"
                              transition={springs.snappy}
                            />
                          )}
                          <div className="space-y-2">
                            <div className="w-10 h-10 rounded-[6px] bg-paper border border-line flex items-center justify-center text-campus-green">
                              <Shield className="w-5 h-5" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-[17px] font-semibold text-ink">I found something</h3>
                            <p className="text-[13px] text-ink-muted leading-relaxed">
                              Log an item discovered on campus so the rightful student or staff owner can safely reclaim it.
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 text-[12px] font-medium text-campus-green pt-2">
                            <span>Continue as finder</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 1: WHAT IS IT */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h2 className="type-h2 text-ink">
                          {reportType === "lost" ? "What did you lose?" : "What did you find?"}
                        </h2>
                        <p className="type-body text-ink-muted">
                          Choose the category and describe the article in plain words.
                        </p>
                      </div>

                      {/* Category Grid (8 categories) */}
                      <div className="space-y-2">
                        <label className="block text-[14px] font-medium text-ink select-none">
                          Property category
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {collegeConfig.categories.slice(0, 8).map((cat) => {
                            const isSelected = category === cat.id;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                data-testid={`category-btn-${cat.id}`}
                                onClick={() => setCategory(cat.id)}
                                className={cn(
                                  "p-3 rounded-[6px] border text-left flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer select-none",
                                  isSelected
                                    ? "bg-green-tint/50 border-campus-green text-campus-green font-medium"
                                    : "bg-surface border-line text-ink hover:border-line/90"
                                )}
                              >
                                <div
                                  className={cn(
                                    "p-2 rounded-[6px]",
                                    isSelected ? "text-campus-green bg-surface" : "text-ink-muted bg-paper"
                                  )}
                                >
                                  {getCategoryIcon(cat.id, "w-5 h-5")}
                                </div>
                                <span className="text-[12px] text-center leading-tight">
                                  {cat.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Article Title */}
                      <div className="space-y-1.5">
                        <label className="block text-[14px] font-medium text-ink select-none">
                          Item title or concise description <span className="text-brick">*</span>
                        </label>
                        <input
                          type="text"
                          data-field="title"
                          placeholder={
                            reportType === "lost"
                              ? "e.g. Navy blue Herschel backpack with broken zipper"
                              : "e.g. Casio scientific calculator fx-991EX with grey slide cover"
                          }
                          value={title}
                          onChange={(e) => {
                            setTitle(e.target.value);
                            if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
                          }}
                          className={cn(
                            "w-full px-3.5 py-2.5 text-[14px] bg-surface text-ink placeholder:text-ink-muted/60 rounded-[6px] border outline-none transition-all duration-150",
                            errors.title
                              ? "border-brick ring-1 ring-brick"
                              : "border-line focus:border-campus-green focus:ring-1 focus:ring-campus-green"
                          )}
                        />
                        <AnimatePresence>
                          {errors.title && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex items-center gap-1.5 text-[12px] text-brick pt-1"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{errors.title}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Description with character counter */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-[14px] font-medium text-ink select-none">
                            Physical description <span className="text-brick">*</span>
                          </label>
                          <span className={cn("text-[12px] select-none transition-colors", descColorClass)}>
                            {descCount}/{descMax}
                          </span>
                        </div>
                        <textarea
                          data-field="description"
                          rows={3}
                          maxLength={descMax}
                          placeholder="Note key details like colour shade, distinctive scratches, stickers, case type, or exterior markings."
                          value={description}
                          onChange={(e) => {
                            setDescription(e.target.value);
                            if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
                          }}
                          className={cn(
                            "w-full px-3.5 py-2.5 text-[14px] bg-surface text-ink placeholder:text-ink-muted/60 rounded-[6px] border outline-none transition-all duration-150 resize-none",
                            errors.description
                              ? "border-brick ring-1 ring-brick"
                              : "border-line focus:border-campus-green focus:ring-1 focus:ring-campus-green"
                          )}
                        />
                        <AnimatePresence>
                          {errors.description && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex items-center gap-1.5 text-[12px] text-brick pt-1"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{errors.description}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Optional Brand & Colour */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[14px] font-medium text-ink select-none">
                            Primary colour (optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Matte black, Navy, Silver"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-[14px] bg-surface text-ink placeholder:text-ink-muted/60 rounded-[6px] border border-line outline-none focus:border-campus-green focus:ring-1 focus:ring-campus-green"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[14px] font-medium text-ink select-none">
                            Brand or maker (optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Apple, Casio, Hydro Flask"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-[14px] bg-surface text-ink placeholder:text-ink-muted/60 rounded-[6px] border border-line outline-none focus:border-campus-green focus:ring-1 focus:ring-campus-green"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: WHERE AND WHEN */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h2 className="type-h2 text-ink">Where and when?</h2>
                        <p className="type-body text-ink-muted">
                          Pinpoint the campus building, specific location, and approximate timestamp.
                        </p>
                      </div>

                      {/* Building select */}
                      <div className="space-y-1.5">
                        <label className="block text-[14px] font-medium text-ink select-none">
                          Campus building or facility <span className="text-brick">*</span>
                        </label>
                        <select
                          data-field="building"
                          value={building}
                          onChange={(e) => setBuilding(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-[14px] bg-surface text-ink rounded-[6px] border border-line outline-none focus:border-campus-green focus:ring-1 focus:ring-campus-green"
                        >
                          {collegeConfig.buildings.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} ({b.zone} Campus · Code {b.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Specific spot */}
                      <div className="space-y-1.5">
                        <label className="block text-[14px] font-medium text-ink select-none">
                          Specific spot or room <span className="text-brick">*</span>
                        </label>
                        <input
                          type="text"
                          data-field="spot"
                          placeholder="e.g. 2nd floor quiet stacks, near study carrel 14"
                          value={spot}
                          onChange={(e) => {
                            setSpot(e.target.value);
                            if (errors.spot) setErrors((prev) => ({ ...prev, spot: "" }));
                          }}
                          className={cn(
                            "w-full px-3.5 py-2.5 text-[14px] bg-surface text-ink placeholder:text-ink-muted/60 rounded-[6px] border outline-none transition-all duration-150",
                            errors.spot
                              ? "border-brick ring-1 ring-brick"
                              : "border-line focus:border-campus-green focus:ring-1 focus:ring-campus-green"
                          )}
                        />
                        <AnimatePresence>
                          {errors.spot && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex items-center gap-1.5 text-[12px] text-brick pt-1"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{errors.spot}</span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Date and Time with Quick Chips */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-[14px] font-medium text-ink select-none">
                            Date and approximate time <span className="text-brick">*</span>
                          </label>
                          {/* Quick selection chips */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setDateTime("2026-11-21T09:00")}
                              className="text-[12px] text-campus-green bg-green-tint px-2.5 py-0.5 rounded-[4px] border border-campus-green/20 hover:bg-green-tint/80 transition-colors cursor-pointer"
                            >
                              Earlier today
                            </button>
                            <button
                              type="button"
                              onClick={() => setDateTime("2026-11-20T16:30")}
                              className="text-[12px] text-campus-green bg-green-tint px-2.5 py-0.5 rounded-[4px] border border-campus-green/20 hover:bg-green-tint/80 transition-colors cursor-pointer"
                            >
                              Yesterday
                            </button>
                          </div>
                        </div>

                        <input
                          type="datetime-local"
                          data-field="dateTime"
                          value={dateTime}
                          onChange={(e) => setDateTime(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-[14px] bg-surface text-ink rounded-[6px] border border-line outline-none focus:border-campus-green focus:ring-1 focus:ring-campus-green"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 3: PHOTO & VERIFICATION */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h2 className="type-h2 text-ink">
                          {reportType === "lost" ? "Photographic reference" : "Photo and owner verification"}
                        </h2>
                        <p className="type-body text-ink-muted">
                          {reportType === "lost"
                            ? "Adding a photo is optional but helps intake staff verify matching articles."
                            : "Upload a photo of the item and record confidential details only the true owner would know."}
                        </p>
                      </div>

                      {/* Drop Zone */}
                      <div className="space-y-2">
                        <label className="block text-[14px] font-medium text-ink select-none">
                          Item photo {reportType === "lost" ? "(optional)" : "(recommended)"}
                        </label>

                        {!photoUrl ? (
                          <div
                            data-testid="photo-dropzone"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                              "border-2 rounded-[10px] p-8 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-2 select-none",
                              isDragging
                                ? "border-solid border-campus-green bg-green-tint/40 text-campus-green"
                                : "border-dashed border-line bg-paper/50 hover:border-campus-green/60 text-ink"
                            )}
                          >
                            <input
                              type="file"
                              ref={fileInputRef}
                              accept="image/*"
                              onChange={handleFileInputChange}
                              className="hidden"
                            />
                            <div
                              className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                                isDragging ? "bg-surface text-campus-green" : "bg-surface text-ink-muted border border-line"
                              )}
                            >
                              <UploadCloud className="w-6 h-6" strokeWidth={1.5} />
                            </div>
                            <div className="text-[14px] font-medium">
                              {isDragging ? "Drop to upload" : "Click to select or drag photo here"}
                            </div>
                            <p className="text-[12px] text-ink-muted">
                              Supports JPG, PNG or WEBP up to 8MB
                            </p>
                          </div>
                        ) : (
                          /* Photo preview with scale-in animation and progress ring */
                          <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={springs.soft}
                            className="relative bg-surface border border-line rounded-[10px] p-4 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-16 rounded-[6px] bg-paper overflow-hidden border border-line shrink-0 relative">
                                <img
                                  src={photoUrl}
                                  alt="Upload preview"
                                  className="w-full h-full object-cover"
                                />
                                {uploadProgress < 100 && (
                                  <div className="absolute inset-0 bg-[#1A2220]/40 flex items-center justify-center">
                                    <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                                      <path
                                        className="text-white/30"
                                        strokeWidth="3"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                      />
                                      <path
                                        className="text-campus-green"
                                        strokeDasharray={`${uploadProgress}, 100`}
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="none"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-0.5 overflow-hidden">
                                <div className="text-[14px] font-medium text-ink truncate max-w-[240px] sm:max-w-xs">
                                  {photoName || "Uploaded image"}
                                </div>
                                <div className="text-[12px] text-campus-green flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" strokeWidth={2} />
                                  <span>Ready for intake verification</span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              className="p-1.5 rounded-[6px] text-ink-muted hover:text-brick hover:bg-paper transition-colors cursor-pointer"
                              title="Remove photo"
                            >
                              <X className="w-5 h-5" strokeWidth={1.5} />
                            </button>
                          </motion.div>
                        )}
                      </div>

                      {/* Private Verification Detail for FOUND items */}
                      {reportType === "found" && (
                        <div className="space-y-2 pt-2 border-t border-line">
                          <div className="flex items-center gap-2 text-campus-green text-[14px] font-medium">
                            <Shield className="w-4 h-4" strokeWidth={1.5} />
                            <span className="text-ink font-semibold">Private verification detail</span>
                            <span className="text-brick">*</span>
                          </div>
                          <p className="text-[13px] text-ink-muted leading-relaxed">
                            This detail is <strong>never shown publicly</strong>. Intake desk staff use it to verify the true owner before releasing custody.
                          </p>
                          <textarea
                            data-field="verificationDetail"
                            rows={3}
                            placeholder="e.g. Phone wallpaper image, engraved initials on back, specific keychain attached, items inside wallet"
                            value={verificationDetail}
                            onChange={(e) => {
                              setVerificationDetail(e.target.value);
                              if (errors.verificationDetail) {
                                setErrors((prev) => ({ ...prev, verificationDetail: "" }));
                              }
                            }}
                            className={cn(
                              "w-full px-3.5 py-2.5 text-[14px] bg-surface text-ink placeholder:text-ink-muted/60 rounded-[6px] border outline-none transition-all duration-150 resize-none",
                              errors.verificationDetail
                                ? "border-brick ring-1 ring-brick"
                                : "border-line focus:border-campus-green focus:ring-1 focus:ring-campus-green"
                            )}
                          />
                          <AnimatePresence>
                            {errors.verificationDetail && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-1.5 text-[12px] text-brick pt-1"
                              >
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{errors.verificationDetail}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 4: HANDOVER & CONTACT */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h2 className="type-h2 text-ink">
                          {reportType === "found" ? "Handover status & contact" : "Contact preferences"}
                        </h2>
                        <p className="type-body text-ink-muted">
                          {reportType === "found"
                            ? "Tell us where the physical item currently is and how we can reach you."
                            : "How should Central Intake alert you once a verified matching item arrives?"}
                        </p>
                      </div>

                      {/* Found: Handover status */}
                      {reportType === "found" ? (
                        <div className="space-y-3">
                          <label className="block text-[14px] font-medium text-ink select-none">
                            Physical item custody
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div
                              onClick={() => setHandoverMethod("desk")}
                              className={cn(
                                "p-4 rounded-[6px] border cursor-pointer transition-colors text-left select-none",
                                handoverMethod === "desk"
                                  ? "border-campus-green bg-green-tint/40 text-ink"
                                  : "border-line bg-surface hover:border-line/80 text-ink"
                              )}
                            >
                              <div className="font-medium text-[14px]">I've handed it to the desk</div>
                              <p className="text-[12px] text-ink-muted mt-1">
                                Already delivered to Central Library intake or security building.
                              </p>
                            </div>
                            <div
                              onClick={() => setHandoverMethod("finder_holding")}
                              className={cn(
                                "p-4 rounded-[6px] border cursor-pointer transition-colors text-left select-none",
                                handoverMethod === "finder_holding"
                                  ? "border-campus-green bg-green-tint/40 text-ink"
                                  : "border-line bg-surface hover:border-line/80 text-ink"
                              )}
                            >
                              <div className="font-medium text-[14px]">I'm keeping it safe, contact me</div>
                              <p className="text-[12px] text-ink-muted mt-1">
                                In your custody until the claimant verifies ownership through the portal.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Lost: Contact preference */
                        <div className="space-y-3">
                          <label className="block text-[14px] font-medium text-ink select-none">
                            Notification preference
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                              { id: "email", label: "Email alert", desc: "Automated instant message" },
                              { id: "phone", label: "Phone / SMS", desc: "Urgent text notification" },
                              { id: "desk_pickup", label: "Desk collection", desc: "Manual pickup at desk" },
                            ].map((pref) => (
                              <div
                                key={pref.id}
                                onClick={() => setContactPreference(pref.id as any)}
                                className={cn(
                                  "p-3 rounded-[6px] border cursor-pointer transition-colors text-left select-none",
                                  contactPreference === pref.id
                                    ? "border-campus-green bg-green-tint/40 text-ink"
                                    : "border-line bg-surface hover:border-line/80 text-ink"
                                )}
                              >
                                <div className="font-medium text-[13px]">{pref.label}</div>
                                <p className="text-[11px] text-ink-muted mt-0.5">{pref.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Contact fields */}
                      <div className="space-y-4 pt-2 border-t border-line">
                        <div className="space-y-1.5">
                          <label className="block text-[14px] font-medium text-ink select-none">
                            Your full name <span className="text-brick">*</span>
                          </label>
                          <input
                            type="text"
                            data-field="contactName"
                            placeholder="e.g. Maya Lin"
                            value={contactName}
                            onChange={(e) => {
                              setContactName(e.target.value);
                              if (errors.contactName) setErrors((prev) => ({ ...prev, contactName: "" }));
                            }}
                            className={cn(
                              "w-full px-3.5 py-2.5 text-[14px] bg-surface text-ink placeholder:text-ink-muted/60 rounded-[6px] border outline-none transition-all duration-150",
                              errors.contactName
                                ? "border-brick ring-1 ring-brick"
                                : "border-line focus:border-campus-green focus:ring-1 focus:ring-campus-green"
                            )}
                          />
                          <AnimatePresence>
                            {errors.contactName && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-1.5 text-[12px] text-brick pt-1"
                              >
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{errors.contactName}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[14px] font-medium text-ink select-none">
                            University email address <span className="text-brick">*</span>
                          </label>
                          <input
                            type="email"
                            data-field="contactEmail"
                            placeholder="e.g. m.lin@stjude.edu"
                            value={contactEmail}
                            onChange={(e) => {
                              setContactEmail(e.target.value);
                              if (errors.contactEmail) setErrors((prev) => ({ ...prev, contactEmail: "" }));
                            }}
                            className={cn(
                              "w-full px-3.5 py-2.5 text-[14px] bg-surface text-ink placeholder:text-ink-muted/60 rounded-[6px] border outline-none transition-all duration-150",
                              errors.contactEmail
                                ? "border-brick ring-1 ring-brick"
                                : "border-line focus:border-campus-green focus:ring-1 focus:ring-campus-green"
                            )}
                          />
                          <AnimatePresence>
                            {errors.contactEmail && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-1.5 text-[12px] text-brick pt-1"
                              >
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{errors.contactEmail}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[14px] font-medium text-ink select-none">
                            Telephone or mobile number (optional)
                          </label>
                          <input
                            type="tel"
                            placeholder="e.g. (555) 019-4822"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-[14px] bg-surface text-ink placeholder:text-ink-muted/60 rounded-[6px] border border-line outline-none focus:border-campus-green focus:ring-1 focus:ring-campus-green"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: REVIEW */}
                  {step === 5 && (
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h2 className="type-h2 text-ink">Review your report</h2>
                        <p className="type-body text-ink-muted">
                          Verify details prior to submission into official campus intake records.
                        </p>
                      </div>

                      {/* Summary list with Edit links */}
                      <div className="border border-line rounded-[8px] divide-y divide-line overflow-hidden text-[14px]">
                        {/* Row 0: Type */}
                        <div className="p-4 flex items-center justify-between bg-surface">
                          <div>
                            <div className="text-[12px] text-ink-muted">Report type</div>
                            <div className="font-medium text-ink capitalize">
                              {reportType === "lost" ? "Lost property inquiry" : "Found property registration"}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => jumpToStep(0)}
                            className="text-[13px] text-campus-green hover:underline font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>

                        {/* Row 1: What is it */}
                        <div className="p-4 flex items-center justify-between bg-surface">
                          <div>
                            <div className="text-[12px] text-ink-muted">Item details</div>
                            <div className="font-medium text-ink">{title || "Untitled"}</div>
                            <div className="text-[13px] text-ink-muted mt-0.5">
                              {collegeConfig.categories.find((c) => c.id === category)?.label}
                              {(brand || color) && ` · ${[brand, color].filter(Boolean).join(", ")}`}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => jumpToStep(1)}
                            className="text-[13px] text-campus-green hover:underline font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>

                        {/* Row 2: Where & When */}
                        <div className="p-4 flex items-center justify-between bg-surface">
                          <div>
                            <div className="text-[12px] text-ink-muted">Where and when</div>
                            <div className="font-medium text-ink">
                              {collegeConfig.buildings.find((b) => b.id === building)?.name}
                            </div>
                            <div className="text-[13px] text-ink-muted mt-0.5">
                              {spot} · {dateTime.replace("T", " ")}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => jumpToStep(2)}
                            className="text-[13px] text-campus-green hover:underline font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>

                        {/* Row 3: Photo & Verification */}
                        <div className="p-4 flex items-center justify-between bg-surface">
                          <div>
                            <div className="text-[12px] text-ink-muted">Photo & verification</div>
                            <div className="font-medium text-ink">
                              {photoName ? `Photo attached (${photoName})` : "No photo attached"}
                            </div>
                            {reportType === "found" && (
                              <div className="text-[12px] text-campus-green mt-0.5 flex items-center gap-1">
                                <Shield className="w-3.5 h-3.5" />
                                <span>Confidential verification detail recorded</span>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => jumpToStep(3)}
                            className="text-[13px] text-campus-green hover:underline font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>

                        {/* Row 4: Handover / Contact */}
                        <div className="p-4 flex items-center justify-between bg-surface">
                          <div>
                            <div className="text-[12px] text-ink-muted">Contact information</div>
                            <div className="font-medium text-ink">
                              {contactName} ({contactEmail})
                            </div>
                            <div className="text-[13px] text-ink-muted mt-0.5">
                              {reportType === "found"
                                ? handoverMethod === "desk"
                                  ? "Delivered to intake desk"
                                  : "Finder holding safely"
                                : `Alert method: ${contactPreference}`}
                              {contactPhone ? ` · Tel: ${contactPhone}` : ""}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => jumpToStep(4)}
                            className="text-[13px] text-campus-green hover:underline font-medium cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </div>

                      {/* Policy notice */}
                      <div className="p-4 rounded-[6px] bg-paper text-[12px] text-ink-muted space-y-1">
                        <div className="font-medium text-ink">Campus intake policy</div>
                        <p>
                          By submitting, you certify that the information provided is accurate. Unclaimed
                          articles are preserved in central vault custody for 90 days.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* BOTTOM ACTION BUTTONS */}
                  <div className="flex items-center justify-between pt-4 border-t border-line">
                    {step > 0 ? (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleBack}
                        leftIcon={<ChevronLeft className="w-4 h-4" strokeWidth={1.5} />}
                      >
                        Back
                      </Button>
                    ) : (
                      <div />
                    )}

                    {maxStepReached >= 5 && step < 5 && (
                      <Button
                        type="button"
                        variant="quiet"
                        size="md"
                        onClick={() => jumpToStep(5)}
                      >
                        Return to review
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      isLoading={isSubmitting}
                      onClick={handleNext}
                      rightIcon={
                        step < 5 ? (
                          <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                        ) : undefined
                      }
                    >
                      {step === 5 ? "Submit report" : "Continue"}
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
