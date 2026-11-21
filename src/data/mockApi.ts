import { placeholderItems, type Item } from "./items";
import type { GetItemsFilter, ClaimSubmission, ReportSubmission } from "./api";
import { dispatchNewItem } from "./realtime";

/**
 * Helper to simulate real network latency (400-700ms).
 */
const simulateLatency = (): Promise<void> => {
  const delay = Math.floor(Math.random() * 300) + 400; // 400ms - 700ms
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export const mockApi = {
  /**
   * Retrieves items with simulated latency and filtering.
   */
  async getItems(filter?: GetItemsFilter): Promise<{ items: Item[]; totalCount: number }> {
    await simulateLatency();

    let results = [...placeholderItems];

    // 1. Type filter (all / lost / found)
    if (filter?.type && filter.type !== "all") {
      results = results.filter((i) => i.type === filter.type);
    }

    // 2. Status filter
    if (filter?.status && filter.status !== "all") {
      results = results.filter((i) => i.status === filter.status);
    }

    // 3. Categories multi-select filter
    if (filter?.categories && filter.categories.length > 0) {
      const activeCats = filter.categories.filter((c) => c !== "all");
      if (activeCats.length > 0) {
        results = results.filter((i) => activeCats.includes(i.category));
      }
    }

    // 4. Building filter
    if (filter?.building && filter.building !== "all") {
      const bldg = filter.building.toLowerCase();
      results = results.filter(
        (i) =>
          i.buildingCode.toLowerCase() === bldg ||
          i.location.toLowerCase().includes(bldg) ||
          i.id === bldg
      );
    }

    // 5. Date range filter
    if (filter?.dateRange && filter.dateRange !== "any") {
      const now = new Date("2026-11-21T12:00:00Z").getTime(); // Consistent benchmark date
      const oneDay = 24 * 60 * 60 * 1000;
      results = results.filter((i) => {
        const itemTime = new Date(i.occurredAt).getTime();
        const diffDays = (now - itemTime) / oneDay;
        if (filter.dateRange === "today") return diffDays <= 1.2;
        if (filter.dateRange === "week") return diffDays <= 7;
        if (filter.dateRange === "month") return diffDays <= 30;
        return true;
      });
    }

    // 6. Search query filter
    if (filter?.query && filter.query.trim()) {
      const q = filter.query.toLowerCase().trim();
      results = results.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.refCode.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }

    // 7. Sort (newest vs oldest)
    results.sort((a, b) => {
      const timeA = new Date(a.occurredAt).getTime();
      const timeB = new Date(b.occurredAt).getTime();
      if (filter?.sort === "oldest") {
        return timeA - timeB;
      }
      return timeB - timeA;
    });

    const totalCount = results.length;

    // 8. Pagination offset and limit
    const offset = filter?.offset || 0;
    if (filter?.limit && filter.limit > 0) {
      results = results.slice(offset, offset + filter.limit);
    }

    return { items: results, totalCount };
  },

  /**
   * Retrieves a single item by ID or refCode, enriching with default thumbnails,
   * held location, and custody history.
   */
  async getItemById(idOrRef: string): Promise<Item | null> {
    await simulateLatency();
    const clean = idOrRef.replace(/^LF-/i, "");
    const found = placeholderItems.find(
      (i) => i.id === clean || i.id === idOrRef || i.refCode.toLowerCase() === idOrRef.toLowerCase()
    );
    if (!found) return null;

    const enriched: Item = {
      ...found,
      currentlyHeldAt: found.currentlyHeldAt || "Central Library Intake Vault, Room 104",
      thumbnails: found.thumbnails || [
        { id: "front", label: "Intake perspective", angle: "Primary angle" },
        { id: "details", label: "Markings & condition", angle: "Condition details" },
        { id: "serial", label: "Serial label & markings", angle: "Identification tag" },
      ],
      history: found.history || [
        {
          id: "h-1",
          stage: "reported",
          title: "Reported",
          timestamp: found.occurredAt,
          description: "Logged into university intake registry by finder",
        },
        {
          id: "h-2",
          stage: "handed_in",
          title: "Handed in",
          timestamp: found.occurredAt,
          description: `Surrendered at ${found.location} front security desk`,
        },
        {
          id: "h-3",
          stage: "vault",
          title: "Secured in vault",
          timestamp: found.occurredAt,
          description: "Cataloged and placed in high-security vault custody",
        },
        ...(found.status === "returned"
          ? [
              {
                id: "h-4",
                stage: "claim_received" as const,
                title: "Claim verified & released",
                timestamp: "2026-11-20T16:30:00Z",
                description: "Owner identity verified with university credentials. Item released.",
              },
            ]
          : []),
      ],
    };

    return enriched;
  },

  /**
   * Retrieves similar items in the same category or building.
   */
  async getSimilarItems(category: string, currentId: string, limit = 4): Promise<Item[]> {
    await simulateLatency();
    const clean = currentId.replace(/^LF-/i, "");
    let matches = placeholderItems.filter((i) => i.id !== clean && i.category === category);
    if (matches.length < limit) {
      const others = placeholderItems.filter((i) => i.id !== clean && i.category !== category);
      matches = [...matches, ...others];
    }
    return matches.slice(0, limit);
  },

  /**
   * Submits a claim for an item, updating in-memory item status to verified.
   */
  async submitClaim(id: string, _claimData: ClaimSubmission): Promise<{ success: boolean; refCode: string }> {
    await simulateLatency();
    const clean = id.replace(/^LF-/i, "");
    const target = placeholderItems.find((i) => i.id === clean || i.refCode.toLowerCase() === id.toLowerCase());
    if (target) {
      target.status = "verified";
      if (!target.history) {
        target.history = [];
      }
      target.history.push({
        id: `h-claim-${Date.now()}`,
        stage: "claim_received",
        title: "Claim received",
        timestamp: new Date().toISOString(),
        description: "Claim submitted by owner. Verification pending desk review.",
      });
      return { success: true, refCode: target.refCode };
    }
    return { success: true, refCode: `LF-${id}` };
  },

  /**
   * Retrieves items handed in today (first 4 items with recent timestamps).
   */
  async getHandedInToday(): Promise<Item[]> {
    await simulateLatency();
    return placeholderItems.slice(0, 4);
  },

  /**
   * Retrieves 8 recently found items for the home page showcase.
   */
  async getRecentFound(): Promise<Item[]> {
    await simulateLatency();
    return placeholderItems.slice(0, 8);
  },

  /**
   * Submits a newly reported lost or found item.
   * Generates a unique LF-XXXX reference code and adds the item to the database.
   */
  async submitReport(data: ReportSubmission): Promise<{ success: boolean; refCode: string; item: Item }> {
    await simulateLatency();
    const randomId = String(Math.floor(2100 + Math.random() * 800));
    const refCode = `LF-${randomId}`;

    const newItem: Item = {
      id: randomId,
      refCode,
      type: data.type,
      title: data.title,
      category: data.category,
      location: data.spot ? `${data.building} (${data.spot})` : data.building,
      buildingCode: data.building,
      occurredAt: data.dateTime || new Date().toISOString(),
      timeAgo: "Just now",
      status: "open",
      description: data.description,
      photo: data.photoUrl || null,
      currentlyHeldAt: data.type === "found" ? "Central Library Intake Desk" : "With claimant / unverified",
      history: [
        {
          id: `h-rep-${Date.now()}`,
          stage: "reported",
          title: data.type === "lost" ? "Lost report filed" : "Found property filed",
          timestamp: new Date().toISOString(),
          description: `Filed by ${data.contactName} (${data.contactEmail})`,
        },
      ],
    };

    placeholderItems.unshift(newItem);
    dispatchNewItem(newItem);
    return { success: true, refCode, item: newItem };
  },

  /**
   * Approves a claim in the mock catalog.
   */
  async approveClaim(claimId: string, itemId?: string): Promise<{ success: boolean }> {
    await simulateLatency();
    const target = placeholderItems.find(
      (i) => i.id === (itemId || claimId) || i.refCode.toLowerCase() === (itemId || claimId).toLowerCase()
    );
    if (target) {
      target.status = "verified";
    }
    return { success: true };
  },

  /**
   * Deactivates / withdraws a report in the mock catalog.
   */
  async withdrawReport(itemId: string): Promise<{ success: boolean }> {
    await simulateLatency();
    const clean = itemId.replace(/^LF-/i, "");
    const idx = placeholderItems.findIndex(
      (i) => i.id === clean || i.id === itemId || i.refCode.toLowerCase() === itemId.toLowerCase()
    );
    if (idx !== -1) {
      placeholderItems.splice(idx, 1);
    }
    return { success: true };
  },
};
