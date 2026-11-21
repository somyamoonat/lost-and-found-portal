import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  Calculator,
  Key,
  Backpack,
  Coffee,
  CreditCard,
  Glasses,
  BookOpen,
  Umbrella,
  Package,
} from "lucide-react";
import type { Item } from "@/data/items";
import { StatusChip } from "@/motion/StatusChip";
import { cn } from "@/lib/utils";

interface ItemCardProps {
  item: Item;
  viewMode?: "grid" | "list";
  className?: string;
}

/**
 * Returns an appropriate Lucide icon and category color block
 * when photo is null (avoiding any hotlinked imagery).
 */
export const getCategoryIcon = (category: string) => {
  switch (category) {
    case "electronics":
      return <Calculator className="w-7 h-7 sm:w-8 sm:h-8 text-campus-green" strokeWidth={1.5} />;
    case "keys":
      return <Key className="w-7 h-7 sm:w-8 sm:h-8 text-campus-green" strokeWidth={1.5} />;
    case "bags-backpacks":
      return <Backpack className="w-7 h-7 sm:w-8 sm:h-8 text-campus-green" strokeWidth={1.5} />;
    case "wallets-ids":
      return <CreditCard className="w-7 h-7 sm:w-8 sm:h-8 text-campus-green" strokeWidth={1.5} />;
    case "bottles-mugs":
      return <Coffee className="w-7 h-7 sm:w-8 sm:h-8 text-campus-green" strokeWidth={1.5} />;
    case "books-stationery":
      return <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-campus-green" strokeWidth={1.5} />;
    case "eyewear":
      return <Glasses className="w-7 h-7 sm:w-8 sm:h-8 text-campus-green" strokeWidth={1.5} />;
    case "other":
      return <Umbrella className="w-7 h-7 sm:w-8 sm:h-8 text-campus-green" strokeWidth={1.5} />;
    default:
      return <Package className="w-7 h-7 sm:w-8 sm:h-8 text-campus-green" strokeWidth={1.5} />;
  }
};

/**
 * ItemCard Component
 * - Grid mode: 4:3 image area, truncated title, location/time, StatusChip, mono code, corner arrow
 * - List mode: horizontal row, compact 4:3 image block, title/description, StatusChip, mono code
 * - Morphable via layout / layoutId
 * - Hover: image scales to 1.04 inside overflow-hidden mask over 0.5s, border darkens, corner arrow shifts 3px
 * - Press: scale 0.99
 * - layoutId={`item-image-${id}`} for shared element transition to detail page
 */
export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  viewMode = "grid",
  className,
}) => {
  const isList = viewMode === "list";

  if (isList) {
    return (
      <Link
        to={`/items/${item.id}`}
        className="block group outline-none select-none w-full"
      >
        <motion.div
          layout
          layoutId={`item-card-${item.id}`}
          whileTap={{ scale: 0.99 }}
          className={cn(
            "bg-surface border border-line rounded-[12px] p-3.5 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-300",
            "group-hover:border-[#5C6762] group-focus-visible:border-campus-green group-focus-visible:ring-2 group-focus-visible:ring-campus-green",
            className
          )}
        >
          {/* Left: Compact Image/Category area */}
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="relative w-24 sm:w-28 aspect-[4/3] rounded-[6px] overflow-hidden bg-paper border border-line/60 shrink-0">
              <motion.div
                layoutId={`item-image-${item.id}`}
                className="w-full h-full flex items-center justify-center bg-[#ECEFEA]"
              >
                {item.photo ? (
                  <img
                    src={item.photo}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center">
                    {getCategoryIcon(item.category)}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Details */}
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-ink bg-paper px-1.5 py-0.5 rounded-[4px] border border-line shrink-0">
                  {item.refCode}
                </span>
                <span className="text-[12px] text-ink-muted capitalize truncate">
                  {item.category.replace("-", " ")}
                </span>
              </div>

              <h4 className="text-[15px] font-semibold text-ink leading-snug truncate group-hover:text-campus-green transition-colors">
                {item.title}
              </h4>

              <p className="text-[12px] text-ink-muted truncate">
                {item.location} · {item.timeAgo}
              </p>
            </div>
          </div>

          {/* Right: Status and Action */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-line">
            <StatusChip status={item.status} />
            <div className="flex items-center gap-1 text-[12px] text-campus-green font-medium">
              <span>View claim</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-[3px] group-hover:-translate-y-[3px]" strokeWidth={1.5} />
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  // Grid view mode (default)
  return (
    <Link to={`/items/${item.id}`} className="block group outline-none select-none h-full">
      <motion.div
        layout
        layoutId={`item-card-${item.id}`}
        whileTap={{ scale: 0.99 }}
        className={cn(
          "bg-surface border border-line rounded-[12px] p-3.5 shadow-subtle flex flex-col justify-between h-full transition-colors duration-300",
          "group-hover:border-[#5C6762] group-focus-visible:border-campus-green group-focus-visible:ring-2 group-focus-visible:ring-campus-green",
          className
        )}
      >
        {/* Top: 4:3 Image Area with Masked Hover Scale */}
        <div className="relative w-full aspect-[4/3] rounded-[8px] overflow-hidden bg-paper border border-line/60 mb-3">
          <motion.div
            layoutId={`item-image-${item.id}`}
            className="w-full h-full flex items-center justify-center bg-[#ECEFEA]"
          >
            {item.photo ? (
              <img
                src={item.photo}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-1.5 text-center px-4">
                <div className="w-12 h-12 rounded-[6px] bg-surface border border-line flex items-center justify-center">
                  {getCategoryIcon(item.category)}
                </div>
                <span className="font-mono text-[11px] font-semibold text-ink-muted">
                  {item.refCode}
                </span>
              </div>
            )}
          </motion.div>

          {/* Reference Tag Chip pinned inside image corner */}
          <div className="absolute top-2 left-2 pointer-events-none">
            <span className="font-mono text-[11px] font-bold text-ink bg-surface/95 border border-line px-1.5 py-0.5 rounded-[4px] shadow-subtle">
              {item.refCode}
            </span>
          </div>

          {/* Corner Interactive Arrow */}
          <div className="absolute top-2 right-2 w-6 h-6 rounded-[4px] bg-surface/95 border border-line flex items-center justify-center text-ink pointer-events-none transition-transform duration-300 group-hover:translate-x-[3px] group-hover:-translate-y-[3px]">
            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </div>
        </div>

        {/* Content Details */}
        <div className="space-y-2 flex-1 flex flex-col justify-between">
          <div>
            <h4 className="text-[15px] font-semibold text-ink leading-tight truncate group-hover:text-campus-green transition-colors">
              {item.title}
            </h4>
            <p className="text-[12px] text-ink-muted truncate mt-1">
              {item.location} · {item.timeAgo}
            </p>
          </div>

          <div className="pt-2 border-t border-line flex items-center justify-between">
            <StatusChip status={item.status} />
            <span className="text-[11px] text-ink-muted capitalize">
              {item.category.replace("-", " ")}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
