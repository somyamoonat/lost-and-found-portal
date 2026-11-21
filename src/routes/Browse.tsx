import React, { useState, useEffect, useRef, useTransition } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  X,
  SlidersHorizontal,
  LayoutGrid,
  List,
  RotateCcw,
  FileQuestion,
} from "lucide-react";
import { collegeConfig } from "@/config/college";
import { api } from "@/data/api";
import type { Item } from "@/data/items";
import { subscribeToNewItems } from "@/data/realtime";
import { ItemCard } from "@/components/ui/ItemCard";
import { Button } from "@/components/ui/Button";
import { AnimatedNumber } from "@/motion/AnimatedNumber";
import { Skeleton } from "@/motion/Skeleton";
import { springs } from "@/motion/tokens";
import { slideSheetBottomVariants, backdropFadeVariants } from "@/motion/variants";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

type StatusFilter = "all" | "lost" | "found";
type DateFilter = "any" | "today" | "week" | "month";
type SortFilter = "newest" | "oldest";
type ViewMode = "grid" | "list";

export const Browse: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [, startTransition] = useTransition();

  // Read URL search params
  const searchQuery = searchParams.get("q") || "";
  const statusFilter = (searchParams.get("status") as StatusFilter) || "all";
  const buildingFilter = searchParams.get("building") || "all";
  const dateFilter = (searchParams.get("date") as DateFilter) || "any";
  const sortFilter = (searchParams.get("sort") as SortFilter) || "newest";
  const viewMode = (searchParams.get("view") as ViewMode) || "grid";

  // Categories multi-select from comma-separated URL param
  const rawCategories = searchParams.get("categories") || "";
  const selectedCategories = React.useMemo(
    () => (rawCategories ? rawCategories.split(",").filter(Boolean) : []),
    [rawCategories]
  );

  // Local state for debounced search input text
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Pagination limit
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);

  // Results state
  const [items, setItems] = useState<Item[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Realtime pending new items pill state
  const [pendingNewItems, setPendingNewItems] = useState<Item[]>([]);

  // Mobile bottom filter sheet state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Ref to the first new card for "Load more" focus management
  const firstNewCardRef = useRef<HTMLDivElement | null>(null);
  const prevLimitRef = useRef(PAGE_SIZE);

  // Sync local search when URL changes externally (e.g. browser back/forward)
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounce user input so rapid keystrokes don't spam URL params or cancel fetches
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        updateParams({ q: localSearch.trim() || null });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [localSearch]);

  // Helper to update URL search params cleanly
  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || val === "all" || val === "any" || (key === "view" && val === "grid") || (key === "sort" && val === "newest")) {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    startTransition(() => {
      setSearchParams(next, { replace: true });
    });
  };

  // Toggle category in multi-select array
  const toggleCategory = (catId: string) => {
    let nextCats: string[];
    if (selectedCategories.includes(catId)) {
      nextCats = selectedCategories.filter((c) => c !== catId);
    } else {
      nextCats = [...selectedCategories, catId];
    }
    updateParams({ categories: nextCats.length > 0 ? nextCats.join(",") : null });
  };

  // Clear all active filters
  const clearAllFilters = () => {
    setLocalSearch("");
    const next = new URLSearchParams();
    if (viewMode === "list") next.set("view", "list");
    startTransition(() => {
      setSearchParams(next, { replace: true });
    });
  };

  // Fetch items whenever URL search params change
  useEffect(() => {
    let active = true;
    setIsLoading(true);

    async function fetchData() {
      try {
        const res = await api.getItems({
          query: searchQuery,
          type: statusFilter === "all" ? undefined : statusFilter,
          categories: selectedCategories.length > 0 ? selectedCategories : undefined,
          building: buildingFilter,
          dateRange: dateFilter,
          sort: sortFilter,
          limit: displayLimit,
        });

        if (active) {
          setItems(res.items);
          setTotalCount(res.totalCount);
          setIsLoading(false);
        }
      } catch (err) {
        if (active) {
          console.error("Failed to fetch browse catalog:", err);
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, [searchQuery, statusFilter, buildingFilter, dateFilter, sortFilter, rawCategories, displayLimit]);

  // Realtime subscription: if a new item matches active filters, show sliding pill without shifting grid
  useEffect(() => {
    const unsubscribe = subscribeToNewItems((newItem: Item) => {
      // 1. Check status/type
      if (statusFilter !== "all" && newItem.type !== statusFilter) return;

      // 2. Check categories
      if (selectedCategories.length > 0 && !selectedCategories.includes(newItem.category)) return;

      // 3. Check building
      if (buildingFilter !== "all") {
        const bldg = buildingFilter.toLowerCase();
        const matchesBldg =
          newItem.buildingCode?.toLowerCase() === bldg ||
          newItem.location.toLowerCase().includes(bldg);
        if (!matchesBldg) return;
      }

      // 4. Check search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          newItem.title.toLowerCase().includes(q) ||
          newItem.refCode.toLowerCase().includes(q) ||
          newItem.description.toLowerCase().includes(q) ||
          newItem.location.toLowerCase().includes(q);
        if (!matchesQuery) return;
      }

      // If matches active filters: show "1 new item. Show" pill sliding down, DO NOT shift grid yet
      setPendingNewItems((prev) => {
        if (prev.some((i) => i.id === newItem.id || i.refCode === newItem.refCode)) return prev;
        return [newItem, ...prev];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [statusFilter, selectedCategories, buildingFilter, searchQuery]);

  // Clear pending items when user navigates or changes filters
  useEffect(() => {
    setPendingNewItems([]);
  }, [searchQuery, statusFilter, buildingFilter, dateFilter, sortFilter, rawCategories]);

  // Clicking the sliding pill inserts the pending new items into the grid
  const handleApplyPendingItems = () => {
    if (pendingNewItems.length === 0) return;
    setItems((prev) => [...pendingNewItems, ...prev]);
    setTotalCount((prev) => prev + pendingNewItems.length);
    setPendingNewItems([]);
  };

  // Handle "Load more" focus management
  useEffect(() => {
    if (displayLimit > prevLimitRef.current && firstNewCardRef.current) {
      firstNewCardRef.current.focus();
    }
    prevLimitRef.current = displayLimit;
  }, [displayLimit, items]);

  // Lock body scroll when mobile filter sheet is open
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFilterOpen]);

  // Count active filters for badge
  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) +
    selectedCategories.length +
    (buildingFilter !== "all" ? 1 : 0) +
    (dateFilter !== "any" ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;

  const dateLabels: Record<DateFilter, string> = {
    any: "Any time",
    today: "Today",
    week: "Last 7 days",
    month: "Last 30 days",
  };

  return (
    <div className="pb-24 space-y-6">
      {/* =========================================================================
          STICKY TOOLBAR (directly below the navbar at top-[60px])
          Solid surface background, 1px line border, strictly NO blur, NO shadow.
          ========================================================================= */}
      <div className="sticky top-[60px] z-30 bg-surface border-b border-line">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
          {/* Main Controls Row */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="h-10 px-3 bg-paper rounded-[6px] border border-line flex items-center transition-colors focus-within:border-campus-green focus-within:ring-2 focus-within:ring-campus-green focus-within:ring-offset-2">
                <Search className="w-4 h-4 text-ink-muted shrink-0 mr-2" strokeWidth={1.5} />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateParams({ q: localSearch.trim() || null });
                    }
                  }}
                  placeholder="Search keywords, items, or LF code..."
                  className="w-full text-[14px] text-ink placeholder:text-ink-muted/70 bg-transparent outline-none"
                />
                {localSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setLocalSearch("");
                      updateParams({ q: null });
                    }}
                    aria-label="Clear search text"
                    className="p-1 text-ink-muted hover:text-ink rounded-[4px] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>

            {/* Desktop Filter Row: Status Segmented Control + Location + Date + Sort + View */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              {/* Status Segmented Control (All / Lost / Found) with sliding pill via layoutId */}
              <div className="h-10 p-1 bg-paper border border-line rounded-[6px] flex items-center shrink-0 select-none">
                {(["all", "lost", "found"] as StatusFilter[]).map((st) => {
                  const isActive = statusFilter === st;
                  const label = st === "all" ? "All" : st === "lost" ? "Lost" : "Found";
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => updateParams({ status: st === "all" ? null : st })}
                      className={cn(
                        "relative px-3 py-1 text-[13px] font-medium rounded-[4px] transition-colors outline-none cursor-pointer",
                        isActive ? "text-campus-green font-semibold" : "text-ink-muted hover:text-ink"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="status-segmented-pill"
                          transition={springs.snappy}
                          className="absolute inset-0 bg-surface border border-line rounded-[4px] shadow-subtle"
                        />
                      )}
                      <span className="relative z-10">{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Campus Building Select (Desktop) */}
              <div className="hidden lg:block shrink-0">
                <select
                  value={buildingFilter}
                  onChange={(e) => updateParams({ building: e.target.value })}
                  aria-label="Filter by location"
                  className="h-10 px-3 text-[13px] font-medium text-ink bg-paper border border-line rounded-[6px] outline-none cursor-pointer hover:border-campus-green focus-visible:ring-2 focus-visible:ring-campus-green"
                >
                  <option value="all">All buildings</option>
                  {collegeConfig.buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter (Desktop) */}
              <div className="hidden lg:block shrink-0">
                <select
                  value={dateFilter}
                  onChange={(e) => updateParams({ date: e.target.value })}
                  aria-label="Filter by date range"
                  className="h-10 px-3 text-[13px] font-medium text-ink bg-paper border border-line rounded-[6px] outline-none cursor-pointer hover:border-campus-green focus-visible:ring-2 focus-visible:ring-campus-green"
                >
                  <option value="any">Any time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                </select>
              </div>

              {/* Sort Filter (Desktop) */}
              <div className="hidden lg:block shrink-0">
                <select
                  value={sortFilter}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                  aria-label="Sort property"
                  className="h-10 px-3 text-[13px] font-medium text-ink bg-paper border border-line rounded-[6px] outline-none cursor-pointer hover:border-campus-green focus-visible:ring-2 focus-visible:ring-campus-green"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>

              {/* Mobile Filter Sheet Trigger Button */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden h-10 px-3 text-[13px] font-medium bg-paper border border-line rounded-[6px] text-ink hover:bg-surface flex items-center gap-1.5 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-green"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-campus-green" strokeWidth={1.5} />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-green-tint text-campus-green text-[11px] font-bold flex items-center justify-center border border-[#B8D6CB]">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* View Toggle (Grid vs List) with sliding pill indicator via layoutId */}
              <div className="h-10 p-1 bg-paper border border-line rounded-[6px] flex items-center shrink-0 select-none ml-auto">
                <button
                  type="button"
                  onClick={() => updateParams({ view: "grid" })}
                  aria-label="Grid view"
                  aria-pressed={viewMode === "grid"}
                  className={cn(
                    "relative p-1.5 rounded-[4px] transition-colors outline-none cursor-pointer",
                    viewMode === "grid" ? "text-campus-green" : "text-ink-muted hover:text-ink"
                  )}
                >
                  {viewMode === "grid" && (
                    <motion.div
                      layoutId="view-toggle-indicator"
                      transition={springs.snappy}
                      className="absolute inset-0 bg-surface border border-line rounded-[4px] shadow-subtle"
                    />
                  )}
                  <LayoutGrid className="w-4 h-4 relative z-10" strokeWidth={1.5} />
                </button>

                <button
                  type="button"
                  onClick={() => updateParams({ view: "list" })}
                  aria-label="List view"
                  aria-pressed={viewMode === "list"}
                  className={cn(
                    "relative p-1.5 rounded-[4px] transition-colors outline-none cursor-pointer",
                    viewMode === "list" ? "text-campus-green" : "text-ink-muted hover:text-ink"
                  )}
                >
                  {viewMode === "list" && (
                    <motion.div
                      layoutId="view-toggle-indicator"
                      transition={springs.snappy}
                      className="absolute inset-0 bg-surface border border-line rounded-[4px] shadow-subtle"
                    />
                  )}
                  <List className="w-4 h-4 relative z-10" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Categories Multi-Select Chips Row */}
          <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
            <span className="text-[12px] font-semibold text-ink-muted mr-2 shrink-0">
              Categories:
            </span>
            {collegeConfig.categories.map((c) => {
              const isSelected = selectedCategories.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCategory(c.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    "px-2.5 py-1 text-[12px] font-medium rounded-[6px] border select-none transition-colors shrink-0 cursor-pointer",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-green",
                    isSelected
                      ? "bg-green-tint text-campus-green border-[#B8D6CB] font-semibold"
                      : "bg-paper text-ink border-line hover:border-campus-green"
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Active Filters Removable Chips Bar (scale 0.9->1 + opacity, siblings glide via layout) */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap items-center gap-2 pt-2 border-t border-line text-[12px] overflow-hidden"
              >
                <span className="text-ink-muted font-medium">Active filters:</span>

                {searchQuery && (
                  <motion.span
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={springs.soft}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-paper border border-line text-ink font-medium"
                  >
                    <span>Search: "{searchQuery}"</span>
                    <button
                      type="button"
                      onClick={() => updateParams({ q: null })}
                      aria-label="Remove search filter"
                      className="text-ink-muted hover:text-ink cursor-pointer"
                    >
                      <X className="w-3 h-3" strokeWidth={1.5} />
                    </button>
                  </motion.span>
                )}

                {statusFilter !== "all" && (
                  <motion.span
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={springs.soft}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-paper border border-line text-ink font-medium capitalize"
                  >
                    <span>Status: {statusFilter}</span>
                    <button
                      type="button"
                      onClick={() => updateParams({ status: null })}
                      aria-label="Remove status filter"
                      className="text-ink-muted hover:text-ink cursor-pointer"
                    >
                      <X className="w-3 h-3" strokeWidth={1.5} />
                    </button>
                  </motion.span>
                )}

                {selectedCategories.map((catId) => {
                  const cat = collegeConfig.categories.find((c) => c.id === catId);
                  return (
                    <motion.span
                      key={catId}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={springs.soft}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-green-tint border border-[#B8D6CB] text-campus-green font-medium"
                    >
                      <span>{cat?.label || catId}</span>
                      <button
                        type="button"
                        onClick={() => toggleCategory(catId)}
                        aria-label={`Remove ${cat?.label || catId} category filter`}
                        className="text-campus-green hover:opacity-75 cursor-pointer"
                      >
                        <X className="w-3 h-3" strokeWidth={1.5} />
                      </button>
                    </motion.span>
                  );
                })}

                {buildingFilter !== "all" && (
                  <motion.span
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={springs.soft}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-paper border border-line text-ink font-medium"
                  >
                    <span>Location: {collegeConfig.buildings.find((b) => b.id === buildingFilter)?.name || buildingFilter}</span>
                    <button
                      type="button"
                      onClick={() => updateParams({ building: null })}
                      aria-label="Remove building filter"
                      className="text-ink-muted hover:text-ink cursor-pointer"
                    >
                      <X className="w-3 h-3" strokeWidth={1.5} />
                    </button>
                  </motion.span>
                )}

                {dateFilter !== "any" && (
                  <motion.span
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={springs.soft}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-paper border border-line text-ink font-medium"
                  >
                    <span>Date: {dateLabels[dateFilter]}</span>
                    <button
                      type="button"
                      onClick={() => updateParams({ date: null })}
                      aria-label="Remove date filter"
                      className="text-ink-muted hover:text-ink cursor-pointer"
                    >
                      <X className="w-3 h-3" strokeWidth={1.5} />
                    </button>
                  </motion.span>
                )}

                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-campus-green hover:underline font-semibold ml-2 cursor-pointer"
                >
                  Clear all
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* =========================================================================
          REALTIME NEW ITEM PILL
          Slides down from toolbar when matching new item arrives without shifting grid
          ========================================================================= */}
      <AnimatePresence>
        {pendingNewItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={springs.snappy}
            className="sticky top-[136px] z-20 flex justify-center py-2"
          >
            <button
              type="button"
              onClick={handleApplyPendingItems}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-campus-green text-campus-green text-[13px] font-medium hover:bg-green-tint active:scale-98 transition-colors cursor-pointer shadow-subtle"
              data-testid="realtime-browse-pill"
            >
              <span className="w-2 h-2 rounded-full bg-campus-green animate-pulse" />
              <span>
                {pendingNewItems.length} {pendingNewItems.length === 1 ? "new item" : "new items"}. Show
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          RESULTS SECTION
          ========================================================================= */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Results Header with AnimatedNumber */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-[18px] font-semibold text-ink flex items-center">
              <AnimatedNumber value={totalCount} />
              <span className="font-normal text-ink-muted ml-1.5">
                {" "}{totalCount === 1 ? "item" : "items"}
              </span>
            </h1>
          </div>
          <span className="text-[13px] text-ink-muted hidden sm:inline-block">
            Vault Intake Registry · Central Library Room 104
          </span>
        </div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div
            data-testid="loading-skeletons"
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
                : "flex flex-col space-y-3"
            )}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "bg-surface border border-line rounded-[12px] p-3.5 shadow-subtle space-y-3",
                  viewMode === "list" && "flex items-center gap-4 space-y-0"
                )}
              >
                <Skeleton
                  shape="rect"
                  className={cn(
                    viewMode === "grid" ? "w-full aspect-[4/3] rounded-[8px]" : "w-28 h-20 rounded-[6px] shrink-0"
                  )}
                />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-line rounded-[12px] p-8 sm:p-12 text-center max-w-lg mx-auto space-y-5 shadow-subtle my-8"
          >
            <div className="w-12 h-12 rounded-full bg-paper border border-line flex items-center justify-center mx-auto text-ink-muted">
              <FileQuestion className="w-6 h-6" strokeWidth={1.5} />
            </div>

            <div className="space-y-2">
              <h3 className="text-[18px] font-semibold text-ink">
                No items match these filters.
              </h3>
              <p className="text-[14px] text-ink-muted leading-relaxed">
                Check for spelling variations, remove active category filters, or broaden the date range.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => updateParams({ date: "any" })}
                leftIcon={<RotateCcw className="w-4 h-4" strokeWidth={1.5} />}
              >
                Widen the date range
              </Button>
              <Button
                data-testid="empty-report-btn"
                variant="primary"
                size="md"
                onClick={() =>
                  navigate(`/report?title=${encodeURIComponent(searchQuery)}`)
                }
              >
                Report this item as lost
              </Button>
            </div>
          </motion.div>
        ) : (
          /* Results Layout Animation inside AnimatePresence mode="popLayout" */
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5"
                : "flex flex-col space-y-3"
            )}
          >
            <AnimatePresence mode="popLayout">
              {items.map((item, idx) => {
                const isFirstNew = idx === prevLimitRef.current;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{
                      opacity: 0,
                      scale: 0.96,
                      transition: { duration: 0.15 },
                    }}
                    transition={{
                      ...springs.soft,
                      delay: Math.min(idx, 12) * 0.02,
                    }}
                    ref={
                      isFirstNew
                        ? (el) => {
                            firstNewCardRef.current = el;
                          }
                        : undefined
                    }
                    tabIndex={isFirstNew ? -1 : undefined}
                    className="outline-none"
                  >
                    <ItemCard item={item} viewMode={viewMode} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Load More Button (No infinite scroll) */}
        {!isLoading && items.length < totalCount && (
          <div className="pt-8 text-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setDisplayLimit((prev) => prev + PAGE_SIZE)}
              className="min-w-[200px]"
            >
              Load more items ({totalCount - items.length} remaining)
            </Button>
          </div>
        )}
      </div>

      {/* =========================================================================
          MOBILE BOTTOM FILTER SHEET
          Drag-to-dismiss with sticky bottom "Show 42 items" button updating live.
          ========================================================================= */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Flat neutral backdrop - strictly NO blur */}
            <motion.div
              variants={backdropFadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-[#1A2220]/45"
            />

            {/* Bottom Sheet Container with Drag handle */}
            <motion.div
              variants={slideSheetBottomVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_e, info) => {
                if (info.offset.y > 100) {
                  setMobileFilterOpen(false);
                }
              }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-surface rounded-t-[16px] border-t border-line shadow-elevated flex flex-col overflow-hidden"
            >
              {/* Drag Handle Bar */}
              <div className="pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing">
                <div className="w-10 h-1 rounded-full bg-line" />
              </div>

              {/* Sheet Header */}
              <div className="px-5 py-3 border-b border-line flex items-center justify-between">
                <div>
                  <h3 className="text-[17px] font-semibold text-ink">Filters</h3>
                  <p className="text-[12px] text-ink-muted">Refine property intake catalog</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1.5 rounded-[6px] text-ink-muted hover:text-ink hover:bg-paper"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Sheet Body (Scrollable) */}
              <div className="px-5 py-4 overflow-y-auto space-y-6 flex-1 text-ink">
                {/* Status Filter */}
                <div className="space-y-2">
                  <span className="text-[13px] font-semibold text-ink block">Status</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(["all", "lost", "found"] as StatusFilter[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateParams({ status: st === "all" ? null : st })}
                        className={cn(
                          "h-10 px-3 text-[13px] font-medium rounded-[6px] border text-center transition-colors capitalize",
                          statusFilter === st
                            ? "bg-green-tint text-campus-green border-[#B8D6CB] font-semibold"
                            : "bg-paper text-ink border-line"
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories Multi-Select */}
                <div className="space-y-2.5">
                  <span className="text-[13px] font-semibold text-ink block">Categories</span>
                  <div className="flex flex-wrap gap-2">
                    {collegeConfig.categories.map((c) => {
                      const isSelected = selectedCategories.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => toggleCategory(c.id)}
                          className={cn(
                            "px-3 py-1.5 text-[13px] font-medium rounded-[6px] border transition-colors",
                            isSelected
                              ? "bg-green-tint text-campus-green border-[#B8D6CB] font-semibold"
                              : "bg-paper text-ink border-line"
                          )}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Campus Building Selector */}
                <div className="space-y-2">
                  <span className="text-[13px] font-semibold text-ink block">Campus location</span>
                  <select
                    value={buildingFilter}
                    onChange={(e) => updateParams({ building: e.target.value })}
                    className="w-full h-11 px-3 text-[14px] bg-paper border border-line rounded-[6px] text-ink outline-none"
                  >
                    <option value="all">All campus buildings</option>
                    {collegeConfig.buildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Filter Radio/Buttons */}
                <div className="space-y-2">
                  <span className="text-[13px] font-semibold text-ink block">Date range</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(["any", "today", "week", "month"] as DateFilter[]).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => updateParams({ date: d })}
                        className={cn(
                          "h-10 px-3 text-[13px] font-medium rounded-[6px] border text-center transition-colors",
                          dateFilter === d
                            ? "bg-green-tint text-campus-green border-[#B8D6CB] font-semibold"
                            : "bg-paper text-ink border-line"
                        )}
                      >
                        {dateLabels[d]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Option */}
                <div className="space-y-2">
                  <span className="text-[13px] font-semibold text-ink block">Sort order</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateParams({ sort: "newest" })}
                      className={cn(
                        "h-10 px-3 text-[13px] font-medium rounded-[6px] border text-center transition-colors",
                        sortFilter === "newest"
                          ? "bg-green-tint text-campus-green border-[#B8D6CB] font-semibold"
                          : "bg-paper text-ink border-line"
                      )}
                    >
                      Newest first
                    </button>
                    <button
                      type="button"
                      onClick={() => updateParams({ sort: "oldest" })}
                      className={cn(
                        "h-10 px-3 text-[13px] font-medium rounded-[6px] border text-center transition-colors",
                        sortFilter === "oldest"
                          ? "bg-green-tint text-campus-green border-[#B8D6CB] font-semibold"
                          : "bg-paper text-ink border-line"
                      )}
                    >
                      Oldest first
                    </button>
                  </div>
                </div>
              </div>

              {/* Sheet Sticky Bottom Action: "Show 42 items" (number updates live) */}
              <div className="p-4 border-t border-line bg-surface sticky bottom-0">
                <Button
                  data-testid="mobile-sheet-apply-btn"
                  variant="primary"
                  className="w-full justify-center h-12 text-[15px]"
                  onClick={() => setMobileFilterOpen(false)}
                >
                  <span>Show </span>
                  <AnimatedNumber value={totalCount} className="mx-1" />
                  <span>{totalCount === 1 ? "item" : "items"}</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
