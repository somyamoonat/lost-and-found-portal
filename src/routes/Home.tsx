import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  ArrowRight,
  Plus,
  ChevronRight,
  MapPin,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { collegeConfig } from "@/config/college";
import { api } from "@/data/api";
import { type Item } from "@/data/items";
import { subscribeToNewItems } from "@/data/realtime";
import { getCategoryIcon } from "@/components/ui/ItemCard";
import { StatusChip } from "@/motion/StatusChip";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CollectionDesk } from "@/components/home/CollectionDesk";
import { Skeleton } from "@/motion/Skeleton";
import { Reveal } from "@/motion/Reveal";
import { easings, durations, delays } from "@/motion/tokens";

const quickPicks = [
  { label: "Hostel keys", count: 12, query: "Keys" },
  { label: "Student IDs", count: 8, query: "ID card" },
  { label: "Phones & earbuds", count: 15, query: "Phone" },
  { label: "Backpacks", count: 7, query: "Backpack" },
  { label: "Calculators", count: 6, query: "Calculator" },
  { label: "Water bottles", count: 18, query: "Water bottle" },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Live "Handed in today" panel state
  const [todayItems, setTodayItems] = useState<Item[]>([]);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);

  // Recently found items state
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Initial data loading
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [today, recent] = await Promise.all([
          api.getHandedInToday(),
          api.getRecentFound(),
        ]);
        if (isMounted) {
          setTodayItems(today);
          setRecentItems(recent);
          setLoadingRecent(false);
        }
      } catch (err) {
        console.error("Failed to load home page data:", err);
        if (isMounted) {
          setLoadingRecent(false);
          setHasError(true);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Realtime: subscribe to items inserts. New item animates into "Handed in today"
  useEffect(() => {
    const unsubscribe = subscribeToNewItems((newItem: Item) => {
      if (newItem.type === "found") {
        setNewlyAddedId(newItem.id);
        setTodayItems((prev) => [newItem, ...prev.filter((i) => i.id !== newItem.id).slice(0, 3)]);
        setTimeout(() => {
          setNewlyAddedId(null);
        }, 1200);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    navigate(`/browse?${params.toString()}`);
  };

  const handleQuickPick = (query: string) => {
    setSearchQuery(query);
    navigate(`/browse?q=${encodeURIComponent(query)}`);
  };

  // Simulate new item intake for testing layout glide animation and 1.2s amber outline
  const handleSimulateNewIntake = () => {
    const randomNum = Math.floor(Math.random() * 800) + 2100;
    const newItem: Item = {
      id: String(randomNum),
      refCode: `LF-${randomNum}`,
      type: "found",
      title: "Stainless travel tumbler (matte black)",
      category: "bottles-mugs",
      location: "Main Library & Research Commons",
      buildingCode: "MLC",
      occurredAt: new Date().toISOString(),
      status: "open",
      photo: null,
      description: "Just handed in to Room 104 desk personnel.",
      timeAgo: "Just now",
    };

    setNewlyAddedId(newItem.id);
    setTodayItems((prev) => [newItem, ...prev.slice(0, 3)]);

    // 1.2s amber outline fade out
    setTimeout(() => {
      setNewlyAddedId(null);
    }, 1200);
  };

  return (
    <div className="pb-24 space-y-20 sm:space-y-24">
      {/* =========================================================================
          SECTION 1: HERO
          The ONE orchestrated page-load moment on this page. Total sequence < 1.2s.
          ========================================================================= */}
      <section className="border-b border-line bg-surface pt-12 pb-16 sm:pt-16 sm:pb-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
            {/* Left 7 Columns: Masked Headline, 56px Search, Quick-pick Chips */}
            <div className="lg:col-span-7 space-y-6">
              {/* Display Headline with maskedLine (split in 2 lines, 0.08s apart) */}
              <div className="space-y-1">
                {/* Line 1 */}
                <div className="overflow-hidden">
                  <motion.h1
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: durations.page,
                      ease: easings.out,
                      delay: 0.0,
                    }}
                    className="type-display text-ink"
                  >
                    Lost something on campus?
                  </motion.h1>
                </div>

                {/* Line 2 */}
                <div className="overflow-hidden">
                  <motion.h1
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: durations.page,
                      ease: easings.out,
                      delay: delays.headlineStagger,
                    }}
                    className="type-display text-ink"
                  >
                    Check if it's already been handed in.
                  </motion.h1>
                </div>
              </div>

              {/* Institutional Search Inquiry Terminal */}
              <motion.form
                onSubmit={handleSearchSubmit}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: durations.step,
                  ease: easings.out,
                  delay: 0.22,
                }}
                className="space-y-2"
              >
                {/* Terminal Header Bar */}
                <div className="flex items-center justify-between text-[11px] text-ink-muted px-1">
                  <span className="font-medium flex items-center gap-1.5 text-campus-green font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-campus-green" />
                    Intake query terminal
                  </span>
                  <span className="hidden sm:inline font-mono text-[11px] bg-paper px-1.5 py-0.5 rounded border border-line text-ink-muted">
                    Press Enter to search
                  </span>
                </div>

                <div className="h-14 bg-surface rounded-[6px] border border-line shadow-subtle flex items-center transition-colors focus-within:border-campus-green focus-within:ring-2 focus-within:ring-campus-green focus-within:ring-offset-2">
                  {/* Left Search Icon */}
                  <div className="pl-4 pr-2 text-ink-muted shrink-0 pointer-events-none">
                    <Search className="w-5 h-5" strokeWidth={1.5} />
                  </div>

                  {/* Main Text Input */}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by article, brand, location, or LF code..."
                    className="flex-1 h-full px-2 text-[14px] text-ink placeholder:text-ink-muted/70 bg-transparent outline-none min-w-0"
                  />

                  {/* Vertical separator */}
                  <div className="w-[1px] h-7 bg-line shrink-0 hidden sm:block" />

                  {/* Attached Category Select */}
                  <div className="shrink-0 hidden sm:block pr-1">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      aria-label="Filter by category"
                      className="h-10 px-3 text-[13px] font-medium text-ink bg-transparent outline-none cursor-pointer hover:text-campus-green"
                    >
                      <option value="all">All categories</option>
                      {collegeConfig.categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Submit Button */}
                  <div className="pr-1.5 shrink-0">
                    <button
                      type="submit"
                      className="h-11 px-4 bg-campus-green text-surface rounded-[6px] text-[13px] font-medium hover:bg-[#16493C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-green cursor-pointer shrink-0 inline-flex items-center gap-1.5"
                    >
                      <span>Search repository</span>
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </motion.form>

              {/* Common Article Inventory Chips */}
              <motion.div
                initial="initial"
                animate="animate"
                variants={{
                  animate: {
                    transition: {
                      staggerChildren: 0.04,
                      delayChildren: 0.32,
                    },
                  },
                }}
                className="flex flex-wrap items-center gap-2 pt-0.5"
              >
                <span className="text-[12px] text-ink-muted font-medium mr-0.5">
                  Frequent intakes:
                </span>
                {quickPicks.map((chip) => (
                  <motion.button
                    key={chip.label}
                    type="button"
                    variants={{
                      initial: { opacity: 0, y: 6 },
                      animate: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: durations.uiExit, ease: easings.out },
                      },
                    }}
                    onClick={() => handleQuickPick(chip.query)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium bg-surface text-ink border border-line rounded-[6px] hover:border-campus-green hover:text-campus-green transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-green"
                  >
                    <span>{chip.label}</span>
                    <span className="font-mono text-[10px] text-ink-muted bg-paper px-1 py-0.2 rounded border border-line">
                      {chip.count}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            </div>

            {/* Right 5 Columns: Active Custody Manifest Feed */}
            <div className="lg:col-span-5">
              <div className="bg-paper border border-line rounded-[12px] p-4 sm:p-5 shadow-subtle space-y-4">
                <div className="flex items-start justify-between border-b border-line pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-campus-green animate-pulse" />
                      <h3 className="text-[14px] font-semibold text-ink leading-tight uppercase tracking-wide">
                        Live custody manifest
                      </h3>
                    </div>
                    <p className="text-[12px] text-ink-muted mt-0.5">
                      Intake Vault Room 104 · Realtime physical intake
                    </p>
                  </div>

                  {/* Attendant intake test simulator */}
                  <button
                    type="button"
                    onClick={handleSimulateNewIntake}
                    title="Simulate intake arrival at custody desk"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-campus-green bg-green-tint/60 px-2 py-1 rounded-[4px] border border-campus-green/20 hover:bg-green-tint transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-3 h-3" strokeWidth={1.5} />
                    <span>Simulate intake</span>
                  </button>
                </div>

                {/* Rows sliding in after headline settles */}
                <div className="space-y-2.5">
                  <AnimatePresence initial={true}>
                    {todayItems.map((item, idx) => {
                      const isNew = item.id === newlyAddedId;
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: 24 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            outlineColor: isNew ? "#E3A92F" : "transparent",
                          }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{
                            duration: durations.step,
                            ease: easings.out,
                            delay: idx < 4 && !newlyAddedId ? 0.48 + idx * 0.07 : 0,
                            outlineColor: { duration: durations.tagHighlight, ease: easings.out },
                          }}
                          style={{
                            outline: isNew ? "2px solid #E3A92F" : "2px solid transparent",
                          }}
                          className="p-2.5 bg-surface rounded-[8px] border border-line flex items-center justify-between gap-3 shadow-subtle hover:border-[#5C6762] transition-colors"
                        >
                          <Link
                            to={`/items/${item.id}`}
                            className="flex items-center gap-3 min-w-0 flex-1 outline-none group"
                          >
                            {/* Small Category Colour Block with Lucide Icon */}
                            <div className="w-9 h-9 rounded-[6px] bg-[#ECEFEA] border border-line/80 flex items-center justify-center shrink-0 text-ink-muted">
                              {getCategoryIcon(item.category)}
                            </div>

                            {/* Title & Location */}
                            <div className="min-w-0 flex-1">
                              <h4 className="text-[13px] font-semibold text-ink truncate leading-tight group-hover:text-campus-green transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-[11px] text-ink-muted truncate mt-0.5">
                                {item.location}
                              </p>
                            </div>
                          </Link>

                          {/* Time Ago & Ref Code */}
                          <div className="shrink-0 text-right">
                            <span className="font-mono text-[11px] font-bold text-ink block bg-paper px-1.5 py-0.5 rounded-[4px] border border-line">
                              {item.refCode}
                            </span>
                            <span className="text-[10px] text-ink-muted block mt-0.5 font-medium">
                              {item.timeAgo}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                <div className="pt-2 border-t border-line flex items-center justify-between text-[12px]">
                  <span className="text-ink-muted">Vault status: Physical hold</span>
                  <Link
                    to="/browse"
                    className="font-medium text-campus-green hover:underline inline-flex items-center gap-1"
                  >
                    <span>Open full manifest</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: CAMPUS INTAKE REGISTRY & CUSTODY LEDGER
          Editorial asymmetric layout: featured inspection article on left,
          dense tabular intake register on right. Eliminates repetitive card grid.
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line pb-3">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-campus-green font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
              <span>Campus custody intake registry</span>
            </div>
            <h2 className="type-h2 text-ink mt-0.5">Surrendered property ledger</h2>
            <p className="type-small text-ink-muted mt-0.5">
              Articles delivered to campus safety intake desks and secured in the central property vault.
            </p>
          </div>
          <Link
            to="/browse"
            className="text-[14px] font-medium text-campus-green hover:underline inline-flex items-center gap-1 shrink-0 self-start sm:self-auto"
          >
            <span>Search full registry</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </div>

        {/* The section reveals once on scroll */}
        <Reveal yOffset={16}>
          {loadingRecent ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-surface border border-line rounded-[12px] p-5 space-y-4 shadow-subtle">
                <Skeleton shape="rect" className="w-full aspect-[4/3] rounded-[8px]" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full rounded-[6px]" />
              </div>
              <div className="lg:col-span-7 bg-surface border border-line rounded-[12px] divide-y divide-line overflow-hidden shadow-subtle">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <Skeleton className="w-9 h-9 rounded-[6px]" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ) : hasError ? (
            <div className="bg-surface border border-line rounded-[12px] p-8 text-center space-y-3">
              <p className="text-[14px] text-ink-muted">
                Unable to load recent intake property records.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-[13px] text-campus-green font-medium hover:underline cursor-pointer"
              >
                Reload page
              </button>
            </div>
          ) : recentItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 5 cols: Featured Intake Inspection Showcase */}
              {recentItems[0] && (
                <div className="lg:col-span-5 bg-surface border border-line rounded-[12px] p-5 shadow-subtle flex flex-col justify-between space-y-4">
                  <div>
                    {/* Top Stamp Bar */}
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-line text-[12px]">
                      <div className="flex items-center gap-1.5 text-ink-muted font-medium">
                        <Clock className="w-3.5 h-3.5 text-campus-green shrink-0" strokeWidth={1.5} />
                        <span>Surrendered {recentItems[0].timeAgo}</span>
                      </div>
                      <span className="font-mono text-[12px] font-bold text-ink bg-tag-amber/25 text-[#73510A] px-2 py-0.5 rounded-[4px] border border-tag-amber/40">
                        {recentItems[0].refCode}
                      </span>
                    </div>

                    {/* Image / Inspection block */}
                    <div className="relative w-full aspect-[4/3] rounded-[8px] overflow-hidden bg-[#ECEFEA] border border-line/60 my-3.5">
                      {recentItems[0].photo ? (
                        <img
                          src={recentItems[0].photo}
                          alt={recentItems[0].title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-center p-4">
                          <div className="w-14 h-14 rounded-[8px] bg-surface border border-line flex items-center justify-center shadow-subtle text-campus-green">
                            {getCategoryIcon(recentItems[0].category)}
                          </div>
                          <span className="text-[12px] font-medium text-ink-muted capitalize">
                            {recentItems[0].category.replace("-", " ")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <StatusChip status={recentItems[0].status} />
                        <span className="text-[12px] text-ink-muted">Room 104 Vault</span>
                      </div>
                      <h3 className="text-[17px] font-semibold text-ink leading-snug pt-1">
                        {recentItems[0].title}
                      </h3>
                      <p className="text-[13px] text-ink-muted line-clamp-2 leading-relaxed">
                        {recentItems[0].description}
                      </p>
                    </div>

                    {/* Physical custody metadata */}
                    <div className="mt-4 p-3 bg-paper rounded-[6px] border border-line space-y-1.5 text-[12px] text-ink-muted">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-campus-green shrink-0" strokeWidth={1.5} />
                        <span className="truncate">Surrendered at: <strong className="text-ink font-medium">{recentItems[0].location}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-campus-green shrink-0" strokeWidth={1.5} />
                        <span className="truncate">Custody hold: <span className="text-ink font-medium">{recentItems[0].currentlyHeldAt}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/items/${recentItems[0].id}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[6px] bg-campus-green text-surface text-[14px] font-medium hover:bg-[#16473A] transition-colors"
                    >
                      <span>Inspect article and file claim</span>
                      <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                    </Link>
                  </div>
                </div>
              )}

              {/* Right 7 cols: Dense Custody Ledger */}
              <div className="lg:col-span-7 bg-surface border border-line rounded-[12px] overflow-hidden shadow-subtle flex flex-col justify-between">
                <div>
                  <div className="px-4 sm:px-5 py-3 border-b border-line bg-paper/60 flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-ink uppercase tracking-wider">
                      Recent property entries
                    </span>
                    <span className="text-[12px] text-ink-muted">
                      Intake custody queue
                    </span>
                  </div>

                  <div className="divide-y divide-line">
                    {recentItems.slice(1, 6).map((item) => (
                      <Link
                        key={item.id}
                        to={`/items/${item.id}`}
                        className="p-3.5 sm:p-4 flex items-center justify-between gap-3 sm:gap-4 hover:bg-paper/70 transition-colors group"
                      >
                        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                          {/* Ref code tag */}
                          <div className="shrink-0 flex flex-col items-center">
                            <span className="font-mono text-[11px] font-bold text-ink bg-paper px-1.5 py-0.5 rounded-[4px] border border-line">
                              {item.refCode}
                            </span>
                          </div>

                          {/* Category icon */}
                          <div className="w-8 h-8 rounded-[6px] bg-[#ECEFEA] border border-line/70 flex items-center justify-center shrink-0 text-ink-muted">
                            {getCategoryIcon(item.category)}
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <h4 className="text-[14px] font-semibold text-ink truncate group-hover:text-campus-green transition-colors leading-tight">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[12px] text-ink-muted mt-0.5 truncate">
                              <span className="truncate">{item.location}</span>
                              <span className="text-line shrink-0">•</span>
                              <span className="shrink-0">{item.timeAgo}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status chip & arrow */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="hidden sm:block">
                            <StatusChip status={item.status} />
                          </div>
                          <ChevronRight className="w-4 h-4 text-ink-muted group-hover:text-ink group-hover:translate-x-0.5 transition-all" strokeWidth={1.5} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Footer bar */}
                <div className="p-3.5 sm:p-4 border-t border-line bg-paper/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-[13px]">
                  <span className="text-ink-muted text-center sm:text-left">
                    All surrendered articles held under 90-day university retention.
                  </span>
                  <Link
                    to="/browse"
                    className="text-campus-green font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>View all items</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </Reveal>
      </section>

      {/* =========================================================================
          SECTION 3: HOW IT WORKS
          Vertical sequence with drawing 2px scroll line.
          ========================================================================= */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <HowItWorks />
      </div>

      {/* =========================================================================
          SECTION 4: COLLECTION DESK
          Plain bordered panel with live opening status computation and slow pulsing dot.
          ========================================================================= */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <CollectionDesk />
      </div>
    </div>
  );
};
