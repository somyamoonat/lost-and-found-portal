/**
 * College configuration for the Lost and Found portal.
 * All institution-specific values live here so the portal can be easily retargeted.
 */

export interface CampusBuilding {
  id: string;
  name: string;
  code: string;
  zone: string;
  description: string;
}

export interface ItemCategory {
  id: string;
  label: string;
  description: string;
  retentionDays?: number;
}

export interface DeskSchedule {
  day: string;
  hours: string;
  isOpen: boolean;
}

export interface CollegeConfig {
  institution: {
    name: string;
    shortName: string;
    division: string;
    campus: string;
    portalTitle: string;
    portalSubtitle: string;
  };
  contact: {
    deskLocation: string;
    room: string;
    phone: string;
    email: string;
    emergencyPhone: string;
    inquiryNotice: string;
  };
  deskHours: {
    schedule: DeskSchedule[];
    holidayNote: string;
  };
  policy: {
    standardRetentionDays: number;
    highValueRetentionDays: number;
    dispositionMethod: string;
    claimVerificationRequirements: string[];
    unclaimedHandlingNotice: string;
  };
  buildings: CampusBuilding[];
  categories: ItemCategory[];
  referenceCodePrefix: string;
}

export const collegeConfig: CollegeConfig = {
  institution: {
    name: "St. Jude University",
    shortName: "SJU",
    division: "Campus Safety and Student Services",
    campus: "North Quad & Central Campus",
    portalTitle: "Campus lost and found",
    portalSubtitle: "Official repository for lost property across university grounds, libraries, and facilities.",
  },
  contact: {
    deskLocation: "Central Library Commons",
    room: "Service Wing 104",
    phone: "(555) 019-2831",
    email: "lostfound@stjude.edu",
    emergencyPhone: "(555) 019-2999",
    inquiryNotice: "Physical item pickups require university identification or government-issued photo ID.",
  },
  deskHours: {
    schedule: [
      { day: "Monday", hours: "08:30 – 18:00", isOpen: true },
      { day: "Tuesday", hours: "08:30 – 18:00", isOpen: true },
      { day: "Wednesday", hours: "08:30 – 18:00", isOpen: true },
      { day: "Thursday", hours: "08:30 – 18:00", isOpen: true },
      { day: "Friday", hours: "08:30 – 17:00", isOpen: true },
      { day: "Saturday", hours: "10:00 – 14:00", isOpen: true },
      { day: "Sunday", hours: "Closed", isOpen: false },
    ],
    holidayNote: "Closed on university holidays and reading recess periods.",
  },
  policy: {
    standardRetentionDays: 90,
    highValueRetentionDays: 180,
    dispositionMethod: "Donation to verified regional non-profits or certified electronic recycling.",
    claimVerificationRequirements: [
      "Physical photo identification (student ID, driver licence, or passport)",
      "Detailed corroborating item details (lock screen description, serial number, distinctive markings)",
      "Sign-off signature on physical release log at Central Desk",
    ],
    unclaimedHandlingNotice:
      "All registered articles are preserved under vault supervision for 90 days. Items unclaimed past the statutory retention timeline are transferred for charitable donation or university salvage according to institutional governance.",
  },
  buildings: [
    {
      id: "bldg-lib",
      name: "Main Library & Research Commons",
      code: "MLC",
      zone: "Central",
      description: "Quiet reading rooms, stacks, digital media lab, and basement study cafe.",
    },
    {
      id: "bldg-union",
      name: "Student Union & Dining Hall",
      code: "SUD",
      zone: "North",
      description: "Food court, campus bookstore, student government offices, and lounge areas.",
    },
    {
      id: "bldg-sci",
      name: "Science Quad & Laboratories",
      code: "SQL",
      zone: "West",
      description: "Biology, chemistry, and physics lecture halls, teaching labs, and atrium.",
    },
    {
      id: "bldg-eng",
      name: "Founders Engineering Hall",
      code: "FEH",
      zone: "East",
      description: "Computer labs, robotics makerspace, and civil engineering workshop.",
    },
    {
      id: "bldg-rec",
      name: "Athletics & Recreation Complex",
      code: "ARC",
      zone: "South",
      description: "Gymnasium, indoor running track, pool locker rooms, and squash courts.",
    },
    {
      id: "bldg-art",
      name: "Fine Arts Pavilion",
      code: "FAP",
      zone: "West",
      description: "Art studios, recital theatre, gallery spaces, and music practice rooms.",
    },
  ],
  categories: [
    {
      id: "electronics",
      label: "Electronics & computing",
      description: "Laptops, phones, tablets, chargers, headphones, and portable batteries.",
      retentionDays: 180,
    },
    {
      id: "wallets-ids",
      label: "Wallets, cards & IDs",
      description: "Campus IDs, driver licences, credit cards, purses, and wallets.",
      retentionDays: 90,
    },
    {
      id: "keys",
      label: "Keys & fobs",
      description: "Dorm room keys, vehicle key fobs, bicycle lock keys, and lanyards.",
      retentionDays: 90,
    },
    {
      id: "books-stationery",
      label: "Books & notebooks",
      description: "Textbooks, course binders, sketchbooks, notebooks, and pencil cases.",
      retentionDays: 90,
    },
    {
      id: "bags-backpacks",
      label: "Bags & backpacks",
      description: "Bookbags, gym duffels, tote bags, and briefcase cases.",
      retentionDays: 90,
    },
    {
      id: "clothing",
      label: "Clothing & outerwear",
      description: "Jackets, coats, scarves, gloves, caps, and athletic uniforms.",
      retentionDays: 45,
    },
    {
      id: "bottles-mugs",
      label: "Water bottles & thermoses",
      description: "Reusable flasks, stainless bottles, travel tumblers, and mugs.",
      retentionDays: 30,
    },
    {
      id: "eyewear",
      label: "Eyewear & cases",
      description: "Prescription glasses, reading spectacles, sunglasses, and cases.",
      retentionDays: 90,
    },
    {
      id: "other",
      label: "Miscellaneous",
      description: "Umbrellas, sporting equipment, jewellery, and miscellaneous articles.",
      retentionDays: 90,
    },
  ],
  referenceCodePrefix: "LF-",
};
