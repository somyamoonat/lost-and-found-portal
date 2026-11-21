import React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { fadeScaleVariants, backdropFadeVariants } from "./variants";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  trigger?: React.ReactNode;
}

/**
 * Institutional Dialog:
 * - Radix Dialog for uncompromised accessibility & keyboard trapping
 * - AnimatePresence for smooth entry and exit transitions
 * - Flat semi-opaque overlay (NO backdrop blur)
 * - 12px corner radius on card panel
 * - 1px line border, elevated shadow
 */
export const Dialog: React.FC<DialogProps> = ({
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
            {/* Flat neutral backdrop - strictly NO glassmorphism / blur */}
            <RadixDialog.Overlay asChild>
              <motion.div
                variants={backdropFadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="fixed inset-0 z-50 bg-[#1A2220]/45"
              />
            </RadixDialog.Overlay>

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              <RadixDialog.Content asChild>
                <motion.div
                  variants={fadeScaleVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={cn(
                    "relative w-full max-w-lg bg-surface border border-line rounded-[12px] p-6 shadow-elevated text-ink outline-none",
                    "focus-visible:ring-2 focus-visible:ring-campus-green"
                  )}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
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
                        aria-label="Close dialog"
                        className="text-ink-muted hover:text-ink p-1.5 rounded-[6px] hover:bg-paper transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-campus-green"
                      >
                        <X className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </RadixDialog.Close>
                  </div>

                  <div className="mt-4">{children}</div>
                </motion.div>
              </RadixDialog.Content>
            </div>
          </RadixDialog.Portal>
        )}
      </AnimatePresence>
    </RadixDialog.Root>
  );
};
