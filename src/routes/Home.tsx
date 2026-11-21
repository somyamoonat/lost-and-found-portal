import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, PlusCircle, ArrowRight, MapPin } from "lucide-react";
import { collegeConfig } from "@/config/college";
import { Button } from "@/components/ui/Button";
import { ClaimTicketTag } from "@/components/ui/ClaimTicketTag";
import { StatusChip } from "@/motion/StatusChip";
import { AnimatedNumber } from "@/motion/AnimatedNumber";

/**
 * Home route: Calm institutional gateway providing clear pathways
 * to browse found items or submit a lost property report.
 */
export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="border-b border-line bg-surface py-16 sm:py-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="max-w-[65ch] space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-campus-green">
                {collegeConfig.institution.name}
              </span>
              <span className="text-line">/</span>
              <span className="text-[13px] text-ink-muted">
                {collegeConfig.institution.division}
              </span>
            </div>
            <h1 className="type-display text-ink">
              Campus lost and found repository
            </h1>
            <p className="type-body text-ink-muted">
              Centralized custody registry for articles lost or located across university grounds,
              libraries, residence halls, and laboratory facilities.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/browse")}
              leftIcon={<Search className="w-4 h-4" strokeWidth={1.5} />}
            >
              Browse logged property
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/report")}
              leftIcon={<PlusCircle className="w-4 h-4" strokeWidth={1.5} />}
            >
              Report a lost item
            </Button>
          </div>

          {/* Intake Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 max-w-xl">
            <div className="p-3.5 bg-paper rounded-[8px] border border-line">
              <span className="text-[12px] text-ink-muted block">Campus intake facilities</span>
              <span className="text-[22px] font-semibold text-ink block mt-0.5">
                <AnimatedNumber value={collegeConfig.buildings.length} />
              </span>
            </div>
            <div className="p-3.5 bg-paper rounded-[8px] border border-line">
              <span className="text-[12px] text-ink-muted block">Statutory vault retention</span>
              <span className="text-[22px] font-semibold text-ink block mt-0.5">
                <AnimatedNumber value={collegeConfig.policy.standardRetentionDays} />
                <span className="text-[14px] font-normal text-ink-muted ml-1">days</span>
              </span>
            </div>
            <div className="p-3.5 bg-paper rounded-[8px] border border-line col-span-2 sm:col-span-1">
              <span className="text-[12px] text-ink-muted block">Central desk status</span>
              <span className="text-[15px] font-medium text-campus-green flex items-center gap-1.5 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-campus-green" />
                Open today
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Logged Articles Showcase */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-6">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <h2 className="type-h2 text-ink">Recent vault intake</h2>
            <p className="type-small text-ink-muted mt-0.5">
              Articles registered at the Central Desk within the last 48 hours.
            </p>
          </div>
          <Link
            to="/browse"
            className="text-[14px] font-medium text-campus-green hover:underline flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Item 1 */}
          <Link
            to="/items/2041"
            className="bg-surface border border-line rounded-[12px] p-5 shadow-subtle hover:border-campus-green transition-colors block space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <StatusChip status="open" label="Logged at desk" />
              <ClaimTicketTag code="LF-2041" />
            </div>
            <h3 className="text-[17px] font-semibold text-ink group-hover:text-campus-green transition-colors leading-snug">
              Apple 14-inch MacBook Pro
            </h3>
            <p className="text-[13px] text-ink-muted line-clamp-2">
              Space grey laptop with protective matte sleeve. Found on second floor study stacks.
            </p>
            <div className="pt-2 border-t border-line flex items-center justify-between text-[12px] text-ink-muted">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                Main Library Commons
              </span>
              <span>21 Nov 2026</span>
            </div>
          </Link>

          {/* Item 2 */}
          <Link
            to="/items/2042"
            className="bg-surface border border-line rounded-[12px] p-5 shadow-subtle hover:border-campus-green transition-colors block space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <StatusChip status="open" label="Logged at desk" />
              <ClaimTicketTag code="LF-2042" />
            </div>
            <h3 className="text-[17px] font-semibold text-ink group-hover:text-campus-green transition-colors leading-snug">
              Sony WH-1000XM4 headphones
            </h3>
            <p className="text-[13px] text-ink-muted line-clamp-2">
              Black wireless headphones in rigid zipper case with university lanyard attached.
            </p>
            <div className="pt-2 border-t border-line flex items-center justify-between text-[12px] text-ink-muted">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                Science Quad Lab 201
              </span>
              <span>20 Nov 2026</span>
            </div>
          </Link>

          {/* Item 3 */}
          <Link
            to="/items/2043"
            className="bg-surface border border-line rounded-[12px] p-5 shadow-subtle hover:border-campus-green transition-colors block space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <StatusChip status="verified" label="Identity verified" />
              <ClaimTicketTag code="LF-2043" />
            </div>
            <h3 className="text-[17px] font-semibold text-ink group-hover:text-campus-green transition-colors leading-snug">
              Brown leather bifold wallet
            </h3>
            <p className="text-[13px] text-ink-muted line-clamp-2">
              Contains student identification card and transit pass. Safely stored in desk vault.
            </p>
            <div className="pt-2 border-t border-line flex items-center justify-between text-[12px] text-ink-muted">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                Student Union Dining Hall
              </span>
              <span>19 Nov 2026</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};
