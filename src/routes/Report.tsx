import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PlusCircle, ShieldCheck } from "lucide-react";
import { collegeConfig } from "@/config/college";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/motion/Toast";

export const Report: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const initialTitle = searchParams.get("title") || searchParams.get("q") || "";
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState("electronics");
  const [building, setBuilding] = useState("bldg-lib");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialTitle) {
      setTitle(initialTitle);
    }
  }, [initialTitle]);

  const categoryOptions = collegeConfig.categories.map((c) => ({
    value: c.id,
    label: c.label,
    description: c.description,
  }));

  const buildingOptions = collegeConfig.buildings.map((b) => ({
    value: b.id,
    label: b.name,
    description: `${b.zone} Campus · Code: ${b.code}`,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      showToast({
        title: "Report registered with Campus Safety",
        description: "Your missing property report has been logged. We will notify you if matching articles arrive.",
        action: {
          label: "View reports",
          onClick: () => navigate("/my-reports"),
        },
      });
      navigate("/my-reports");
    }, 600);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-line pb-6 space-y-2">
        <div className="flex items-center gap-2 text-[13px] text-ink-muted">
          <span>{collegeConfig.institution.shortName} Lost & Found</span>
          <span>/</span>
          <span className="text-campus-green font-medium">Lost property intake</span>
        </div>
        <h1 className="type-h1 text-ink">Report a lost item</h1>
        <p className="type-body text-ink-muted">
          Submit details regarding misplaced property. Reports are cross-referenced with items
          surrendered at intake desks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-line rounded-[12px] p-6 shadow-subtle space-y-5">
            <h2 className="text-[18px] font-semibold text-ink">Item details</h2>

            <Input
              label="Article headline or concise title"
              placeholder="e.g. Navy blue Herschel backpack with silver zipper"
              hint="Include brand, colour, and primary visual characteristics."
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Property category"
                value={category}
                onValueChange={setCategory}
                options={categoryOptions}
              />

              <Select
                label="Last seen location or building"
                value={building}
                onValueChange={setBuilding}
                options={buildingOptions}
              />
            </div>

            <Input
              label="Approximate date misplaced"
              type="date"
              defaultValue="2026-11-21"
              hint="Intake reports are prioritized by date matching."
            />

            <div className="space-y-1.5">
              <label className="block text-[14px] font-medium text-ink leading-tight select-none">
                Distinguishing marks, contents, or serial numbers
              </label>
              <textarea
                rows={3}
                placeholder="List distinctive characteristics such as lock screen wallpapers, custom stickers, scratches, or interior contents."
                className="w-full px-3 py-2 text-[14px] bg-surface text-ink placeholder:text-ink-muted/70 rounded-[6px] border border-line shadow-subtle outline-none transition-colors focus-visible:border-campus-green focus-visible:ring-2 focus-visible:ring-campus-green focus-visible:ring-offset-2"
              />
            </div>
          </div>

          {/* Contact Verification Box */}
          <div className="bg-surface border border-line rounded-[12px] p-6 shadow-subtle space-y-5">
            <h2 className="text-[18px] font-semibold text-ink">Claimant contact information</h2>

            <Input
              label="University email address"
              type="email"
              placeholder="student.name@stjude.edu"
              hint="Notification alerts will be delivered to this verified institutional address."
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Contact telephone number (optional)"
              type="tel"
              placeholder="(555) 019-XXXX"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              leftIcon={<PlusCircle className="w-4 h-4" strokeWidth={1.5} />}
            >
              Submit property report
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => navigate("/browse")}
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Sidebar Notice */}
        <div className="space-y-6">
          <div className="bg-surface border border-line rounded-[12px] p-6 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 text-campus-green">
              <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
              <h3 className="text-[16px] font-semibold text-ink">Intake verification procedure</h3>
            </div>
            <p className="text-[13px] text-ink-muted leading-relaxed">
              When a matching article is delivered to Central Desk, campus personnel review the
              submitted serial numbers and distinguishing markings against the physical item.
            </p>
            <div className="pt-2 border-t border-line text-[12px] text-ink-muted space-y-1">
              <p>Physical collection desk: Central Library Commons 104</p>
              <p>Standard holding period: 90 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
