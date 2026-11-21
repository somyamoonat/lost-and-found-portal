import React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { slideSheetRightVariants, backdropFadeVariants } from "./variants";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  trigger?: React.ReactNode;
  side?: "right";
}

/**
 * Institutional Sheet / Drawer:
 * - Radix Dialog foundation with side slide drawer motion
 * - Flat overlay (no blur)
 * - 12px radius on interior boundary
 * - Useful for filters, desk hours, or detailed item inspection
 */
export const Sheet: React.FC<SheetProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  trigger,
}) => {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
      <AnimatePresence>
        {open && (
          <RadixDialog.Portal forceMount>
            <RadixDialog.Overlay asChild>
              <motion.div
                variants={backdropFadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="fixed inset-0 z-50 bg-[#1A2220]/45"
              />
            </RadixDialog.Overlay>

            <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
              <RadixDialog.Content asChild>
                <motion.div
                  variants={slideSheetRightVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={cn(
                    "pointer-events-auto h-full w-full sm:max-w-md bg-surface border-l border-line p-6 shadow-elevated text-ink outline-none overflow-y-auto flex flex-col",
                    "sm:rounded-l-[12px]",
                    "focus-visible:ring-2 focus-visible:ring-campus-green"
                  )}
                >
                  <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-line">
                    <div>
                      <RadixDialog.Title className="text-[20px] font-semibold text-ink leading-snug">
                        {title}
                      </RadixDialog.Title>
                      {description && (
                        <RadixDialog.Description className="text-[14px] text-ink-muted leading-relaxed mt-1">
                          {description}
                        </RadixDialog.Description>
                      )}
                    </div>
                    <RadixDialog.Close asChild>
                      <button
                        type="button"
                        aria-label="Close sheet"
                        className="text-ink-muted hover:text-ink p-1.5 rounded-[6px] hover:bg-paper transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-green"
                      >
                        <X className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </RadixDialog.Close>
                  </div>

                  <div className="flex-1 py-2">{children}</div>
                </motion.div>
              </RadixDialog.Content>
            </div>
          </RadixDialog.Portal>
        )}
      </AnimatePresence>
    </RadixDialog.Root>
  );
};
