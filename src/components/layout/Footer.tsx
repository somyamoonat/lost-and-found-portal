import React from "react";
import { Link } from "react-router-dom";
import { collegeConfig } from "@/config/college";

/**
 * Quiet two-column footer:
 * - Left: Central desk address, phone, email, and hours from config
 * - Right: Institutional navigation links
 * - Statutory retention statement about items unclaimed after 90 days
 * - HARD BANS: Strictly NO newsletter box, NO social icon row
 */
export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-line bg-surface text-ink mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Left Column: Central Desk Location & Operating Hours */}
          <div className="space-y-4">
            <div>
              <span className="font-semibold text-[15px] text-ink block">
                {collegeConfig.institution.name}
              </span>
              <span className="text-[13px] text-ink-muted block mt-0.5">
                {collegeConfig.institution.division}
              </span>
            </div>

            <div className="text-[14px] text-ink leading-relaxed space-y-1">
              <p>
                {collegeConfig.contact.deskLocation}, {collegeConfig.contact.room}
              </p>
              <p className="text-ink-muted">
                Telephone: <span className="text-ink font-medium">{collegeConfig.contact.phone}</span>
              </p>
              <p className="text-ink-muted">
                Inquiries: <span className="text-ink font-medium">{collegeConfig.contact.email}</span>
              </p>
            </div>

            <div className="pt-2 text-[13px] text-ink-muted leading-relaxed">
              <span className="font-medium text-ink block">Operating hours:</span>
              <span>Mon – Fri 08:30 – 18:00 · Sat 10:00 – 14:00 · Sun Closed</span>
            </div>
          </div>

          {/* Right Column: Institutional Directory & Governance Links */}
          <div className="space-y-4 md:pl-8 lg:pl-16">
            <span className="font-semibold text-[14px] text-ink block">
              Portal navigation & governance
            </span>

            <nav className="grid grid-cols-2 gap-2.5 text-[14px]">
              <Link
                to="/browse"
                className="text-ink-muted hover:text-campus-green transition-colors py-1"
              >
                Browse property
              </Link>
              <Link
                to="/report"
                className="text-ink-muted hover:text-campus-green transition-colors py-1"
              >
                Report a lost item
              </Link>
              <Link
                to="/my-reports"
                className="text-ink-muted hover:text-campus-green transition-colors py-1"
              >
                My submitted reports
              </Link>
              <Link
                to="/admin"
                className="text-ink-muted hover:text-campus-green transition-colors py-1"
              >
                Administrative portal
              </Link>
              <Link
                to="/sign-in"
                className="text-ink-muted hover:text-campus-green transition-colors py-1"
              >
                Campus sign in
              </Link>
              <Link
                to="/styleguide"
                className="text-ink-muted hover:text-campus-green transition-colors py-1"
              >
                Design system reference
              </Link>
            </nav>

            {/* Unclaimed item statutory retention notice */}
            <div className="pt-4 border-t border-line">
              <p className="text-[13px] text-ink-muted leading-relaxed">
                Articles unclaimed after ninety days are transferred for verified charitable
                donation or university salvage in accordance with institutional policy.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 mt-8 border-t border-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[12px] text-ink-muted">
          <span>
            © {new Date().getFullYear()} {collegeConfig.institution.name}. All rights reserved.
          </span>
          <span>Official university public service repository</span>
        </div>
      </div>
    </footer>
  );
};
