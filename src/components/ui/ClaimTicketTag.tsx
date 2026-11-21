import React from "react";
import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClaimTicketTagProps {
  code: string;
  itemTitle?: string;
  loggedDate?: string;
  buildingCode?: string;
  variant?: "badge" | "ticket";
  className?: string;
}

/**
 * ClaimTicketTag:
 * The single designated place where tag amber (#E3A92F) and IBM Plex Mono are used.
 * Models an authentic institutional physical baggage/luggage lost property tag.
 */
export const ClaimTicketTag: React.FC<ClaimTicketTagProps> = ({
  code,
  itemTitle,
  loggedDate,
  buildingCode,
  variant = "badge",
  className,
}) => {
  if (variant === "badge") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 px-2.5 py-1 rounded-[6px] border border-[#E3A92F]/40 bg-[#FDF8EE] text-ink select-none",
          className
        )}
      >
        <span className="w-2 h-2 rounded-full bg-tag-amber shrink-0" />
        <span className="text-[12px] text-ink-muted font-medium">Claim reference</span>
        <span className="font-mono text-[13px] font-semibold text-ink tracking-tight bg-surface px-1.5 py-0.5 rounded-[4px] border border-line">
          {code}
        </span>
      </div>
    );
  }

  // Full ticket stub motif
  return (
    <div
      className={cn(
        "relative bg-[#FAF5EB] border border-[#E3A92F]/50 rounded-[8px] p-4 text-ink shadow-subtle overflow-hidden",
        "before:content-[''] before:absolute before:top-0 before:bottom-0 before:left-0 before:w-1.5 before:bg-tag-amber",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-surface border border-[#E3A92F]/60 flex items-center justify-center text-tag-amber">
            <Tag className="w-3.5 h-3.5" strokeWidth={1.5} />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block">
              Physical claim tag
            </span>
            {itemTitle && (
              <h4 className="text-[15px] font-semibold text-ink leading-tight mt-0.5">
                {itemTitle}
              </h4>
            )}
          </div>
        </div>

        {/* Reference code in IBM Plex Mono */}
        <div className="text-right">
          <span className="block text-[11px] text-ink-muted">Reference</span>
          <span className="font-mono text-[16px] font-bold text-ink tracking-tight bg-surface px-2 py-0.5 rounded-[4px] border border-line inline-block mt-0.5">
            {code}
          </span>
        </div>
      </div>

      {(loggedDate || buildingCode) && (
        <div className="mt-3 pt-2.5 border-t border-[#E3A92F]/20 flex items-center justify-between text-[12px] text-ink-muted">
          {buildingCode && <span>Vault intake: {buildingCode}</span>}
          {loggedDate && <span>Registered: {loggedDate}</span>}
        </div>
      )}
    </div>
  );
};
