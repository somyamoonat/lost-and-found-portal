import React, { useState } from "react";
import {
  Package,
  Check,
  ShieldCheck,
  Clock,
  Building2,
  FileText,
  Plus,
  Minus,
  RefreshCw,
  BellRing,
} from "lucide-react";
import { collegeConfig } from "@/config/college";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { ClaimTicketTag } from "@/components/ui/ClaimTicketTag";
import { StatusChip, type ItemStatus } from "@/motion/StatusChip";
import { AnimatedNumber } from "@/motion/AnimatedNumber";
import { Skeleton } from "@/motion/Skeleton";
import { Dialog } from "@/motion/Dialog";
import { Sheet } from "@/motion/Sheet";
import { useToast } from "@/motion/Toast";
import { Reveal } from "@/motion/Reveal";
import { PageTransition } from "@/motion/PageTransition";

export const StyleguideRoute: React.FC = () => {
  const { showToast } = useToast();

  // State for interactive demos
  const [activeChipStatus, setActiveChipStatus] = useState<ItemStatus>("lost");
  const [counterValue, setCounterValue] = useState(142);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState("bldg-lib");
  const [inputValue, setInputValue] = useState("");

  const buildingOptions = collegeConfig.buildings.map((b) => ({
    value: b.id,
    label: b.name,
    description: `${b.zone} Campus · Code: ${b.code}`,
  }));

  const cycleStatus = () => {
    const sequence: ItemStatus[] = ["lost", "open", "verified", "returned", "closed", "tag"];
    const currentIndex = sequence.indexOf(activeChipStatus);
    const nextIndex = (currentIndex + 1) % sequence.length;
    setActiveChipStatus(sequence[nextIndex]);
  };

  return (
    <PageTransition className="min-h-screen bg-paper text-ink pb-24">
      {/* Top institutional identity bar */}
      <header className="border-b border-line bg-surface">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-campus-green text-surface flex items-center justify-center font-bold text-[18px] tracking-tight">
              {collegeConfig.institution.shortName}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold tracking-normal text-campus-green">
                  {collegeConfig.institution.name}
                </span>
                <span className="text-line">/</span>
                <span className="text-[12px] text-ink-muted">
                  {collegeConfig.institution.division}
                </span>
              </div>
              <h1 className="text-[18px] font-semibold text-ink leading-tight">
                {collegeConfig.institution.portalTitle} — Foundation & motion system
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-green-tint text-campus-green border border-[#C5DDD2]">
              <span className="w-1.5 h-1.5 rounded-full bg-campus-green" />
              Design system active
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSheetOpen(true)}
              leftIcon={<Clock className="w-3.5 h-3.5" strokeWidth={1.5} />}
            >
              Desk hours & policy
            </Button>
          </div>
        </div>
      </header>

      {/* Main 12-column layout container */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-16">
        {/* Section 0: Foundation Overview & System Principles */}
        <section className="space-y-4">
          <div className="max-w-[65ch]">
            <h2 className="type-h1 text-ink">Design and motion foundation</h2>
            <p className="type-body text-ink-muted mt-3">
              This styleguide establishes the visual grammar, component primitives, and motion
              discipline for the university lost and found portal. Built for institutional trust,
              calm accessibility, and verified physical retrieval workflows.
            </p>
          </div>

          {/* Quick stats with AnimatedNumber */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-4 bg-surface border border-line rounded-[12px] shadow-subtle">
              <span className="text-[12px] text-ink-muted block">Campus intake buildings</span>
              <span className="text-[28px] font-semibold text-ink block mt-1">
                <AnimatedNumber value={collegeConfig.buildings.length} />
              </span>
            </div>
            <div className="p-4 bg-surface border border-line rounded-[12px] shadow-subtle">
              <span className="text-[12px] text-ink-muted block">Active categories</span>
              <span className="text-[28px] font-semibold text-ink block mt-1">
                <AnimatedNumber value={collegeConfig.categories.length} />
              </span>
            </div>
            <div className="p-4 bg-surface border border-line rounded-[12px] shadow-subtle">
              <span className="text-[12px] text-ink-muted block">Statutory retention</span>
              <span className="text-[28px] font-semibold text-ink block mt-1">
                <AnimatedNumber value={collegeConfig.policy.standardRetentionDays} />
                <span className="text-[16px] font-normal text-ink-muted ml-1">days</span>
              </span>
            </div>
            <div className="p-4 bg-surface border border-line rounded-[12px] shadow-subtle">
              <span className="text-[12px] text-ink-muted block">Central desk response</span>
              <span className="text-[28px] font-semibold text-campus-green block mt-1">
                24<span className="text-[16px] font-normal text-ink-muted ml-1">hours</span>
              </span>
            </div>
          </div>
        </section>

        {/* Section 1: Color Palette */}
        <Reveal>
          <section className="space-y-6">
            <div className="border-b border-line pb-3">
              <h3 className="type-h2 text-ink">Colour palette</h3>
              <p className="type-small text-ink-muted mt-1">
                Flat colors strictly configured as CSS custom variables. Zero gradients, zero mesh
                orbs, and zero purple or pink.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Paper */}
              <div className="bg-surface border border-line rounded-[12px] p-3 shadow-subtle flex flex-col justify-between">
                <div className="h-16 rounded-[6px] border border-line mb-3 bg-[#F4F5F2]" />
                <div>
                  <h4 className="text-[14px] font-semibold text-ink">Paper</h4>
                  <span className="font-mono text-[12px] text-ink-muted block">#F4F5F2</span>
                  <p className="text-[12px] text-ink-muted mt-1">Page background canvas</p>
                </div>
              </div>

              {/* Surface */}
              <div className="bg-surface border border-line rounded-[12px] p-3 shadow-subtle flex flex-col justify-between">
                <div className="h-16 rounded-[6px] border border-line mb-3 bg-[#FFFFFF]" />
                <div>
                  <h4 className="text-[14px] font-semibold text-ink">Surface</h4>
                  <span className="font-mono text-[12px] text-ink-muted block">#FFFFFF</span>
                  <p className="text-[12px] text-ink-muted mt-1">Cards, dialogs, form inputs</p>
                </div>
              </div>

              {/* Line */}
              <div className="bg-surface border border-line rounded-[12px] p-3 shadow-subtle flex flex-col justify-between">
                <div className="h-16 rounded-[6px] border border-line mb-3 bg-[#DCDFD8]" />
                <div>
                  <h4 className="text-[14px] font-semibold text-ink">Line</h4>
                  <span className="font-mono text-[12px] text-ink-muted block">#DCDFD8</span>
                  <p className="text-[12px] text-ink-muted mt-1">1px structural boundary lines</p>
                </div>
              </div>

              {/* Ink */}
              <div className="bg-surface border border-line rounded-[12px] p-3 shadow-subtle flex flex-col justify-between">
                <div className="h-16 rounded-[6px] border border-line mb-3 bg-[#1A2220]" />
                <div>
                  <h4 className="text-[14px] font-semibold text-ink">Ink</h4>
                  <span className="font-mono text-[12px] text-ink-muted block">#1A2220</span>
                  <p className="text-[12px] text-ink-muted mt-1">High-contrast primary typography</p>
                </div>
              </div>

              {/* Ink Muted */}
              <div className="bg-surface border border-line rounded-[12px] p-3 shadow-subtle flex flex-col justify-between">
                <div className="h-16 rounded-[6px] border border-line mb-3 bg-[#5C6762]" />
                <div>
                  <h4 className="text-[14px] font-semibold text-ink">Ink muted</h4>
                  <span className="font-mono text-[12px] text-ink-muted block">#5C6762</span>
                  <p className="text-[12px] text-ink-muted mt-1">Secondary labels and hints</p>
                </div>
              </div>

              {/* Campus Green */}
              <div className="bg-surface border border-line rounded-[12px] p-3 shadow-subtle flex flex-col justify-between">
                <div className="h-16 rounded-[6px] mb-3 bg-[#1E5B4B]" />
                <div>
                  <h4 className="text-[14px] font-semibold text-ink">Campus green</h4>
                  <span className="font-mono text-[12px] text-ink-muted block">#1E5B4B</span>
                  <p className="text-[12px] text-ink-muted mt-1">Primary action & verified status</p>
                </div>
              </div>

              {/* Green Tint */}
              <div className="bg-surface border border-line rounded-[12px] p-3 shadow-subtle flex flex-col justify-between">
                <div className="h-16 rounded-[6px] border border-[#C5DDD2] mb-3 bg-[#E3EEE9]" />
                <div>
                  <h4 className="text-[14px] font-semibold text-ink">Green tint</h4>
                  <span className="font-mono text-[12px] text-ink-muted block">#E3EEE9</span>
                  <p className="text-[12px] text-ink-muted mt-1">Active chips & subtle backgrounds</p>
                </div>
              </div>

              {/* Brick */}
              <div className="bg-surface border border-line rounded-[12px] p-3 shadow-subtle flex flex-col justify-between">
                <div className="h-16 rounded-[6px] mb-3 bg-[#B24A2F]" />
                <div>
                  <h4 className="text-[14px] font-semibold text-ink">Brick</h4>
                  <span className="font-mono text-[12px] text-ink-muted block">#B24A2F</span>
                  <p className="text-[12px] text-ink-muted mt-1">Lost item badges and validation errors</p>
                </div>
              </div>

              {/* Slate */}
              <div className="bg-surface border border-line rounded-[12px] p-3 shadow-subtle flex flex-col justify-between">
                <div className="h-16 rounded-[6px] mb-3 bg-[#5B6770]" />
                <div>
                  <h4 className="text-[14px] font-semibold text-ink">Slate</h4>
                  <span className="font-mono text-[12px] text-ink-muted block">#5B6770</span>
                  <p className="text-[12px] text-ink-muted mt-1">Returned, closed, and inactive status</p>
                </div>
              </div>

              {/* Tag Amber */}
              <div className="bg-surface border border-line rounded-[12px] p-3 shadow-subtle flex flex-col justify-between">
                <div className="h-16 rounded-[6px] mb-3 bg-[#E3A92F]" />
                <div>
                  <h4 className="text-[14px] font-semibold text-ink">Tag amber</h4>
                  <span className="font-mono text-[12px] text-ink-muted block">#E3A92F</span>
                  <p className="text-[12px] text-ink-muted mt-1">Physical claim ticket motif ONLY</p>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Section 2: Typography Scale */}
        <Reveal>
          <section className="space-y-6">
            <div className="border-b border-line pb-3">
              <h3 className="type-h2 text-ink">Typography scale</h3>
              <p className="type-small text-ink-muted mt-1">
                Rendered with Schibsted Grotesk for body and headlines. IBM Plex Mono is reserved
                strictly for claim reference codes. Sentence case throughout.
              </p>
            </div>

            <div className="bg-surface border border-line rounded-[12px] divide-y divide-line overflow-hidden shadow-subtle">
              {/* Display */}
              <div className="p-6">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[12px] font-semibold text-ink-muted">Display</span>
                  <span className="text-[12px] text-ink-muted font-mono">
                    clamp(2.75rem, 6vw, 4.75rem) / 1.04 / -0.025em
                  </span>
                </div>
                <h1 className="type-display text-ink">St. Jude lost and found</h1>
              </div>

              {/* H1 */}
              <div className="p-6">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[12px] font-semibold text-ink-muted">Heading 1</span>
                  <span className="text-[12px] text-ink-muted font-mono">44px / 1.15 / -0.025em</span>
                </div>
                <h2 className="type-h1 text-ink">Report a missing article</h2>
              </div>

              {/* H2 */}
              <div className="p-6">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[12px] font-semibold text-ink-muted">Heading 2</span>
                  <span className="text-[12px] text-ink-muted font-mono">32px / 1.2 / -0.02em</span>
                </div>
                <h3 className="type-h2 text-ink">Recent items logged at Central Desk</h3>
              </div>

              {/* H3 */}
              <div className="p-6">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[12px] font-semibold text-ink-muted">Heading 3</span>
                  <span className="text-[12px] text-ink-muted font-mono">22px / 1.3 / -0.015em</span>
                </div>
                <h4 className="type-h3 text-ink">Verification guidelines for electronics</h4>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[12px] font-semibold text-ink-muted">Body</span>
                  <span className="text-[12px] text-ink-muted font-mono">16px / 1.6 / max 65ch</span>
                </div>
                <p className="type-body text-ink">
                  When claiming an item at the central desk, present photo identification along
                  with distinctive property details such as passcode unlock confirmation, serial
                  numbers, or unique case markings. Unclaimed articles remain secured for ninety
                  days before university transfer.
                </p>
              </div>

              {/* Small */}
              <div className="p-6">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[12px] font-semibold text-ink-muted">Small</span>
                  <span className="text-[12px] text-ink-muted font-mono">14px / 1.5</span>
                </div>
                <p className="type-small text-ink-muted">
                  Physical item claims must be finalized in person at Central Library Commons, Room 104.
                </p>
              </div>

              {/* Monospace Reservation */}
              <div className="p-6 bg-[#FAF9F5]">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[12px] font-semibold text-tag-amber">
                    IBM Plex Mono (Claim Reference Codes ONLY)
                  </span>
                  <span className="text-[12px] text-ink-muted font-mono">font-mono / 14px / 600</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="font-mono text-[14px] font-bold bg-surface px-3 py-1.5 rounded-[4px] border border-line text-ink">
                    LF-2041
                  </span>
                  <span className="font-mono text-[14px] font-bold bg-surface px-3 py-1.5 rounded-[4px] border border-line text-ink">
                    LF-0892
                  </span>
                  <span className="font-mono text-[14px] font-bold bg-surface px-3 py-1.5 rounded-[4px] border border-line text-ink">
                    LF-9104
                  </span>
                  <span className="text-[13px] text-ink-muted">
                    ← Monospace is never used for general prose or UI data.
                  </span>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Section 3: Buttons */}
        <Reveal>
          <section className="space-y-6">
            <div className="border-b border-line pb-3">
              <h3 className="type-h2 text-ink">Buttons</h3>
              <p className="type-small text-ink-muted mt-1">
                6px border radius, keyboard focus ring (2px campus green with 2px offset), and
                tactile press spring feedback (scale 0.98).
              </p>
            </div>

            <div className="bg-surface border border-line rounded-[12px] p-6 shadow-subtle space-y-6">
              {/* Variants showcase */}
              <div>
                <span className="text-[13px] font-semibold text-ink-muted block mb-3">
                  Button variants (medium size)
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">Report a lost item</Button>
                  <Button variant="secondary">Browse found property</Button>
                  <Button variant="quiet">View desk schedule</Button>
                  <Button variant="destructive">Withdraw claim request</Button>
                </div>
              </div>

              {/* Interactive states */}
              <div>
                <span className="text-[13px] font-semibold text-ink-muted block mb-3">
                  Interaction and operational states
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" leftIcon={<Package className="w-4 h-4" strokeWidth={1.5} />}>
                    With icon
                  </Button>
                  <Button variant="primary" isLoading>
                    Submitting report
                  </Button>
                  <Button variant="primary" disabled>
                    Disabled state
                  </Button>
                  <Button variant="secondary" disabled>
                    Disabled secondary
                  </Button>
                </div>
              </div>

              {/* Button sizes */}
              <div>
                <span className="text-[13px] font-semibold text-ink-muted block mb-3">
                  Size variations
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small button (32px)</Button>
                  <Button size="md">Medium button (40px)</Button>
                  <Button size="lg">Large button (48px)</Button>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Section 4: Form Inputs & Validation */}
        <Reveal>
          <section className="space-y-6">
            <div className="border-b border-line pb-3">
              <h3 className="type-h2 text-ink">Inputs with validation states</h3>
              <p className="type-small text-ink-muted mt-1">
                6px radius, 1px line border, clear actionable validation copy, and accessible
                screen-reader associations.
              </p>
            </div>

            <div className="bg-surface border border-line rounded-[12px] p-6 shadow-subtle">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Default Input */}
                <Input
                  label="Item title or short description"
                  placeholder="e.g. Navy blue Herschel backpack"
                  hint="Provide a concise headline for desk cataloging."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />

                {/* Active / Filled Input */}
                <Input
                  label="Serial number or student ID"
                  defaultValue="SJU-8921-X"
                  hint="Matches university enrollment database records."
                />

                {/* Error State */}
                <Input
                  label="University email address"
                  defaultValue="somya@external-provider.com"
                  error="Enter a valid university email address ending in @stjude.edu."
                />

                {/* Success State */}
                <Input
                  label="Claim reference verification"
                  defaultValue="LF-2041"
                  success="Reference code matches a registered article at Central Desk."
                />

                {/* Disabled Input */}
                <Input
                  label="Intake vault registry number"
                  defaultValue="VLT-SECURE-004"
                  disabled
                  hint="Managed automatically by campus safety personnel."
                />

                {/* Select dropdown */}
                <Select
                  label="Intake building or campus zone"
                  value={selectedBuilding}
                  onValueChange={setSelectedBuilding}
                  options={buildingOptions}
                />
              </div>
            </div>
          </section>
        </Reveal>

        {/* Section 5: Chips & Claim Ticket Tag Motif */}
        <Reveal>
          <section className="space-y-6">
            <div className="border-b border-line pb-3">
              <h3 className="type-h2 text-ink">Chips and claim tag motif</h3>
              <p className="type-small text-ink-muted mt-1">
                Status chips have full radius (rounded-full) and smoothly morph color states.
                Tag amber is strictly used for claim tags.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Chips Showcase */}
              <div className="bg-surface border border-line rounded-[12px] p-6 shadow-subtle space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[16px] font-semibold text-ink">Status chip variants</h4>
                  <Button size="sm" variant="quiet" onClick={cycleStatus}>
                    Cycle dynamic chip state
                  </Button>
                </div>

                <p className="text-[13px] text-ink-muted">
                  Static status chips representing the lifecycle of an item:
                </p>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <StatusChip status="lost" label="Lost" />
                  <StatusChip status="open" label="Logged at desk" />
                  <StatusChip status="verified" label="Identity verified" />
                  <StatusChip status="returned" label="Returned to owner" />
                  <StatusChip status="closed" label="Case closed" />
                </div>

                <div className="pt-4 border-t border-line">
                  <span className="text-[13px] font-semibold text-ink block mb-2">
                    Interactive morphing chip (click button above to cycle):
                  </span>
                  <div className="flex items-center gap-3">
                    <StatusChip status={activeChipStatus} />
                    <span className="text-[12px] text-ink-muted">
                      Current state: <strong className="text-ink">{activeChipStatus}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Claim Ticket Tag Motif */}
              <div className="bg-surface border border-line rounded-[12px] p-6 shadow-subtle space-y-4">
                <div>
                  <h4 className="text-[16px] font-semibold text-ink">
                    Claim ticket motif (tag amber & IBM Plex Mono)
                  </h4>
                  <p className="text-[13px] text-ink-muted mt-1">
                    Authentic institutional property tags. Amber (#E3A92F) and mono code font are
                    reserved solely for this motif.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Badge style */}
                  <div>
                    <span className="text-[12px] font-medium text-ink-muted block mb-1.5">
                      Badge variant (table and list view)
                    </span>
                    <ClaimTicketTag code="LF-2041" />
                  </div>

                  {/* Physical ticket stub style */}
                  <div>
                    <span className="text-[12px] font-medium text-ink-muted block mb-1.5">
                      Physical property intake voucher
                    </span>
                    <ClaimTicketTag
                      variant="ticket"
                      code="LF-2041"
                      itemTitle="Apple 14-inch MacBook Pro (Space Grey)"
                      buildingCode="MLC-104"
                      loggedDate="21 Nov 2026, 09:15"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Section 6: Motion System Interactive Lab */}
        <Reveal>
          <section className="space-y-6">
            <div className="border-b border-line pb-3">
              <h3 className="type-h2 text-ink">Motion system interactive lab</h3>
              <p className="type-small text-ink-muted mt-1">
                Every animation answers: what changed, where did it go, what can I press, or what is
                happening now. Reduced-motion preferences are honored globally.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Interactive AnimatedNumber */}
              <Card>
                <CardHeader>
                  <CardTitle>AnimatedNumber</CardTitle>
                  <CardDescription>
                    Smooth spring-driven counter transitions without layout shifts.
                  </CardDescription>
                </CardHeader>
                <div className="py-2">
                  <div className="text-[44px] font-bold text-campus-green leading-none">
                    <AnimatedNumber value={counterValue} />
                    <span className="text-[16px] font-normal text-ink-muted ml-2">items in vault</span>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setCounterValue((v) => v + 10)}
                      leftIcon={<Plus className="w-3.5 h-3.5" strokeWidth={1.5} />}
                    >
                      +10
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setCounterValue((v) => Math.max(0, v - 5))}
                      leftIcon={<Minus className="w-3.5 h-3.5" strokeWidth={1.5} />}
                    >
                      -5
                    </Button>
                    <Button
                      size="sm"
                      variant="quiet"
                      onClick={() => setCounterValue(Math.floor(Math.random() * 300) + 50)}
                      leftIcon={<RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />}
                    >
                      Random
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Flat Opacity Pulse Skeleton */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Skeleton pulse</CardTitle>
                    <Button
                      size="sm"
                      variant="quiet"
                      onClick={() => setShowSkeleton((v) => !v)}
                    >
                      {showSkeleton ? "Show real item" : "Simulate loading"}
                    </Button>
                  </div>
                  <CardDescription>
                    Flat opacity pulse (0.45 ↔ 0.85). Strictly NO shimmer gradients.
                  </CardDescription>
                </CardHeader>
                <div className="py-2">
                  {showSkeleton ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Skeleton shape="circle" className="w-10 h-10" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                      <Skeleton className="h-16 w-full" />
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 p-3 bg-paper rounded-[6px] border border-line">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-[6px] bg-green-tint text-campus-green flex items-center justify-center font-semibold text-[13px]">
                          LF
                        </div>
                        <div>
                          <h5 className="text-[14px] font-semibold text-ink leading-tight">
                            Sony WH-1000XM4 headphones
                          </h5>
                          <span className="text-[12px] text-ink-muted">Found at Science Quad Lab 201</span>
                        </div>
                      </div>
                      <p className="text-[13px] text-ink-muted">
                        Black over-ear headphones in protective hard zipper case.
                      </p>
                      <StatusChip status="open" />
                    </div>
                  )}
                </div>
              </Card>

              {/* Toast Trigger */}
              <Card>
                <CardHeader>
                  <CardTitle>Toast notifications</CardTitle>
                  <CardDescription>
                    Stacked, swipe-to-dismiss gesture, and undo action support.
                  </CardDescription>
                </CardHeader>
                <div className="py-2 space-y-2">
                  <Button
                    variant="primary"
                    className="w-full justify-start"
                    leftIcon={<BellRing className="w-4 h-4" strokeWidth={1.5} />}
                    onClick={() => {
                      showToast({
                        title: "Property report submitted",
                        description: "Your report for LF-2041 has been registered with Campus Safety.",
                        action: {
                          label: "Undo",
                          onClick: () => {
                            showToast({
                              title: "Submission cancelled",
                              description: "Report LF-2041 draft was preserved in local cache.",
                            });
                          },
                        },
                      });
                    }}
                  >
                    Trigger report toast (with undo)
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full justify-start"
                    leftIcon={<ShieldCheck className="w-4 h-4" strokeWidth={1.5} />}
                    onClick={() => {
                      showToast({
                        title: "Desk hours verified",
                        description: "Central Library Commons is currently open until 18:00.",
                      });
                    }}
                  >
                    Trigger informational toast
                  </Button>
                </div>
              </Card>

              {/* Dialog Trigger */}
              <Card>
                <CardHeader>
                  <CardTitle>Accessible dialog</CardTitle>
                  <CardDescription>
                    Radix dialog with AnimatePresence and flat neutral overlay.
                  </CardDescription>
                </CardHeader>
                <div className="py-2">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setDialogOpen(true)}
                  >
                    Open release verification modal
                  </Button>
                </div>
              </Card>

              {/* Sheet Trigger */}
              <Card>
                <CardHeader>
                  <CardTitle>Drawer sheet</CardTitle>
                  <CardDescription>
                    Smooth slideSheet spring drawer for policies and desk details.
                  </CardDescription>
                </CardHeader>
                <div className="py-2">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setSheetOpen(true)}
                  >
                    Open desk schedule drawer
                  </Button>
                </div>
              </Card>

              {/* Institutional Card Layout */}
              <Card>
                <CardHeader>
                  <CardTitle>Structured card</CardTitle>
                  <CardDescription>
                    12px radius, 1px border line, subtle shadow, and clean footer.
                  </CardDescription>
                </CardHeader>
                <div className="text-[13px] text-ink-muted">
                  Varying structural layouts without repetitive generic card patterns.
                </div>
                <CardFooter>
                  <span className="text-[12px] text-ink-muted">Vault Intake Zone</span>
                  <span className="font-mono text-[12px] font-semibold text-ink">ZONE-CENTRAL</span>
                </CardFooter>
              </Card>
            </div>
          </section>
        </Reveal>

        {/* Section 7: Swappable College Config Preview */}
        <Reveal>
          <section className="space-y-6">
            <div className="border-b border-line pb-3">
              <h3 className="type-h2 text-ink">Institution configuration (src/config/college.ts)</h3>
              <p className="type-small text-ink-muted mt-1">
                All campus-specific text, buildings, hours, and retention policies live in a single
                centralized configuration file so the portal can be deployed to any college.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Campus Buildings List */}
              <div className="bg-surface border border-line rounded-[12px] p-5 shadow-subtle space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-campus-green" strokeWidth={1.5} />
                  <h4 className="text-[16px] font-semibold text-ink">Campus intake buildings</h4>
                </div>
                <div className="divide-y divide-line">
                  {collegeConfig.buildings.map((b) => (
                    <div key={b.id} className="py-2.5 flex items-start justify-between gap-4">
                      <div>
                        <h5 className="text-[14px] font-medium text-ink">{b.name}</h5>
                        <p className="text-[12px] text-ink-muted mt-0.5">{b.description}</p>
                      </div>
                      <span className="font-mono text-[12px] font-semibold bg-paper px-2 py-0.5 rounded-[4px] border border-line shrink-0">
                        {b.code}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desk Schedule & Unclaimed Item Policy */}
              <div className="bg-surface border border-line rounded-[12px] p-5 shadow-subtle space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-campus-green" strokeWidth={1.5} />
                  <h4 className="text-[16px] font-semibold text-ink">Unclaimed property policy</h4>
                </div>

                <div className="p-3 bg-paper rounded-[6px] border border-line text-[13px] text-ink leading-relaxed">
                  {collegeConfig.policy.unclaimedHandlingNotice}
                </div>

                <div>
                  <h5 className="text-[13px] font-semibold text-ink mb-2">Claim verification requirements:</h5>
                  <ul className="space-y-1.5 text-[13px] text-ink-muted">
                    {collegeConfig.policy.claimVerificationRequirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-campus-green shrink-0 mt-0.5" strokeWidth={1.5} />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-line flex items-center justify-between text-[12px] text-ink-muted">
                  <span>Central Desk: {collegeConfig.contact.deskLocation}</span>
                  <span className="font-semibold text-ink">{collegeConfig.contact.phone}</span>
                </div>
              </div>
            </div>
          </section>
        </Reveal>
      </main>

      {/* Modal Dialog for Release Verification */}
      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Verify property claim release"
        description="Release of logged property requires verification of identity and matching item details."
      >
        <div className="space-y-4">
          <ClaimTicketTag
            variant="ticket"
            code="LF-2041"
            itemTitle="Apple 14-inch MacBook Pro"
            buildingCode="MLC-104"
            loggedDate="21 Nov 2026"
          />

          <div className="p-3 bg-paper rounded-[6px] border border-line text-[13px] text-ink space-y-2">
            <div className="flex items-center gap-2 font-medium text-ink">
              <ShieldCheck className="w-4 h-4 text-campus-green" strokeWidth={1.5} />
              <span>Desk checklist before physical handover:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-ink-muted text-[12px]">
              <li>Verify government or university photo ID matching claimer.</li>
              <li>Ask user to unlock device or describe specific contents.</li>
              <li>Record claimer signature in the paper custody log.</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setDialogOpen(false);
                showToast({
                  title: "Item marked as returned",
                  description: "Custody transfer for LF-2041 successfully logged.",
                  action: {
                    label: "Undo",
                    onClick: () => {
                      showToast({ title: "Status reverted", description: "LF-2041 status set back to verified." });
                    },
                  },
                });
              }}
            >
              Confirm and log release
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Side Sheet for Desk Hours & Campus Policies */}
      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Central desk hours & policy"
        description="Official schedule and property retention guidelines for St. Jude University."
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-[14px] font-semibold text-ink mb-2">Location</h4>
            <p className="text-[13px] text-ink-muted">
              {collegeConfig.contact.deskLocation}, {collegeConfig.contact.room}
            </p>
            <p className="text-[13px] text-ink-muted mt-1">
              Direct line: {collegeConfig.contact.phone}
            </p>
            <p className="text-[13px] text-ink-muted">
              Email inquiries: {collegeConfig.contact.email}
            </p>
          </div>

          <div>
            <h4 className="text-[14px] font-semibold text-ink mb-2">Weekly operating schedule</h4>
            <div className="bg-paper border border-line rounded-[6px] divide-y divide-line text-[13px]">
              {collegeConfig.deskHours.schedule.map((item) => (
                <div key={item.day} className="px-3 py-2 flex items-center justify-between">
                  <span className={item.isOpen ? "font-medium text-ink" : "text-ink-muted"}>
                    {item.day}
                  </span>
                  <span className={item.isOpen ? "text-ink" : "text-brick font-medium"}>
                    {item.hours}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-ink-muted mt-2">
              {collegeConfig.deskHours.holidayNote}
            </p>
          </div>

          <div>
            <h4 className="text-[14px] font-semibold text-ink mb-2">Statutory retention guidelines</h4>
            <p className="text-[13px] text-ink-muted leading-relaxed">
              Standard articles are retained for <strong>{collegeConfig.policy.standardRetentionDays} days</strong>.
              High-value electronics and wallets are retained for up to{" "}
              <strong>{collegeConfig.policy.highValueRetentionDays} days</strong> in the secure safe.
            </p>
          </div>

          <div className="pt-4 border-t border-line">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setSheetOpen(false)}
            >
              Close schedule drawer
            </Button>
          </div>
        </div>
      </Sheet>
    </PageTransition>
  );
};
