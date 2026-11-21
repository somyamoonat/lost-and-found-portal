import { placeholderItems, type Item } from "./items";

/**
 * Helper to simulate real network latency (400-700ms).
 */
const simulateLatency = (): Promise<void> => {
  const delay = Math.floor(Math.random() * 300) + 400; // 400ms - 700ms
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export interface GetItemsFilter {
  query?: string;
  type?: "all" | "lost" | "found";
  status?: "all" | "open" | "verified" | "returned";
  categories?: string[];
  building?: string;
  dateRange?: "today" | "week" | "month" | "any";
  sort?: "newest" | "oldest";
  limit?: number;
  offset?: number;
}

export const api = {
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
   * Retrieves a single item by ID or refCode.
   */
  async getItemById(idOrRef: string): Promise<Item | null> {
    await simulateLatency();
    const clean = idOrRef.replace(/^LF-/i, "");
    const found = placeholderItems.find(
      (i) => i.id === clean || i.id === idOrRef || i.refCode.toLowerCase() === idOrRef.toLowerCase()
    );
    return found || null;
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
};
