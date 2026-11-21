import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { springs } from "@/motion/tokens";

/**
 * 404 Not Found Page:
 * - Left-aligned, plain-language message
 * - One link back to Browse
 * - Small luggage-tag shape with a string hole that swings once on load with a damped rotation spring
 * - HARD BANS: Zero gradients, zero emojis, zero buzzwords
 */
export const NotFound: React.FC = () => {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
      <div className="max-w-[65ch] space-y-8">
        {/* Swinging luggage tag motif */}
        <div className="pt-2 pb-4">
          <div className="relative inline-block">
            {/* String suspension line */}
            <div className="w-[1.5px] h-8 bg-[#8C8F88] mx-auto" />

            {/* Swinging tag body */}
            <motion.div
              style={{ transformOrigin: "top center" }}
              initial={{ rotate: -24 }}
              animate={{ rotate: 0 }}
              transition={{
                type: "spring",
                ...springs.tagSwing,
                mass: 1.1,
              }}
              className="relative w-28 bg-[#FAF6EE] border border-[#E3A92F]/60 rounded-[8px] p-3 text-center shadow-subtle select-none"
            >
              {/* String punch hole with brass grommet ring */}
              <div className="w-3.5 h-3.5 rounded-full bg-paper border border-[#8C8F88] mx-auto mb-2 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-ink/20" />
              </div>

              {/* Tag Content */}
              <span className="block text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
                Unlocated
              </span>
              <span className="font-mono text-[16px] font-bold text-ink tracking-tight block mt-0.5 bg-surface py-0.5 rounded-[4px] border border-line">
                LF-404
              </span>
              <span className="block text-[10px] text-tag-amber font-medium mt-1">
                Vault void
              </span>
            </motion.div>
          </div>
        </div>

        {/* Plain language copy */}
        <div className="space-y-3">
          <span className="text-[13px] font-medium text-campus-green block">
            Error 404
          </span>
          <h1 className="type-h1 text-ink">Page not found</h1>
          <p className="type-body text-ink-muted">
            The page or property record you requested does not exist or has been relocated within
            the campus repository. Verify the reference code or return to the property catalog.
          </p>
        </div>

        {/* Clear actionable link */}
        <div className="pt-2">
          <Link to="/browse">
            <Button
              variant="primary"
              leftIcon={<ArrowLeft className="w-4 h-4" strokeWidth={1.5} />}
            >
              Return to browse items
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
