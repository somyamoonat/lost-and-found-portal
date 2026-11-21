import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  ArrowRight,
  Plus,
} from "lucide-react";
import { collegeConfig } from "@/config/college";
import { api } from "@/data/api";
import { type Item } from "@/data/items";
import { subscribeToNewItems } from "@/data/realtime";
import { ItemCard, getCategoryIcon } from "@/components/ui/ItemCard";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CollectionDesk } from "@/components/home/CollectionDesk";
import { Skeleton } from "@/motion/Skeleton";
import { Reveal } from "@/motion/Reveal";
import { easings } from "@/motion/tokens";

const quickPicks = [
  { label: "ID card", query: "ID card" },
  { label: "Keys", query: "Keys" },
  { label: "Phone", query: "Phone" },
  { label: "Bag", query: "Backpack" },
  { label: "Calculator", query: "Calculator" },
  { label: "Water bottle", query: "Water bottle" },
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
                      duration: 0.45,
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
                      duration: 0.45,
                      ease: easings.out,
                      delay: 0.08,
                    }}
                    className="type-display text-ink"
                  >
                    Check if it's already been handed in.
                  </motion.h1>
                </div>
              </div>

              {/* 56px Search Input with attached Category Select */}
              <motion.form
                onSubmit={handleSearchSubmit}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  ease: easings.out,
                  delay: 0.22,
                }}
                className="relative"
              >
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
                    placeholder="Search by keywords, brand, or code (e.g. Casio, blue keys)"
                    className="flex-1 h-full px-2 text-[15px] text-ink placeholder:text-ink-muted/70 bg-transparent outline-none min-w-0"
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
                      className="h-11 px-4 bg-campus-green text-surface rounded-[6px] text-[14px] font-medium hover:bg-[#16493C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-green cursor-pointer shrink-0"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </motion.form>

              {/* Quick-Pick Chips (stagger in after search box) */}
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
                className="flex flex-wrap items-center gap-2 pt-1"
              >
                <span className="text-[13px] text-ink-muted font-medium mr-1">
                  Common articles:
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
                        transition: { duration: 0.25, ease: easings.out },
                      },
                    }}
                    onClick={() => handleQuickPick(chip.query)}
                    className="px-2.5 py-1 text-[13px] font-medium bg-paper text-ink border border-line rounded-[6px] hover:border-campus-green hover:text-campus-green transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-green"
                  >
                    {chip.label}
                  </motion.button>
                ))}
              </motion.div>
            </div>

            {/* Right 5 Columns: "Handed in today" Live Panel */}
            <div className="lg:col-span-5">
              <div className="bg-paper border border-line rounded-[12px] p-5 shadow-subtle space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-campus-green animate-pulse" />
                    <h3 className="text-[15px] font-semibold text-ink leading-tight">
                      Handed in today
                    </h3>
                  </div>

                  {/* Intake simulator button to test layout animation & amber outline */}
                  <button
                    type="button"
                    onClick={handleSimulateNewIntake}
                    title="Simulate a new intake arriving at the desk"
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-campus-green hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Simulate intake</span>
                  </button>
                </div>

                {/* 4 Rows sliding in 0.07s apart after headline settles */}
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
                            duration: 0.35,
                            ease: easings.out,
                            delay: idx < 4 && !newlyAddedId ? 0.48 + idx * 0.07 : 0,
                            outlineColor: { duration: 1.2, ease: "easeOut" },
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
                            <div className="w-10 h-10 rounded-[6px] bg-[#ECEFEA] border border-line/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              {getCategoryIcon(item.category)}
                            </div>

                            {/* Title & Location */}
                            <div className="min-w-0 flex-1">
                              <h4 className="text-[14px] font-semibold text-ink truncate leading-tight group-hover:text-campus-green transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-[12px] text-ink-muted truncate mt-0.5">
                                {item.location}
                              </p>
                            </div>
                          </Link>

                          {/* Time Ago & Ref Code */}
                          <div className="shrink-0 text-right">
                            <span className="font-mono text-[11px] font-semibold text-ink block bg-paper px-1.5 py-0.5 rounded-[4px] border border-line">
                              {item.refCode}
                            </span>
                            <span className="text-[11px] text-ink-muted block mt-0.5">
                              {item.timeAgo}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                <div className="pt-2 text-center">
                  <Link
                    to="/browse"
                    className="text-[13px] font-medium text-campus-green hover:underline inline-flex items-center gap-1"
                  >
                    <span>View all intake property</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: RECENTLY FOUND
          8 ItemCards in 4-column grid (2 on mobile). Grid group fades in once on scroll.
          ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <h2 className="type-h2 text-ink">Recently found property</h2>
            <p className="type-small text-ink-muted mt-1">
              Articles located on campus and verified in the central intake repository.
            </p>
          </div>
          <Link
            to="/browse"
            className="text-[14px] font-medium text-campus-green hover:underline inline-flex items-center gap-1 shrink-0"
          >
            <span>See all items</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </div>

        {/* The grid group fades in once on scroll, not each individual card */}
        <Reveal yOffset={16}>
          {loadingRecent ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-surface border border-line rounded-[12px] p-3.5 shadow-subtle space-y-3"
                >
                  <Skeleton shape="rect" className="w-full aspect-[4/3] rounded-[8px]" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="pt-2 border-t border-line flex justify-between">
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {recentItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
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
