import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { collegeConfig } from "@/config/college";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusChip } from "@/motion/StatusChip";
import { ClaimTicketTag } from "@/components/ui/ClaimTicketTag";

interface MockItem {
  id: string;
  code: string;
  title: string;
  category: string;
  building: string;
  date: string;
  status: "open" | "verified" | "returned";
  description: string;
}

const mockCatalog: MockItem[] = [
  {
    id: "2041",
    code: "LF-2041",
    title: "Apple 14-inch MacBook Pro (Space Grey)",
    category: "Electronics & computing",
    building: "Main Library & Research Commons",
    date: "21 Nov 2026",
    status: "open",
    description: "Space grey laptop with protective matte sleeve. Found in second floor quiet study stacks.",
  },
  {
    id: "2042",
    code: "LF-2042",
    title: "Sony WH-1000XM4 wireless headphones",
    category: "Electronics & computing",
    building: "Science Quad & Laboratories",
    date: "20 Nov 2026",
    status: "open",
    description: "Black over-ear headphones in zippered hardshell case with blue audio cable.",
  },
  {
    id: "2043",
    code: "LF-2043",
    title: "Brown leather bifold wallet",
    category: "Wallets, cards & IDs",
    building: "Student Union & Dining Hall",
    date: "19 Nov 2026",
    status: "verified",
    description: "Contains campus dining pass and state driver licence. Secured in central desk safe.",
  },
  {
    id: "2044",
    code: "LF-2044",
    title: "Stainless insulated water tumbler (32oz)",
    category: "Water bottles & thermoses",
    building: "Athletics & Recreation Complex",
    date: "18 Nov 2026",
    status: "open",
    description: "Olive green powder-coated flask with university athletics emblem.",
  },
  {
    id: "2045",
    code: "LF-2045",
    title: "Organic Chemistry 9th Edition textbook",
    category: "Books & notebooks",
    building: "Science Quad & Laboratories",
    date: "17 Nov 2026",
    status: "open",
    description: "Hardcover textbook with yellow highlighter annotations in chapters 4 through 8.",
  },
  {
    id: "2046",
    code: "LF-2046",
    title: "Set of three dorm room keys with brass carabiner",
    category: "Keys & fobs",
    building: "Founders Engineering Hall",
    date: "16 Nov 2026",
    status: "returned",
    description: "Two Yale keys and one electronic RFID key fob on a silver university split ring.",
  },
];

export const Browse: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("all");

  const buildingOptions = [
    { value: "all", label: "All campus buildings & zones" },
    ...collegeConfig.buildings.map((b) => ({
      value: b.id,
      label: b.name,
      description: `Zone: ${b.zone}`,
    })),
  ];

  const filteredItems = mockCatalog.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-line pb-6 space-y-2">
        <div className="flex items-center gap-2 text-[13px] text-ink-muted">
          <span>{collegeConfig.institution.shortName} Lost & Found</span>
          <span>/</span>
          <span className="text-campus-green font-medium">Public property catalog</span>
        </div>
        <h1 className="type-h1 text-ink">Browse found property</h1>
        <p className="type-body text-ink-muted">
          All articles logged at campus intake desks. Filter by building or search by distinctive item description.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-surface p-4 border border-line rounded-[12px] shadow-subtle">
        <div className="md:col-span-2">
          <Input
            placeholder="Search by keywords, model name, or reference code (e.g. LF-2041)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div>
          <Select
            value={selectedBuilding}
            onValueChange={setSelectedBuilding}
            options={buildingOptions}
          />
        </div>
      </div>

      {/* Results Count & Status Indicator */}
      <div className="flex items-center justify-between text-[13px] text-ink-muted">
        <span>Showing {filteredItems.length} registered articles</span>
        <span className="hidden sm:inline-block">
          Physical retrieval requires photo ID at Central Desk
        </span>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <Link
            key={item.id}
            to={`/items/${item.id}`}
            className="bg-surface border border-line rounded-[12px] p-5 shadow-subtle hover:border-campus-green transition-colors flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <StatusChip status={item.status} />
                <ClaimTicketTag code={item.code} />
              </div>
              <h3 className="text-[17px] font-semibold text-ink group-hover:text-campus-green transition-colors leading-snug">
                {item.title}
              </h3>
              <p className="text-[13px] text-ink-muted leading-relaxed line-clamp-2">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t border-line space-y-1.5 text-[12px] text-ink-muted">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-campus-green shrink-0" strokeWidth={1.5} />
                <span className="truncate">{item.building}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span>Intake: {item.date}</span>
                <span className="text-campus-green font-medium group-hover:underline">
                  View claim details →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
