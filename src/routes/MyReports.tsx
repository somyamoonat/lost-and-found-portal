import React from "react";
import { Link } from "react-router-dom";
import { Plus, MapPin } from "lucide-react";
import { collegeConfig } from "@/config/college";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/motion/StatusChip";
import { ClaimTicketTag } from "@/components/ui/ClaimTicketTag";

interface ReportItem {
  id: string;
  code: string;
  title: string;
  reportedDate: string;
  status: "open" | "verified" | "returned" | "closed";
  location: string;
  category: string;
}

const mockUserReports: ReportItem[] = [
  {
    id: "2041",
    code: "LF-2041",
    title: "Apple 14-inch MacBook Pro (Space Grey)",
    reportedDate: "21 Nov 2026",
    status: "open",
    location: "Main Library & Research Commons",
    category: "Electronics & computing",
  },
  {
    id: "1983",
    code: "LF-1983",
    title: "TI-84 Plus CE graphing calculator",
    reportedDate: "04 Nov 2026",
    status: "returned",
    location: "Science Quad & Laboratories",
    category: "Electronics & computing",
  },
  {
    id: "1850",
    code: "LF-1850",
    title: "Black hydro-flask travel mug (24oz)",
    reportedDate: "12 Oct 2026",
    status: "closed",
    location: "Student Union & Dining Hall",
    category: "Water bottles & thermoses",
  },
];

export const MyReports: React.FC = () => {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[13px] text-ink-muted">
            <span>{collegeConfig.institution.shortName} Lost & Found</span>
            <span>/</span>
            <span className="text-campus-green font-medium">Claimant records</span>
          </div>
          <h1 className="type-h1 text-ink">My submitted reports</h1>
          <p className="type-body text-ink-muted">
            Track active reports and past custody verifications filed under your student identity.
          </p>
        </div>

        <Link to="/report">
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" strokeWidth={1.5} />}
          >
            File new report
          </Button>
        </Link>
      </div>

      {/* Reports List */}
      <div className="bg-surface border border-line rounded-[12px] divide-y divide-line overflow-hidden shadow-subtle">
        {mockUserReports.map((report) => (
          <div
            key={report.id}
            className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-paper/40 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <StatusChip status={report.status} />
                <ClaimTicketTag code={report.code} />
                <span className="text-[12px] text-ink-muted">· {report.category}</span>
              </div>
              <h3 className="text-[17px] font-semibold text-ink leading-snug">
                {report.title}
              </h3>
              <div className="flex items-center gap-2 text-[13px] text-ink-muted">
                <MapPin className="w-3.5 h-3.5 text-campus-green shrink-0" strokeWidth={1.5} />
                <span>{report.location}</span>
                <span>·</span>
                <span>Filed {report.reportedDate}</span>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <Link to={`/items/${report.id}`}>
                <Button variant="secondary" size="sm">
                  View record details
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
