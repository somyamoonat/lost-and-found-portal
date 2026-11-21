import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, ShieldCheck, Check, Phone, Mail } from "lucide-react";
import { collegeConfig } from "@/config/college";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/motion/StatusChip";
import { ClaimTicketTag } from "@/components/ui/ClaimTicketTag";
import { useToast } from "@/motion/Toast";

export const ItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const code = `LF-${id || "2041"}`;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back to Browse link */}
      <div>
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          <span>Back to browse property</span>
        </Link>
      </div>

      {/* Main Item Inspection Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Item Specifications */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-line rounded-[12px] p-6 shadow-subtle space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <StatusChip status="open" label="Logged at central desk" />
                <span className="text-[13px] text-ink-muted">· Category: Electronics & computing</span>
              </div>
              <ClaimTicketTag code={code} />
            </div>

            <div className="space-y-3">
              <h1 className="type-h2 text-ink">
                Apple 14-inch MacBook Pro (Space Grey)
              </h1>
              <p className="type-body text-ink leading-relaxed">
                Found on the second floor quiet study stacks of the Main Library & Research Commons.
                The laptop is encased in a protective matte sleeve. A student transit decal is
                affixed to the underside chassis.
              </p>
            </div>

            {/* Custody Log Properties */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 bg-paper rounded-[8px] border border-line space-y-1">
                <span className="text-[12px] text-ink-muted flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-campus-green" strokeWidth={1.5} />
                  Intake building
                </span>
                <span className="text-[14px] font-medium text-ink block">
                  Main Library & Research Commons (Room 104)
                </span>
              </div>

              <div className="p-3.5 bg-paper rounded-[8px] border border-line space-y-1">
                <span className="text-[12px] text-ink-muted flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-campus-green" strokeWidth={1.5} />
                  Date logged
                </span>
                <span className="text-[14px] font-medium text-ink block">
                  21 Nov 2026, 09:15 AM
                </span>
              </div>
            </div>

            {/* Retention Notice */}
            <div className="p-4 bg-paper rounded-[8px] border border-line text-[13px] text-ink-muted leading-relaxed">
              <strong>Statutory preservation:</strong> This article is stored under vault
              supervision for {collegeConfig.policy.highValueRetentionDays} days. If unclaimed by
              the expiration date, it will be prepared for institutional transfer.
            </div>
          </div>

          {/* Verification Protocol Box */}
          <div className="bg-surface border border-line rounded-[12px] p-6 shadow-subtle space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-campus-green" strokeWidth={1.5} />
              <h2 className="text-[18px] font-semibold text-ink">
                Identity verification required before release
              </h2>
            </div>
            <p className="text-[14px] text-ink-muted leading-relaxed">
              To claim this article at the Central Desk, the owner must fulfill the following criteria:
            </p>
            <ul className="space-y-2 text-[14px] text-ink">
              {collegeConfig.policy.claimVerificationRequirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-campus-green shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Physical Claim Voucher & Desk Actions */}
        <div className="space-y-6">
          <ClaimTicketTag
            variant="ticket"
            code={code}
            itemTitle="Apple 14-inch MacBook Pro"
            buildingCode="MLC-104"
            loggedDate="21 Nov 2026, 09:15"
          />

          <div className="bg-surface border border-line rounded-[12px] p-6 shadow-subtle space-y-4">
            <h3 className="text-[16px] font-semibold text-ink">Claim this article</h3>
            <p className="text-[13px] text-ink-muted leading-relaxed">
              If this article belongs to you, submit an ownership claim to initiate desk verification.
            </p>

            <div className="space-y-2 pt-2">
              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={() => {
                  showToast({
                    title: "Ownership claim initiated",
                    description: `Verification ticket registered for ${code}. Visit Room 104 with photo ID.`,
                    action: {
                      label: "Undo",
                      onClick: () => {
                        showToast({ title: "Claim withdrawn", description: `Claim for ${code} was cancelled.` });
                      },
                    },
                  });
                }}
              >
                File ownership claim
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-center"
                onClick={() => navigate("/my-reports")}
              >
                View my claim records
              </Button>
            </div>

            <div className="pt-4 border-t border-line space-y-2 text-[12px] text-ink-muted">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-campus-green" strokeWidth={1.5} />
                <span>Central Desk: {collegeConfig.contact.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-campus-green" strokeWidth={1.5} />
                <span>Inquiries: {collegeConfig.contact.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
